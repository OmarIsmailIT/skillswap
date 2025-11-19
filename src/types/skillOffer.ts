import { Types } from "mongoose";

export interface ISkillOffer {
  _id?: Types.ObjectId;
  owner: Types.ObjectId;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  durationMinutes: number;
  costCredits: number;
  timeSlots?: { start: Date; end: Date }[];
  locationType?: "online" | "in_person";
  timezone?: string;
  status?: "active" | "inactive";
  bookingsCount?: number;
  avgRating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}