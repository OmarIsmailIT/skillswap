// src/lib/credits.ts
import mongoose from "mongoose";
import User from "@/src/models/User";
import Booking from "@/src/models/Booking";
import CreditTransaction from "@/src/models/CreditTransaction";

export async function completeBookingWithTransfer(
  bookingId: string,
  actorUserId: string
) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw new Error("Booking not found");
      if (booking.status !== "accepted")
        throw new Error("Booking must be accepted to complete");

      const requester = await User.findById(booking.requester).session(session);
      const provider = await User.findById(booking.provider).session(session);
      if (!requester || !provider) throw new Error("Users not found");

      if (requester.credits < booking.costCredits)
        throw new Error("Insufficient credits");

      requester.credits -= booking.costCredits;
      provider.credits += booking.costCredits;
      await requester.save({ session });
      await provider.save({ session });

      const transfer = await CreditTransaction.create(
        [
          {
            booking: booking._id,
            fromUser: requester._id,
            toUser: provider._id,
            amountCredits: booking.costCredits,
            status: "completed",
            performedAt: new Date(),
          },
        ],
        { session }
      );

      booking.status = "completed";
      booking.creditTransferId = transfer[0]._id;
      await booking.save({ session });
    });
  } finally {
    session.endSession();
  }
}
