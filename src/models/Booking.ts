// src/models/Booking.ts
import { Schema, model, models } from 'mongoose';

const BookingSchema = new Schema({
  skillOffer: { type: Schema.Types.ObjectId, ref: 'SkillOffer', required: true, index: true },
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  dateStart: { type: Date, required: true },
  dateEnd:   { type: Date, required: true },
  timezone:  { type: String, trim: true },

  status: { type: String, enum: ['pending', 'accepted', 'completed', 'canceled'], default: 'pending', index: true },

  costCredits: { type: Number, required: true, min: 1 }, // snapshot from offer at booking time

  cancellationReason: { type: String, trim: true, maxLength: 300 },
  notes: { type: String, trim: true, maxLength: 1000 },

  creditTransferId: { type: Schema.Types.ObjectId, ref: 'CreditTransaction' },
}, { timestamps: true });

BookingSchema.index({ provider: 1, status: 1, dateStart: -1 });
BookingSchema.index({ requester: 1, status: 1, dateStart: -1 });
BookingSchema.index({ skillOffer: 1, requester: 1, dateStart: 1, dateEnd: 1, status: 1 });

export default models.Booking || model('Booking', BookingSchema);