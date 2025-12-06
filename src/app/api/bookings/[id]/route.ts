// src/app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/authSession";
import mongoose from "mongoose";
import { IBooking } from "@/types";
import { completeBookingWithTransfer } from "@/lib/credits";
import { User, Booking, SkillOffer } from "@/models";
import { emitCreditUpdate, emitBookingUpdate, emitNotification } from "@/lib/socket";

/**
 * GET /api/bookings/:id
 *
 * Retrieve a single booking by its ID with populated fields for skill offer, requester, and provider.
 *
 * @param {string} id - Booking ID
 *
 * @returns {NextResponse} - Booking object with populated fields, or error response
 *
 * @throws {NextResponse} - 401 if unauthorized, 404 if booking not found, 403 if forbidden (not requester or provider), 500 if internal server error occurs
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id: bookingId } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Find booking with necessary fields populated
    const booking = await Booking.findById(bookingId)
      .select(
        "_id skillOffer requester provider dateStart dateEnd status costCredits notes cancellationReason createdAt updatedAt"
      )
      .populate("skillOffer", "title")
      .populate("requester", "name")
      .populate("provider", "name")
      .lean<IBooking>();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Ownership check: requester or provider only
    const userId = session.user.id;
    if (
      booking.requester._id.toString() !== userId &&
      booking.provider._id.toString() !== userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, booking }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Update a booking status to "accepted", "canceled", or "completed".
 * The user must be either the requester or provider of the booking.
 * If the booking is being canceled, the reserved credits of the requester will be released.
 * If the booking is being completed, the credits will be transferred from the requester to the provider.
 *
 * @param {Request} req - request object
 * @param {{ params: { id: string } }} - request parameters
 * @returns {Promise<NextResponse>} - response object
 *
 * @throws {NextResponse} - 401 if unauthorized, 404 if booking not found, 400 if invalid body, 403 if forbidden, 500 if internal server error occurs
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { status, cancellationReason } = body;
    const { id: bookingId } = await params;

    if (!["accepted", "canceled", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId)
      .populate("requester", "_id")
      .populate("provider", "_id")
      .populate("skillOffer", "_id") // ✅ needed for bookingsCount update
      .lean<IBooking>();


    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isRequester = booking.requester._id.toString() === userId;
    const isProvider = booking.provider._id.toString() === userId;

    if (!isRequester && !isProvider) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle transitions
    if (status === "accepted") {
      if (!isProvider) {
        return NextResponse.json(
          { error: "Only provider can accept" },
          { status: 403 }
        );
      }
      if (booking.status !== "pending") {
        return NextResponse.json(
          { error: "Booking not pending" },
          { status: 400 }
        );
      }

      await Booking.updateOne({ _id: booking._id }, { status: "accepted" });
      
      // Emit real-time booking update
      emitBookingUpdate(
        [booking.requester._id.toString(), booking.provider._id.toString()],
        { ...booking, status: "accepted" }
      );
      
      // Notify requester
      emitNotification(booking.requester._id.toString(), {
        type: 'success',
        title: 'Booking Accepted',
        message: 'Your booking has been accepted by the provider!',
      });
      
      return NextResponse.json(
        { success: true, message: "Booking accepted" },
        { status: 200 }
      );
    }

    if (status === "canceled") {
      if (booking.status !== "pending") {
        return NextResponse.json(
          { error: "Only pending bookings can be canceled" },
          { status: 400 }
        );
      }

      // Release reserved credits
      await User.updateOne(
        { _id: booking.requester._id },
        { $inc: { reservedCredits: -booking.costCredits } }
      );

      await Booking.updateOne(
        { _id: booking._id },
        { status: "canceled", cancellationReason }
      );
      
      // Fetch updated credits for requester
      const updatedRequester = await User.findById(booking.requester._id).select('credits reservedCredits').lean<{credits: number; reservedCredits: number}>();
      if (updatedRequester) {
        emitCreditUpdate(booking.requester._id.toString(), {
          current: updatedRequester.credits,
          reserved: updatedRequester.reservedCredits,
        });
      }
      
      // Emit real-time booking update
      emitBookingUpdate(
        [booking.requester._id.toString(), booking.provider._id.toString()],
        { ...booking, status: "canceled", cancellationReason }
      );
      
      // Notify both users
      emitNotification(booking.requester._id.toString(), {
        type: 'info',
        title: 'Booking Canceled',
        message: 'Your booking has been canceled. Reserved credits have been released.',
      });
      
      emitNotification(booking.provider._id.toString(), {
        type: 'info',
        title: 'Booking Canceled',
        message: 'A booking has been canceled.',
      });

      return NextResponse.json(
        { success: true, message: "Booking canceled" },
        { status: 200 }
      );
    }

    if (status === "completed") {
      if (!isProvider) {
        return NextResponse.json(
          { error: "Only provider can complete" },
          { status: 403 }
        );
      }
      if (booking.status === "completed") {
        return NextResponse.json(
          { error: "Booking already completed" },
          { status: 400 }
        );
      }
      if (booking.status !== "accepted") {
        return NextResponse.json(
          { error: "Booking not accepted" },
          { status: 400 }
        );
      }

      await completeBookingWithTransfer(bookingId, userId);

      // ✅ Increment SkillOffer.bookingsCount only
      await SkillOffer.updateOne(
        { _id: booking.skillOffer._id },
        { $inc: { bookingsCount: 1 } }
      );
      
      // Fetch updated credits for both users
      const [updatedRequester, updatedProvider] = await Promise.all([
        User.findById(booking.requester._id).select('credits reservedCredits').lean<{credits: number; reservedCredits: number}>(),
        User.findById(booking.provider._id).select('credits reservedCredits').lean<{credits: number; reservedCredits: number}>(),
      ]);
      
      // Emit credit updates to both users
      if (updatedRequester) {
        emitCreditUpdate(booking.requester._id.toString(), {
          current: updatedRequester.credits,
          reserved: updatedRequester.reservedCredits,
        });
      }
      
      if (updatedProvider) {
        emitCreditUpdate(booking.provider._id.toString(), {
          current: updatedProvider.credits,
          reserved: updatedProvider.reservedCredits,
        });
      }
      
      // Emit real-time booking update
      emitBookingUpdate(
        [booking.requester._id.toString(), booking.provider._id.toString()],
        { ...booking, status: "completed" }
      );
      
      // Notify both users
      emitNotification(booking.requester._id.toString(), {
        type: 'success',
        title: 'Booking Completed',
        message: `Your booking has been completed. ${booking.costCredits} credits transferred.`,
      });
      
      emitNotification(booking.provider._id.toString(), {
        type: 'success',
        title: 'Booking Completed',
        message: `Booking completed! You earned ${booking.costCredits} credits.`,
      });

      return NextResponse.json(
        { success: true, message: "Booking completed" },
        { status: 200 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
