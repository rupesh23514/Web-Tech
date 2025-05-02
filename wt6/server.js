const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'personalInfoDB';

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
let db;

async function connectToDatabase() {
  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    return client;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

// API Routes
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await db.collection('contacts').find({}).toArray();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const contact = req.body;
    const result = await db.collection('contacts').insertOne(contact);
    res.status(201).json({ 
      id: result.insertedId,
      ...contact 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await db.collection('contacts').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  try {
    const result = await db.collection('contacts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ message: 'Contact updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const result = await db.collection('contacts').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
async function startServer() {
  const client = await connectToDatabase();
  
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
  
  // Handle shutdown
  process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  });
}

startServer();