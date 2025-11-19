// src/models/SkillOffer.ts
import { Schema, model, models } from 'mongoose';

const TimeSlotSchema = new Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
}, { _id: false });

const SkillOfferSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  title: { type: String, required: true, trim: true, maxLength: 120 },
  description: { type: String, required: true, trim: true, maxLength: 2000 },
  category: { type: String, trim: true, lowercase: true, index: true },
  tags: [{ type: String, trim: true, lowercase: true, index: true }],

  durationMinutes: { type: Number, required: true, min: 15, max: 240 },
  costCredits: { type: Number, required: true, min: 1 },

  // Optional MVP fields; allow proposer-specified time too
  timeSlots: [TimeSlotSchema],
  locationType: { type: String, enum: ['online', 'in_person'], default: 'online' },
  timezone: { type: String, trim: true },

  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },

  bookingsCount: { type: Number, default: 0, min: 0 },
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });

SkillOfferSchema.index({ title: 'text', description: 'text' });

export default models.SkillOffer || model('SkillOffer', SkillOfferSchema);