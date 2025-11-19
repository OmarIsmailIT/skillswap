import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import User from "../models/User";
import SkillOffer from "../models/SkillOffer";
import Booking from "../models/Booking";
import Review from "../models/Review";
import CreditTransaction from "../models/CreditTransaction";

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      SkillOffer.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      CreditTransaction.deleteMany({})
    ]);
    console.log("🗑️ Cleared existing collections");

    // Helper to load JSON
    const loadJSON = (filename: string) =>
      JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", filename), "utf-8"));

    // 1️⃣ Insert Users
    const users = loadJSON("users.json");
    const userDocs = await User.insertMany(users);
    console.log(`👤 Inserted ${userDocs.length} users`);

    const userMap: Record<string, mongoose.Types.ObjectId> = {};
    userDocs.forEach(u => (userMap[u.name] = u._id));

    // 2️⃣ Insert SkillOffers
    const offersRaw = loadJSON("skillOffers.json");
    const offers = offersRaw.map((offer: any) => ({
      ...offer,
      owner: userMap[offer.ownerName]
    }));
    const offerDocs = await SkillOffer.insertMany(offers);
    console.log(`📚 Inserted ${offerDocs.length} skill offers`);

    const offerMap: Record<string, mongoose.Types.ObjectId> = {};
    offerDocs.forEach(o => (offerMap[o.title] = o._id));

    // 3️⃣ Insert Bookings
    const bookingsRaw = loadJSON("bookings.json");
    const bookings = bookingsRaw.map((b: any) => ({
      ...b,
      requester: userMap[b.requesterName],
      provider: userMap[b.providerName],
      skillOffer: offerMap[b.offerTitle]
    }));
    const bookingDocs = await Booking.insertMany(bookings);
    console.log(`📅 Inserted ${bookingDocs.length} bookings`);

    // 4️⃣ Insert Reviews
    const reviewsRaw = loadJSON("reviews.json");
    const reviews = reviewsRaw.map((r: any) => {
      const booking = bookingDocs.find(
        b =>
          b.skillOffer.equals(offerMap[r.offerTitle]) &&
          b.requester.equals(userMap[r.requesterName])
      );
      if (!booking) {
        throw new Error(`No booking found for offer "${r.offerTitle}" and requester "${r.requesterName}"`);
      }
      return {
        booking: booking._id,
        author: userMap[r.authorName],
        targetUser: userMap[r.targetName],
        rating: r.rating,
        text: r.text
      };
    });
    const reviewDocs = await Review.insertMany(reviews);
    console.log(`⭐ Inserted ${reviewDocs.length} reviews`);

    // 5️⃣ Insert CreditTransactions
    const transactionsRaw = loadJSON("creditTransactions.json");
    const transactions = transactionsRaw.map((t: any) => {
      const booking = bookingDocs.find(
        b =>
          b.skillOffer.equals(offerMap[t.offerTitle]) &&
          b.requester.equals(userMap[t.requesterName])
      );
      if (!booking) {
        throw new Error(`No booking found for offer "${t.offerTitle}" and requester "${t.requesterName}"`);
      }
      return {
        booking: booking._id,
        fromUser: userMap[t.fromName],
        toUser: userMap[t.toName],
        amountCredits: t.amountCredits,
        status: t.status,
        performedAt: new Date(t.performedAt)
      };
    });
    const transactionDocs = await CreditTransaction.insertMany(transactions);
    console.log(`💰 Inserted ${transactionDocs.length} credit transactions`);

    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

seed();