import express from "express";
import User from "../models/User.js";
const router = express.Router();

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      level: user.level,
      wallet: user.wallet,
      referrals: user.referrals,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get referral tree
router.get("/referrals", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get direct referrals
    const direct = [];
    for (const referralCode of user.referrals) {
      const referralUser = await User.findOne({ referralCode });
      if (referralUser) {
        direct.push({
          _id: referralUser._id,
          name: referralUser.name,
          email: referralUser.email,
          referralCode: referralUser.referralCode,
          level: referralUser.level,
          wallet: referralUser.wallet,
          createdAt: referralUser.createdAt,
          referrals: referralUser.referrals,
        });
      }
    }

    // Get indirect referrals (level 2)
    const indirect = [];
    for (const directReferral of direct) {
      const directUser = await User.findById(directReferral._id);
      if (directUser && directUser.referrals) {
        for (const indirectReferralCode of directUser.referrals) {
          const indirectUser = await User.findOne({
            referralCode: indirectReferralCode,
          });
          if (indirectUser) {
            indirect.push({
              _id: indirectUser._id,
              name: indirectUser.name,
              email: indirectUser.email,
              referralCode: indirectUser.referralCode,
              level: indirectUser.level,
              wallet: indirectUser.wallet,
              createdAt: indirectUser.createdAt,
              referredBy: directReferral.referralCode,
            });
          }
        }
      }
    }

    res.json({
      direct,
      indirect,
      totalDirect: direct.length,
      totalIndirect: indirect.length,
    });
  } catch (error) {
    console.error("Referrals fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
