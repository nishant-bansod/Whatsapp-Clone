const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Message = require('../src/models/Message');

const MONGODB_URI = process.env.MONGODB_URI;

function toDateFromEpochSeconds(sec) {
  if (!sec) return new Date();
  return new Date(Number(sec) * 1000);
}

function pickWaId(value, msg) {
  return (
    value?.contacts?.[0]?.wa_id ||
    msg?.from ||
    msg?.to ||
    value?.statuses?.[0]?.recipient_id ||
    null
  );
}

function toDirection(value, msg, waId) {
  if (msg?.from && waId && msg.from === waId) return 'inbound';
  return 'outbound';
}

async function upsertMessageFromPayload(value) {
  const msgs = value?.messages || [];
  for (const msg of msgs) {
    const waId = pickWaId(value, msg);
    const contactName = value?.contacts?.[0]?.profile?.name || null;

    const doc = {
      messageId: msg?.id || null,
      metaMsgId: msg?.context?.id || msg?.meta_msg_id || null,
      waId,
      contactName,
      direction: toDirection(value, msg, waId),
      type: msg?.type || 'unknown',
      text: msg?.text?.body || null,
      media: undefined,
      timestamp: toDateFromEpochSeconds(msg?.timestamp),
      status: 'none',
      statusHistory: [],
      from: msg?.from || null,
      to: value?.metadata?.phone_number_id || null,
      conversationId: value?.messages?.[0]?.context?.id || null
    };

    if (msg?.image) {
      doc.type = 'image';
      doc.media = {
        url: msg.image?.link || null,
        mimeType: msg.image?.mime_type || null,
        caption: msg.image?.caption || null
      };
    }
    if (msg?.video) doc.type = 'video';
    if (msg?.audio) doc.type = 'audio';
    if (msg?.document) doc.type = 'document';

    if (doc.direction === 'outbound') {
      doc.status = 'sent';
      doc.statusHistory.push({ status: 'sent', at: new Date() });
    }

    const filter = doc.messageId
      ? { messageId: doc.messageId }
      : { waId: doc.waId, timestamp: doc.timestamp, text: doc.text };
    await Message.updateOne(filter, { $setOnInsert: doc }, { upsert: true });
  }
}

async function applyStatusUpdates(value) {
  const statuses = value?.statuses || [];
  for (const s of statuses) {
    const id = s?.id || s?.meta_msg_id;
    const waId = s?.recipient_id;
    const newStatus = s?.status || 'unknown';
    const at = toDateFromEpochSeconds(s?.timestamp);

    const filter = id ? { $or: [{ messageId: id }, { metaMsgId: id }] } : { waId };
    const update = {
      $set: { status: newStatus },
      $push: { statusHistory: { status: newStatus, at } }
    };

    const res = await Message.updateOne(filter, update);
    if (res.matchedCount === 0) {
      console.warn('No message found for status payload id:', id);
    }
  }
}

async function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const payload = JSON.parse(raw);
  
  // Handle the actual payload structure from the sample files
  const value = payload?.metaData?.entry?.[0]?.changes?.[0]?.value || payload?.entry?.[0]?.changes?.[0]?.value;

  if (!value) {
    console.warn('Skipping file (no value):', filePath);
    return;
  }

  if (value?.messages?.length) {
    await upsertMessageFromPayload(value);
  }
  if (value?.statuses?.length) {
    await applyStatusUpdates(value);
  }
}

async function main(dir) {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    await processFile(path.join(dir, f));
  }

  await mongoose.disconnect();
  console.log('Done.');
}

const dirArg = process.argv[2];
if (!dirArg) {
  console.error('Usage: node scripts/ingest.js "<dir path>"');
  process.exit(1);
}
main(dirArg).catch((err) => {
  console.error(err);
  process.exit(1);
});


