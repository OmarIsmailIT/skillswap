// src/models/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxLength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    hashedPassword: { type: String, required: true },
    bio: { type: String, trim: true, maxLength: 500 },
    avatarUrl: { type: String, trim: true },
    topSkills: [{ type: String, trim: true, lowercase: true }],
    skillsOffered: [{ type: Schema.Types.ObjectId, ref: "SkillOffer", trim: true, lowercase: true, index: true }],
    skillsRequested: [
      { type: String, trim: true, lowercase: true, index: true },
    ],

    credits: { type: Number, default: 2, min: 0 },

    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },

    emailVerifiedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);
UserSchema.index({ name: 1 });

export default models.User || model("User", UserSchema);
