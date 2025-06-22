import express from "express";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import Earning from "../models/Earning.js";
const router = express.Router();

// Create purchase and distribute earnings
router.post("/", async (req, res) => {
  try {
    const { amount, description } = req.body;
    const userId = req.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid purchase amount" });
    }

    const isValid = amount >= 1000;

    // Create purchase
    const purchase = await Purchase.create({
      userId,
      amount: parseFloat(amount),
      description: description || "Purchase",
      isValid,
    });

    // If purchase is valid, distribute earnings
    if (isValid) {
      await distributeEarnings(userId, purchase, req.io);
    }

    res.status(201).json({
      _id: purchase._id,
      userId: purchase.userId,
      amount: purchase.amount,
      description: purchase.description,
      isValid: purchase.isValid,
      createdAt: purchase.createdAt,
    });
  } catch (error) {
    console.error("Purchase creation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user purchases
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.userId });
    res.json(purchases);
  } catch (error) {
    console.error("Purchases fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Distribute earnings function
async function distributeEarnings(buyerUserId, purchase, io) {
  try {
    const buyer = await User.findById(buyerUserId);
    if (!buyer || !buyer.referredBy) return;

    // Level 1 earning (5%)
    const level1Referrer = await User.findOne({
      referralCode: buyer.referredBy,
    });
    if (level1Referrer) {
      const level1Earning = purchase.amount * 0.05;

      // Create earning record
      await Earning.create({
        userId: level1Referrer._id,
        fromUserId: buyerUserId,
        amount: level1Earning,
        level: 1,
        purchaseId: purchase._id,
      });

      // Update wallet
      await User.findByIdAndUpdate(level1Referrer._id, {
        wallet: level1Referrer.wallet + level1Earning,
      });

      // Real-time notification
      if (io) {
        io.to(level1Referrer._id.toString()).emit("earning-notification", {
          amount: level1Earning,
          from: buyer.name,
          level: 1,
          timestamp: new Date(),
        });
      }

      // Level 2 earning (1%) - only if level1 referrer has a referrer
      if (level1Referrer.referredBy) {
        const level2Referrer = await User.findOne({
          referralCode: level1Referrer.referredBy,
        });
        if (level2Referrer) {
          const level2Earning = purchase.amount * 0.01;

          // Create earning record
          await Earning.create({
            userId: level2Referrer._id,
            fromUserId: buyerUserId,
            amount: level2Earning,
            level: 2,
            purchaseId: purchase._id,
          });

          // Update wallet
          await User.findByIdAndUpdate(level2Referrer._id, {
            wallet: level2Referrer.wallet + level2Earning,
          });

          // Real-time notification
          if (io) {
            io.to(level2Referrer._id.toString()).emit("earning-notification", {
              amount: level2Earning,
              from: buyer.name,
              level: 2,
              timestamp: new Date(),
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error distributing earnings:", error);
  }
}

export default router;
