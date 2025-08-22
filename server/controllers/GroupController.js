const Group = require('../models/Group');
const Player = require('../models/Player');

// GET groups by player email
exports.getGroupsByPlayerEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const player = await Player.findOne({ email }).populate('groups', 'groupName tournament');

    if (!player || !player.groups.length) {
      return res.status(404).json({ error: 'Player or groups not found' });
    }

    const formattedGroups = player.groups.map(g => ({
      id: g._id,
      name: g.groupName,
      tournament: g.tournament,
    }));

    res.json(formattedGroups);
  } catch (err) {
    console.error('❌ Error fetching player groups:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET single group
exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id).populate('players', 'name email points');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      groupName: group.groupName,
      tournament: group.tournament,
      owner: group.owner,
      gamemode: group.gamemode,
      members: group.players,
    });
  } catch (err) {
    console.error('❌ Error fetching group by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST create group
exports.createGroup = async (req, res) => {
  try {
    const { groupName, tournament, gamemode, email } = req.body;

    if (!groupName || !tournament || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await Group.findOne({ groupName });
    if (existing) {
      return res.status(409).json({ error: 'Group already exists' });
    }

    const newGroup = new Group({ groupName, tournament, gamemode, owner: email });
    await newGroup.save();

    // add group to player
    await Player.updateOne({ email }, { $push: { groups: newGroup._id } });

    res.status(201).json({
      message: 'Group registered',
      group: {
        id: newGroup._id,
        name: newGroup.groupName,
        tournament: newGroup.tournament,
        gamemode: newGroup.gamemode,
        owner: newGroup.owner,
      },
    });
  } catch (err) {
    console.error('❌ Error creating group:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST add player to group
exports.addPlayerToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;

    const player = await Player.findOne({ email });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // add player <-> group references
    if (!player.groups.includes(group._id)) {
      player.groups.push(group._id);
      await player.save();
    }

    if (!group.players.includes(player._id)) {
      group.players.push(player._id);
      await group.save();
    }

    res.json({ message: `Player ${email} added to group ${group.groupName}` });
  } catch (err) {
    console.error('❌ Error adding player to group:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
