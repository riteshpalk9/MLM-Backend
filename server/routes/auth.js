import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Generate unique referral code
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let referrer = null;
    let level = 0;

    // If referral code provided, validate it
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }

      // Check if referrer has reached the limit
      if (referrer.referrals.length >= 8) {
        return res
          .status(400)
          .json({ message: "Referrer has reached maximum referral limit" });
      }

      // Determine user level based on referrer's level
      level = referrer.level + 1;
      if (level > 2) {
        return res
          .status(400)
          .json({ message: "Maximum referral depth reached" });
      }
    }

    // Generate unique referral code for new user
    let newReferralCode;
    do {
      newReferralCode = generateReferralCode();
    } while (await User.findOne({ referralCode: newReferralCode }));

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      referralCode: newReferralCode,
      referredBy: referralCode || null,
      referrals: [],
      level,
      wallet: 0,
      isActive: true,
    });

    // Update referrer's referrals array
    if (referrer) {
      referrer.referrals.push(newReferralCode);
      await User.findByIdAndUpdate(referrer._id, {
        referrals: referrer.referrals,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        level: user.level,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        level: user.level,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
