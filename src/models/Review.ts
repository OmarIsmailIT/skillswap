// src/models/Review.ts
import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema({
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  author:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  rating: { type: Number, required: true, min: 1, max: 5 },
  text:   { type: String, trim: true, maxLength: 1000 },
}, { timestamps: true });

ReviewSchema.index({ targetUser: 1, createdAt: -1 });
ReviewSchema.index({ booking: 1, author: 1 }, { unique: true }); // one review per author per booking

export default models.Review || model('Review', ReviewSchema);