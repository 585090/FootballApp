const Group = require('../models/Group');
const Player = require('../models/Player');

// GET groups by player email
exports.getGroupsByPlayerEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const player = await Player.findOne({ email })
      .populate('groups', 'groupName tournament gamemode owner');

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player.groups || []);
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

    // 👀 Normalize email
    const cleanEmail = email.toLowerCase();

    // Check existing group
    const existing = await Group.findOne({ groupName });
    if (existing) {
      return res.status(409).json({ error: 'Group already exists' });
    }

    // Create new group
    const newGroup = new Group({
      groupName,
      tournament,
      gamemode,
      owner: cleanEmail,
    });
    await newGroup.save();
    console.log("✅ New group saved:", newGroup._id);

    // Fetch player
    const player = await Player.findOne({ email: cleanEmail });
    if (!player) {
      console.error("❌ No player found with email:", cleanEmail);
      return res.status(404).json({ error: "Player not found" });
    }
    console.log("✅ Found player:", player._id);

    // Update player's groups
    player.groups.push(newGroup._id);
    await player.save();
    console.log("✅ Player updated with new group:", player.groups);

    // Update group's players
    newGroup.players.push(player._id);
    await newGroup.save();
    console.log("✅ Group updated with new player:", newGroup.players);

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
    res.status(500).json({ error: 'Internal server error', detail: err.message });
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

exports.removePlayerFromGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const { email } = req.body;
    console.log("Removing player:", email, "from group:", groupId);
    const player = await Player.findOne({ email });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    await Player.updateOne(
      { _id: player._id },
      { $pull: { groups: group._id } }
    );

    await Group.updateOne(
      { _id: group._id },
      { $pull: { players: player._id } }
    );

  } catch (err) {
    console.error('❌ Error removing player from group:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.resetPlayerScores = async (req, res) => {
  try {
    const { groupId } = req.params;
    await Player.updateMany(
      { groups: groupId },
      { $set: { points: 0 } }
    );
    res.json({ message: 'Player scores reset to 0' });
  } catch (err) {
    console.error('❌ Error resetting player scores:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};