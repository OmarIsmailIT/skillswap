// src/models/Review.ts
import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // 🔑 New field: link review directly to an OfferSkill
    skillOffer: { type: Schema.Types.ObjectId, ref: 'SkillOffer', required: true, index: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxLength: 1000 },
  },
  { timestamps: true }
);

// Indexes for performance
ReviewSchema.index({ provider: 1, createdAt: -1 });
ReviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true }); // one review per author per booking
ReviewSchema.index({ skillOffer: 1, createdAt: -1 }); // 🔑 fast lookups by OfferSkill

export default models.Review || model('Review', ReviewSchema);