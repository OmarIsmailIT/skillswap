import { Types } from "mongoose";

export interface ICreditTransaction {
  _id?: Types.ObjectId;
  booking: Types.ObjectId;
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  amountCredits: number;
  status: "completed" | "reversed";
  performedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}