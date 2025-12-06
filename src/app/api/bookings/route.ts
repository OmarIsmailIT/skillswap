// src/app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {Booking, SkillOffer, User} from "@/models";
import { auth } from "@/lib/authSession";
import { createBookingSchema } from "@/lib/validators/booking";
import { IUser, ISkillOffer, IBooking } from "@/types";

/**
 * Create a new booking
 *
 * @param {Request} req - request object
 *
 * @returns {Promise<NextResponse>} - response object
 *
 * @throws {NextResponse} - 401 if unauthorized, 400 if body is invalid, 404 if offer or user not found, 409 if overlapping booking found, 500 if internal server error occurs
 */

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const parsed = createBookingSchema.parse(body);
    const { skillOfferId, dateStart, dateEnd, timezone } = parsed;

    const [offer, user, overlap] = await Promise.all([
      SkillOffer.findById(skillOfferId).lean<ISkillOffer>(),
      User.findById(session.user.id).lean<IUser>(),
      Booking.findOne({
        skillOffer: skillOfferId,
        requester: session.user.id,
        dateStart: { $lt: new Date(dateEnd) },
        dateEnd: { $gt: new Date(dateStart) },
        status: { $in: ["pending", "accepted"] },
      }).lean<IBooking>(),
    ]);

    // 1) Validate offer (lean for speed)
    if (!offer || offer.status !== "active") {
      return NextResponse.json(
        { error: "Offer not available" },
        { status: 400 }
      );
    }

    // 2) Prevent self-booking
    if (offer.owner.toString() === session.user.id) {
      return NextResponse.json(
        { error: "Cannot book your own offer" },
        { status: 400 }
      );
    }

    // 3) Check credits (lean for speed)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const effectiveBalance = user.credits - (user.reservedCredits || 0);
    if (effectiveBalance < offer.costCredits) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 400 }
      );
    }

    // 4) Prevent overlapping bookings for same offer
    if (overlap) {
      return NextResponse.json(
        { error: "You already booked this time slot" },
        { status: 400 }
      );
    }

    // 5) Reserve credits atomically + create booking
    // Instead of a heavy transaction, use $inc for atomic reservation
    await User.updateOne(
      { _id: session.user.id },
      { $inc: { reservedCredits: offer.costCredits } }
    );

    await Booking.create({
      skillOffer: offer._id,
      requester: session.user.id,
      provider: offer.owner,
      dateStart: new Date(dateStart),
      dateEnd: new Date(dateEnd),
      timezone,
      status: "pending",
      costCredits: offer.costCredits, // snapshot
    });

    return NextResponse.json(
      { success: true, message: "Booking created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.issues.map((issue: any) => issue.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings
 *
 * Retrieve a list of bookings filtered by role, status, and date range.
 *
 * @param {Request} req - Request object
 * @returns {Promise<NextResponse>} - Response object
 *
 * @example
 * GET /api/bookings?role=requester&status=pending&dateStart=2022-01-01&dateEnd=2022-01-31&page=1&limit=10
 *
 * @throws {NextResponse} - 401 if unauthorized, 500 if internal server error occurs
 */

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);

    // Filters
    const role = searchParams.get("role"); // requester | provider | all
    const status = searchParams.get("status"); // pending | accepted | completed | canceled
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const dateStart = searchParams.get("dateStart");
    const dateEnd = searchParams.get("dateEnd");

    const query: any = {};

    // Role filter
    if (role === "requester") {
      query.requester = session.user.id;
    } else if (role === "provider") {
      query.provider = session.user.id;
    } else {
      // default: show both
      query.$or = [
        { requester: session.user.id },
        { provider: session.user.id },
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (dateStart || dateEnd) {
      query.dateStart = {};
      if (dateStart) query.dateStart.$gte = new Date(dateStart);
      if (dateEnd) query.dateStart.$lte = new Date(dateEnd);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Query with lean + projection for performance
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .select(
          "_id skillOffer requester provider dateStart dateEnd status costCredits cancellationReason"
        )
        .populate("skillOffer", "title")
        .populate("requester", "name")
        .populate("provider", "name")
        .sort({ dateStart: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query),
    ]);

    const itemsPerPage = Math.min(limit, total);
    return NextResponse.json(
      {
        success: true,
        bookings,
        page,
        itemsPerPage,
        limit,
        total,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
