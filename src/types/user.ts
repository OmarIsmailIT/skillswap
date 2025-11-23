import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  hashedPassword: string;
  bio?: string;
  avatarUrl?: string;
  skillsOffered: string[];
  skillsRequested: string[];
  topSkills?: string[];
  credits: number;
  reservedCredits: number;
  ratingAvg?: number;
  reviewsCount?: number;
  emailVerifiedAt?: Date;
  isActive?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}