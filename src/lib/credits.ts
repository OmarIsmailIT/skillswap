import mongoose from "mongoose";
import User from "@/models/User";
import Booking from "@/models/Booking";
import CreditTransaction from "@/models/CreditTransaction";

/**
 * Completes a booking and transfers credits from requester to provider.
 * Deducts from both reservedCredits and credits of requester,
 * increments provider credits, and logs a CreditTransaction.
 */
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


      if (requester.reservedCredits < booking.costCredits) {
        throw new Error("Insufficient reserved credits");
      }

      // Deduct from requester
      requester.reservedCredits -= booking.costCredits;
      requester.credits -= booking.costCredits;

      // Add to provider
      provider.credits += booking.costCredits;

      await requester.save({ session });
      await provider.save({ session });

      // Create transaction record
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

      // Update booking
      booking.status = "completed";
      booking.creditTransferId = transfer[0]._id;
      await booking.save({ session });
    });
  } finally {
    session.endSession();
  }
}
