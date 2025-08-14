const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    messageId: { type: String, index: true, unique: true, sparse: true },
    metaMsgId: { type: String, index: true },
    waId: { type: String, index: true, required: true },
    contactName: { type: String },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'audio', 'video', 'document', 'sticker', 'location', 'contacts', 'unknown'],
      default: 'text'
    },
    text: { type: String },
    media: {
      url: String,
      mimeType: String,
      caption: String
    },
    timestamp: { type: Date, index: true },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed', 'unknown', 'none'],
      default: 'none',
      index: true
    },
    statusHistory: [{ status: String, at: Date }],
    from: String,
    to: String,
    conversationId: String
  },
  { timestamps: true, collection: 'processed_messages' }
);

MessageSchema.index({ waId: 1, timestamp: -1 });

module.exports = mongoose.model('Message', MessageSchema);


