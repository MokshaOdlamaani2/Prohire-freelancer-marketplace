import mongoose from "mongoose";

export const APPLICATION_STATUSES = ["pending", "shortlisted", "hired", "rejected"];
export const PROJECT_STATUSES = { OPEN: "open", IN_PROGRESS: "in-progress", COMPLETED: "completed" };

const applicationSchema = new mongoose.Schema(
  {
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    portfolioLink: { type: String, required: true },
    contactInfo: { type: String, default: "" },
    status: { type: String, enum: APPLICATION_STATUSES, default: "pending" },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 5 },
    description: { type: String, required: true, minlength: 20 },
    skillsRequired: {
      type: [String],
      required: true,
      validate: { validator: (arr) => arr.length > 0, message: "At least one skill required" },
    },
    budget: { type: Number, required: true, min: 0 },
    deadline: { type: Date, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    applications: [applicationSchema],
    assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    status: { type: String, enum: Object.values(PROJECT_STATUSES), default: PROJECT_STATUSES.OPEN },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
Project.APPLICATION_STATUSES = APPLICATION_STATUSES;
Project.PROJECT_STATUSES = PROJECT_STATUSES;

export default Project;
