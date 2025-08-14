const mongoose = require('mongoose');
const Message = require('../src/models/Message');

const MONGODB_URI = process.env.MONGODB_URI;

// Sample data from the JSON files
const samplePayloads = [
  {
    "metaData": {
      "entry": [
        {
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "15550123456",
                  "phone_number_id": "123456789"
                },
                "contacts": [
                  {
                    "profile": {
                      "name": "John Doe"
                    },
                    "wa_id": "1234567890"
                  }
                ],
                "messages": [
                  {
                    "from": "1234567890",
                    "id": "wamid.HBgLMTIzNDU2Nzg5MBABABIYFjNBMDJENDlBQjA2QjA2QjA2QjA2QjA",
                    "timestamp": "1703123456",
                    "text": {
                      "body": "Hello! How are you?"
                    },
                    "type": "text"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  },
  {
    "metaData": {
      "entry": [
        {
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "15550123456",
                  "phone_number_id": "123456789"
                },
                "contacts": [
                  {
                    "profile": {
                      "name": "John Doe"
                    },
                    "wa_id": "1234567890"
                  }
                ],
                "messages": [
                  {
                    "from": "1234567890",
                    "id": "wamid.HBgLMTIzNDU2Nzg5MBABABIYFjNBMDJENDlBQjA2QjA2QjA2QjA2QjB",
                    "timestamp": "1703123457",
                    "text": {
                      "body": "I'm doing great, thanks for asking!"
                    },
                    "type": "text"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  },
  {
    "metaData": {
      "entry": [
        {
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "15550123456",
                  "phone_number_id": "123456789"
                },
                "statuses": [
                  {
                    "id": "wamid.HBgLMTIzNDU2Nzg5MBABABIYFjNBMDJENDlBQjA2QjA2QjA2QjA2QjA",
                    "status": "delivered",
                    "timestamp": "1703123458",
                    "recipient_id": "1234567890"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  },
  {
    "metaData": {
      "entry": [
        {
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "15550123456",
                  "phone_number_id": "123456789"
                },
                "statuses": [
                  {
                    "id": "wamid.HBgLMTIzNDU2Nzg5MBABABIYFjNBMDJENDlBQjA2QjA2QjA2QjA2QjA",
                    "status": "read",
                    "timestamp": "1703123459",
                    "recipient_id": "1234567890"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  },
  {
    "metaData": {
      "entry": [
        {
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "15550123456",
                  "phone_number_id": "123456789"
                },
                "contacts": [
                  {
                    "profile": {
                      "name": "Jane Smith"
                    },
                    "wa_id": "9876543210"
                  }
                ],
                "messages": [
                  {
                    "from": "9876543210",
                    "id": "wamid.HBgLOTg3NjU0MzIxMBABABIYFjNBMDJENDlBQjA2QjA2QjA2QjA2QjA",
                    "timestamp": "1703123460",
                    "text": {
                      "body": "Hi there! Can we schedule a meeting?"
                    },
                    "type": "text"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  },
  {
    "metaData": {
      "entry": [
        {
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "15550123456",
                  "phone_number_id": "123456789"
                },
                "contacts": [
                  {
                    "profile": {
                      "name": "Jane Smith"
                    },
                    "wa_id": "9876543210"
                  }
                ],
                "messages": [
                  {
                    "from": "9876543210",
                    "id": "wamid.HBgLOTg3NjU0MzIxMBABABIYFjNBMDJENDlBQjA2QjA2QjA2QjA2QjB",
                    "timestamp": "1703123461",
                    "text": {
                      "body": "Sure! How about tomorrow at 2 PM?"
                    },
                    "type": "text"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  }
];

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
    console.log(`Processed message: ${doc.text}`);
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
    } else {
      console.log(`Updated status to ${newStatus} for message: ${id}`);
    }
  }
}

async function processPayload(payload) {
  const value = payload?.metaData?.entry?.[0]?.changes?.[0]?.value || payload?.entry?.[0]?.changes?.[0]?.value;

  if (!value) {
    console.warn('Skipping payload (no value)');
    return;
  }

  if (value?.messages?.length) {
    await upsertMessageFromPayload(value);
  }
  if (value?.statuses?.length) {
    await applyStatusUpdates(value);
  }
}

async function main() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  console.log('Processing sample payloads...');
  for (const payload of samplePayloads) {
    await processPayload(payload);
  }

  await mongoose.disconnect();
  console.log('Ingestion completed successfully!');
}

main().catch((err) => {
  console.error('Error during ingestion:', err);
  process.exit(1);
});
