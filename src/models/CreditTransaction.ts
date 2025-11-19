// src/models/CreditTransaction.ts
import { Schema, model, models } from 'mongoose';

const CreditTransactionSchema = new Schema({
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },

  fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  toUser:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  amountCredits: { type: Number, required: true, min: 1 },

  status: { type: String, enum: ['completed', 'reversed'], default: 'completed', index: true },
  performedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Prevent duplicate transfers for the same booking and direction
CreditTransactionSchema.index({ booking: 1, fromUser: 1, toUser: 1 }, { unique: true });

export default models.CreditTransaction || model('CreditTransaction', CreditTransactionSchema);