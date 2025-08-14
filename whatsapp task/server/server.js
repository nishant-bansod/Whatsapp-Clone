require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const Message = require('./src/models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || '*' } });

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

async function checkAndSeedDatabase() {
  const count = await Message.countDocuments();
  if (count === 0) {
    console.log('Database is empty, seeding with sample data...');
    try {
      // Sample data
      const sampleMessages = [
        {
          messageId: 'wamid.HBgLMTIzNDU2Nzg5MBABABIYFjNBMDJENDlBQjA2QjA2QjA2QjA2QjA',
          waId: '1234567890',
          contactName: 'John Doe',
          direction: 'inbound',
          type: 'text',
          text: 'Hello! How are you?',
          timestamp: new Date('2023-12-21T10:30:56.000Z'),
          status: 'read',
          statusHistory: [
            { status: 'sent', at: new Date('2023-12-21T10:30:56.000Z') },
            { status: 'delivered', at: new Date('2023-12-21T10:30:58.000Z') },
            { status: 'read', at: new Date('2023-12-21T10:30:59.000Z') }
          ],
          from: '1234567890',
          to: '123456789'
        },
        {
          messageId: 'wamid.HBgLMTIzNDU2Nzg5MBABABIYFjNBMDJENDlBQjA2QjA2QjA2QjA2QjB',
          waId: '1234567890',
          contactName: 'John Doe',
          direction: 'inbound',
          type: 'text',
          text: "I'm doing great, thanks for asking!",
          timestamp: new Date('2023-12-21T10:30:57.000Z'),
          status: 'sent',
          statusHistory: [{ status: 'sent', at: new Date('2023-12-21T10:30:57.000Z') }],
          from: '1234567890',
          to: '123456789'
        },
        {
          messageId: 'wamid.HBgLOTg3NjU0MzIxMBABABIYFjNBMDJENDlBQjA2QjA2QjA2QjA2QjA',
          waId: '9876543210',
          contactName: 'Jane Smith',
          direction: 'inbound',
          type: 'text',
          text: 'Hi there! Can we schedule a meeting?',
          timestamp: new Date('2023-12-21T10:31:00.000Z'),
          status: 'sent',
          statusHistory: [{ status: 'sent', at: new Date('2023-12-21T10:31:00.000Z') }],
          from: '9876543210',
          to: '123456789'
        },
        {
          messageId: 'wamid.HBgLOTg3NjU0MzIxMBABABIYFjNBMDJENDlBQjA2QjA2QjA2QjA2QjB',
          waId: '9876543210',
          contactName: 'Jane Smith',
          direction: 'inbound',
          type: 'text',
          text: 'Sure! How about tomorrow at 2 PM?',
          timestamp: new Date('2023-12-21T10:31:01.000Z'),
          status: 'sent',
          statusHistory: [{ status: 'sent', at: new Date('2023-12-21T10:31:01.000Z') }],
          from: '9876543210',
          to: '123456789'
        }
      ];
      
      await Message.insertMany(sampleMessages);
      console.log('Database seeded successfully with sample data!');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  } else {
    console.log(`Database has ${count} messages`);
  }
}

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  
  // Check if database is empty and seed if needed
  await checkAndSeedDatabase();
}

connectDb().catch((err) => {
  console.error('Mongo connection error', err);
  process.exit(1);
});

io.on('connection', () => {});

if (process.env.ENABLE_CHANGE_STREAMS === 'true') {
  try {
    Message.watch().on('change', (change) => {
      if (change.operationType === 'insert') {
        io.emit('message:new', change.fullDocument);
      } else if (change.operationType === 'update' || change.operationType === 'replace') {
        io.emit('message:update', { _id: change.documentKey._id, ...change.updateDescription });
      }
    });
  } catch (e) {
    console.warn('Change streams not enabled or not supported:', e.message);
  }
}

// Routes
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/conversations', async (req, res) => {
  const pipeline = [
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: '$waId',
        lastMessage: { $first: '$text' },
        lastType: { $first: '$type' },
        lastStatus: { $first: '$status' },
        lastTimestamp: { $first: '$timestamp' },
        contactName: { $first: '$contactName' },
        totalMessages: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        waId: '$_id',
        lastMessage: 1,
        lastType: 1,
        lastStatus: 1,
        lastTimestamp: 1,
        contactName: 1,
        totalMessages: 1
      }
    },
    { $sort: { lastTimestamp: -1 } }
  ];
  const results = await Message.aggregate(pipeline);
  res.json(results);
});

app.get('/api/messages', async (req, res) => {
  const waId = req.query.wa_id;
  if (!waId) return res.status(400).json({ error: 'wa_id is required' });
  const messages = await Message.find({ waId }).sort({ timestamp: 1 }).lean();
  res.json(messages);
});

app.post('/api/send', async (req, res) => {
  const { waId, text } = req.body;
  if (!waId || !text) return res.status(400).json({ error: 'waId and text are required' });

  const now = new Date();
  const doc = await Message.create({
    messageId: null,
    metaMsgId: null,
    waId,
    contactName: null,
    direction: 'outbound',
    type: 'text',
    text,
    timestamp: now,
    status: 'sent',
    statusHistory: [{ status: 'sent', at: now }],
    from: 'business',
    to: waId
  });

  io.emit('message:new', doc);
  res.status(201).json(doc);
});

const port = process.env.PORT || 3002;
server.listen(port, '0.0.0.0', () => console.log(`API listening on :${port}`));


