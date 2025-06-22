import express from "express";
import User from "../models/User.js";
import Earning from "../models/Earning.js";

const router = express.Router();

// Get total earnings report
router.get("/earnings", async (req, res) => {
  try {
    const userId = req.userId;

    // Get all earnings for this user
    const earnings = await Earning.find({ userId });

    const totalEarnings = earnings.reduce(
      (sum, earning) => sum + earning.amount,
      0
    );

    // Group by level
    const earningsByLevel = {};
    const level1Earnings = earnings.filter((e) => e.level === 1);
    const level2Earnings = earnings.filter((e) => e.level === 2);

    if (level1Earnings.length > 0) {
      earningsByLevel.level1 = {
        total: level1Earnings.reduce((sum, e) => sum + e.amount, 0),
        count: level1Earnings.length,
      };
    }

    if (level2Earnings.length > 0) {
      earningsByLevel.level2 = {
        total: level2Earnings.reduce((sum, e) => sum + e.amount, 0),
        count: level2Earnings.length,
      };
    }

    // Get recent earnings with user details
    const recentEarnings = [];
    const sortedEarnings = earnings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    for (const earning of sortedEarnings) {
      const fromUser = await User.findById(earning.fromUserId);
      recentEarnings.push({
        ...earning,
        fromUserId: {
          name: fromUser ? fromUser.name : "Unknown",
          email: fromUser ? fromUser.email : "Unknown",
        },
      });
    }

    res.json({
      totalEarnings,
      earningsByLevel,
      recentEarnings,
    });
  } catch (error) {
    console.error("Earnings report error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get referral earnings report
router.get("/referral-earnings", async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const referralEarnings = [];

    // Get direct referrals with their earnings
    for (const referralCode of user.referrals || []) {
      const referral = await User.findOne({ referralCode });
      if (referral) {
        // Get earnings from this referral
        const earnings = await Earning.find({
          userId: userId,
          fromUserId: referral._id,
        });

        const totalEarned = earnings.reduce(
          (sum, earning) => sum + earning.amount,
          0
        );

        referralEarnings.push({
          referral: {
            id: referral._id,
            name: referral.name,
            email: referral.email,
            referralCode: referral.referralCode,
            wallet: referral.wallet,
          },
          totalEarned,
          earningsCount: earnings.length,
        });
      }
    }

    res.json(referralEarnings);
  } catch (error) {
    console.error("Referral earnings report error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
