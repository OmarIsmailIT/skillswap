import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Offer from "@/src/models/SkillOffer";
import { createOfferSchema } from "@/src/lib/validators/offer";
import { auth } from "@/src/lib/authSession";
import User from "@/src/models/User";




/**
 * Create a new skill offer
 * 
 * @param {Request} req - request object
 * 
 * @returns {Promise<NextResponse>} - response object
 * 
 * @throws {NextResponse} - 400 if body is invalid, 401 if unauthorized, 409 if offer with same title already exists, 500 if internal server error occurs
 */
export async function POST(req: Request) {
  try {
    // ✅ Check session
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(session.user?.name);

    await connectDB();

    // ✅ Parse and validate body
    const body = await req.json();
    const parsed = createOfferSchema.parse(body);

    const existingOffer = await Offer.findOne({ title: parsed.title });
    if (existingOffer) {
      return NextResponse.json(
        { error: "Offer with this title already exists" },
        { status: 409 }
      );
    }

    // ✅ Attach owner from session
    const offer = await Offer.create({
      ...parsed,
      owner: session.user.id,
    });

    // ✅ Sync with user.skillsOffered
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { skillsOffered: offer._id }, // avoid duplicates
    });

    return NextResponse.json(
      { success: true, message: "Offer created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.issues.map((issue: any) => issue.message) },
        { status: 400 }
      );
    }
    if (error.code === 11000) {
      // Mongo duplicate key fallback
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}


/**
 * GET /api/offers
 *
 * Homepage browse of active skill offers with search and pagination.
 *
 * @param {Request} req - Request object
 * @returns {NextResponse} - NextResponse object
 *
 * @example
 * GET /api/offers?page=1&limit=10&search=javascript
 *
 * @throws {Error} - If an unexpected error occurs
 */
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      50
    );
    const search = (searchParams.get("search") || "").trim();

    // Only show active offers in homepage browse
    const baseQuery: any = { status: "active" };

    const query = { ...baseQuery };

    if (search) {
      // 1) Try matching people by name (one or many users)
      const matchingUsers = await User.find({
        name: { $regex: search, $options: "i" },
      })
        .select("_id")
        .lean();

      if (matchingUsers.length > 0) {
        // People search wins if any match
        query.owner = { $in: matchingUsers.map((u) => u._id) };
      } else {
        // 2) Fall back to skill search (title/description/tags)
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ];
      }
    }

    // Query offers with pagination
    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate({
          path: "owner",
          select: "name avatarUrl ratingAvg reviewsCount",
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title description tags costCredits durationMinutes owner")
        .lean(),
      Offer.countDocuments(query),
    ]);

    const itemsPerPage = Math.min(limit, offers.length);

    return NextResponse.json({
      offers,
      pagination: {
        total,
        itemsPerPage,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
