import { Types } from "mongoose";

export interface IReview {
  _id?: Types.ObjectId;
  booking: Types.ObjectId;
  author: Types.ObjectId;
  targetUser: Types.ObjectId;
  rating: number;
  text?: string;
  createdAt?: Date;
  updatedAt?: Date;
}