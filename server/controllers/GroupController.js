const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await getDb().collection('groups').find().toArray();

    const sanitizedGroups = groups.map(group => ({
      id: group._id,
      name: group.groupName,
      tournament: group.tournament,
    }));

    res.json(sanitizedGroups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Failed to get groups' });
  }
};


exports.createGroup = async (req, res) => {
    const { groupName, tournament } = req.body;
    
    if (!groupName || !tournament) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newGroup = {
        groupName,
        tournament
    };

    const result = await getDb().collection('groups').insertOne(newGroup);
    console.log('Received on server:', newGroup.groupName);    
    return res.status(201).json({
        message: 'Group registered',
        group: {
        id: result.insertedId,
        name: newGroup.groupName,
        tournament: newGroup.tournament
    }});
}