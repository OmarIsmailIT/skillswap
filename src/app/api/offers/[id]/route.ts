import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SkillOffer, User } from "@/models";
import { auth } from "@/lib/authSession";
import { updateOfferSchema } from "@/lib/validators/offer";


/**
 * GET /api/offers/:id
 *
 * Retrieve a single skill offer by ID with owner data
 *
 * @param {string} id - Skill offer ID
 *
 * @returns {NextResponse} - Offer object with owner data
 *
 * @throws {NextResponse} - 400 if no ID is provided, 404 if offer not found, 500 if internal server error occurs
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // no need for await here
    await connectDB();

    if (!id) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }

    const offer = await SkillOffer.findById(id)
      .populate({
        path: "owner",
        model: "User",
        select: "name avatarUrl ratingAvg reviewsCount credits",
      })
      .select(
        "title description tags costCredits durationMinutes locationType bookingsCount avgRating owner category"
      )
      .lean();

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, offer },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Update a skill offer by its ID.
 *
 * @param {Request} req - request object
 * @param {{ params: { id: string } }} - request parameters
 * @returns {Promise<NextResponse>} - response object
 *
 * @throws {NextResponse} - 401 if unauthorized, 404 if offer not found, 400 if body is invalid, 500 if internal server error occurs
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
    const parsed = updateOfferSchema.parse(body);

    const { id } = await params;
    const offer = await SkillOffer.findOneAndUpdate(
      { _id: id, owner: session.user.id },
      { $set: parsed },
      { new: true }
    );

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found or not owned" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      offer,
      message: "Offer updated successfully",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { errors: error.issues.map((i: any) => i.message) },
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
 * DELETE /api/offers/:id
 *
 * Delete a skill offer by its ID. Only the owner of the offer can delete it.
 *
 * @param {string} id - Skill offer ID
 *
 * @returns {NextResponse} - Success message with 200 status code
 *
 * @throws {NextResponse} - 401 if unauthorized, 404 if offer not found, 400 if no ID is provided, 500 if internal server error occurs
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }
    await connectDB();
    const offer = await SkillOffer.findOneAndDelete({
      _id: id,
      owner: session.user.id,
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found or not owned" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Offer deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/offers/:id
 *
 * Activate or deactivate a skill offer by its ID. Only the owner of the offer can update its status.
 *
 * @param {string} id - Skill offer ID
 *
 * @returns {NextResponse} - Success message with 200 status code
 *
 * @throws {NextResponse} - 401 if unauthorized, 404 if offer not found, 400 if no ID is provided, 500 if internal server error occurs
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }
    await connectDB();
    const offer = await SkillOffer.findOne({
      _id: id,
      owner: session.user.id,
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found or not owned" },
        { status: 404 }
      );
    }
    // change the status of the skillOffer to activate it or deactivate it
    if (offer.status === "active") {
      offer.status = "inactive";
    } else {
      offer.status = "active";
    }
    await offer.save();

    return NextResponse.json(
      { success: true, message: "Offer updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
