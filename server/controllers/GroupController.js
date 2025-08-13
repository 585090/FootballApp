const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

exports.getGroupsByPlayerEmail = async (req, res) => {
  const email = req.params.email;

  try {
    const player = await getDb().collection('players').findOne({ email });

    if (!player || !player.groups) {
      return res.status(404).json({ error: 'Player or groups not found' });
    }

    const groups = await getDb()
      .collection('groups')
      .find({ _id: { $in: player.groups } })
      .project({ groupName: 1, tournament: 1 })
      .toArray();

    const formattedGroups = groups.map(group => ({
      id: group._id,
      name: group.groupName,
      tournament: group.tournament
    }));

    res.json(formattedGroups);
  } catch (err) {
    console.error('Error fetching player groups:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getGroupById = async (req, res) => {
  const groupId = req.params.id;

  if (!ObjectId.isValid(groupId)) {
    return res.status(400).json({ error: 'Invalid group ID format' });
  }

  try {
    const group = await getDb().collection('groups').findOne({ _id: new ObjectId(groupId) });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

      const members = await getDb().collection('players')
        .find({ groups: new ObjectId(groupId) })
        .project({ name: 1, email: 1, points: 1, _id: 0 })
        .toArray();

    console.log("gamemodeId from backend:", group.gamemode);
    res.json({
      groupName: group.groupName,
      tournament: group.tournament,
      owner: group.owner,
      gamemode: group.gamemode,
      members: members
    });

  } catch (err) {
    console.error('Error fetching group by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.createGroup = async (req, res) => {
    const { groupName, tournament, gamemode, email } = req.body;
    
    if (!groupName || !tournament) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingGroup = await getDb().collection('groups').findOne({ groupName });
    if (existingGroup) {
      return res.status(409).json({ error: 'Group already exists' });
    }

    const newGroup = {
        groupName,
        tournament,
        gamemode,
        owner: email
    };

    try {

      const result = await getDb().collection('groups').insertOne(newGroup);

      await getDb().collection('players').updateOne(
        { email: email },
        { $push: { groups: result.insertedId } });

      console.log('Received on server:', newGroup.groupName, 'by', newGroup.owner);    
      
      return res.status(201).json({
          message: 'Group registered',
          group: {
          id: result.insertedId,
          name: newGroup.groupName,
          tournament: newGroup.tournament,
          gamemode: Number(newGroup.gamemode),
          owner: newGroup.owner
    }}); 

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

exports.addPlayerToGroup = async (req, res) => {
    const { groupId } = req.params;
    const {email} = req.body;

    if (!ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    
    if (!email) {
      return res.status(400).json({ error: 'Player email is required' });
    }

    try {
      const group = await getDb().collection('groups').findOne({ _id: new ObjectId(groupId) });
      
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const updateResult = await getDb().collection('players').updateOne(
        { email: email },
        { $addToSet: { groups: new ObjectId(groupId) } }  // $addToSet avoids duplicates
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }

      res.json({ message: `Player ${email} added to group ${group.groupName}` });

    } catch (error) {
      console.error('Error adding player to group:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

}