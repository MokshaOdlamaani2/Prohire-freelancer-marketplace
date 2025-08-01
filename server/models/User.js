const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String },
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
  projectTitle: { type: String, required: true },
  imageUrl: { type: String },
  description: { type: String },
  externalLink: { type: String },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },

  role: {
    type: String,
    enum: ["client", "freelancer", "admin"],
    required: true,
  },

  // Shared fields
  skills: { type: [String], default: [] },
  hourlyRate: { type: Number, min: 0 },
  profileBio: { type: String, maxlength: 500 },

  portfolioLinks: { type: [String], default: [] }, // external links
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review", default: [] }],

  // Freelancer-only fields (use only if role === freelancer)
  title: { type: String, minlength: 3 },
  bio: { type: String, maxlength: 1000 },
  experience: { type: [experienceSchema], default: [] },
  portfolio: { type: [portfolioSchema], default: [] },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
