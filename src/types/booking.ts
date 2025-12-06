import { Types } from "mongoose";

export interface IBooking {
  _id?: Types.ObjectId;
  skillOffer: Types.ObjectId;
  requester: Types.ObjectId;
  provider: Types.ObjectId;
  dateStart: Date;
  dateEnd: Date;
  timezone?: string;
  status: "pending" | "accepted" | "completed" | "canceled";
  costCredits: number;
  cancellationReason?: string;
  notes?: string;
  creditTransferId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
