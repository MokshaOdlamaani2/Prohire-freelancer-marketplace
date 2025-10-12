// routes/project.js
const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const router = express.Router();

const Project = require("../models/Project");
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const sendResponse = (res, status, success, message, data = null) => {
  res.status(status).json({ success, message, data });
};

const projectSchema = Joi.object({
  title: Joi.string().min(5).required(),
  description: Joi.string().min(20).required(),
  skillsRequired: Joi.array().items(Joi.string().min(1)).min(1).required(),
  budget: Joi.number().min(0).required(),
  deadline: Joi.date().iso().required(),
});

const applySchema = Joi.object({
  portfolioLink: Joi.string().uri().required(),
  contactInfo: Joi.string().optional().allow(""),
});

// --- CLIENT ROUTES ---

router.get("/my", auth, role(["client"]), async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user.id })
      .populate("applications.freelancerId", "name email")
      .populate("assignedFreelancer", "name email");

    sendResponse(res, 200, true, "Client projects fetched", projects);
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, false, "Failed to fetch client projects");
  }
});

router.post("/", auth, role(["client"]), async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) return sendResponse(res, 400, false, error.details[0].message);

  try {
    const project = new Project({
      ...req.body,
      deadline: new Date(req.body.deadline),
      client: req.user.id,
      status: Project.PROJECT_STATUSES.OPEN,
    });

    await project.save();
    await project.populate("client", "name email");

    sendResponse(res, 201, true, "Project created", project);
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, false, "Project creation failed");
  }
});

router.delete("/:id", auth, role(["client"]), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return sendResponse(res, 400, false, "Invalid project ID");

  try {
    const project = await Project.findById(id);
    if (!project) return sendResponse(res, 404, false, "Project not found");
    if (project.client.toString() !== req.user.id)
      return sendResponse(res, 403, false, "Unauthorized");
    if (project.status !== Project.PROJECT_STATUSES.OPEN)
      return sendResponse(res, 400, false, "Cannot delete project in-progress/completed");

    await project.deleteOne();
    sendResponse(res, 200, true, "Project deleted");
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, false, "Deletion failed");
  }
});

router.patch(
  "/:projectId/applicants/:freelancerId/status",
  auth,
  role(["client"]),
  async (req, res) => {
    const { projectId, freelancerId } = req.params;
    const { status } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(projectId) ||
      !mongoose.Types.ObjectId.isValid(freelancerId)
    ) {
      return sendResponse(res, 400, false, "Invalid project or freelancer ID");
    }

    const validStatuses = ["pending", "shortlisted", "hired", "rejected"];
    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, false, "Invalid status value");
    }

    try {
      const project = await Project.findOne({
        _id: projectId,
        "applications.freelancerId": freelancerId,
      });

      if (!project) return sendResponse(res, 404, false, "Project or applicant not found");
      if (project.client.toString() !== req.user.id) {
        return sendResponse(res, 403, false, "Unauthorized");
      }

      const updateFields = { "applications.$.status": status };
      if (status === "hired") {
        updateFields.assignedFreelancer = freelancerId;
        updateFields.status = Project.PROJECT_STATUSES.IN_PROGRESS;
      }

      const updatedProject = await Project.findOneAndUpdate(
        { _id: projectId, "applications.freelancerId": freelancerId },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      const updatedApplication = updatedProject.applications.find(
        (app) => app.freelancerId.toString() === freelancerId
      );

      let content = "";
      if (status === "shortlisted") {
        content = `🎉 You have been shortlisted for the project "${updatedProject.title}"`;
      } else if (status === "hired") {
        content = `✅ You have been hired for the project "${updatedProject.title}"`;
      } else {
        content = `ℹ️ Your application status for "${updatedProject.title}" is now "${status}"`;
      }

      const notification = await Notification.create({
        sender: req.user.id,
        receiver: freelancerId,
        content,
      });

      // ✅ Emit via req.io (attached in server.js)
      if (req.io) {
        req.io.to(freelancerId.toString()).emit("new_notification", {
          content,
          sender: req.user.id,
          timestamp: new Date(),
        });
      }

      return sendResponse(
        res,
        200,
        true,
        "Applicant status updated and freelancer notified",
        updatedApplication
      );
    } catch (err) {
      console.error("🔥 Error during applicant status update:", err);
      return sendResponse(res, 500, false, "Failed to update status and notify freelancer");
    }
  }
);

// Admin fix route (unchanged)
router.patch("/fix-applicant-data", auth, role(["admin"]), async (req, res) => {
  try {
    const projects = await Project.find({
      "applications.portfolioLink": { $exists: false },
    });

    let fixedCount = 0;

    for (const project of projects) {
      let modified = false;

      project.applications.forEach((app) => {
        if (!app.portfolioLink || app.portfolioLink.trim() === "") {
          app.portfolioLink = "https://default-portfolio-link.com";
          modified = true;
        }
        if (!app.contactInfo || app.contactInfo.trim() === "") {
          app.contactInfo = "No contact info provided";
          modified = true;
        }
      });

      if (modified) {
        await project.save();
        fixedCount++;
      }
    }

    return sendResponse(res, 200, true, `Fixed applicant data in ${fixedCount} projects`);
  } catch (error) {
    console.error("🔥 Error fixing applicant data:", error);
    return sendResponse(res, 500, false, "Failed to fix applicant data");
  }
});

// Mark complete (unchanged)
router.patch("/:id/complete", auth, role(["freelancer"]), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid project ID" });
  }

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!project.assignedFreelancer || project.assignedFreelancer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (project.status === Project.PROJECT_STATUSES.COMPLETED) {
      return res.status(400).json({ success: false, message: "Project already completed" });
    }

    project.status = Project.PROJECT_STATUSES.COMPLETED;
    await project.save();

    res.status(200).json({ success: true, message: "Project marked as completed" });
  } catch (error) {
    console.error("🔥 Error marking project completed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- PUBLIC ROUTES ---

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ status: Project.PROJECT_STATUSES.OPEN })
      .populate("client", "name email")
      .select("-applications.portfolioLink -applications.contactInfo");

    sendResponse(res, 200, true, "Projects fetched", projects);
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, false, "Failed to fetch projects");
  }
});

router.get("/proposals/my", auth, role(["freelancer"]), async (req, res) => {
  try {
    const projects = await Project.find({
      "applications.freelancerId": req.user.id,
    })
      .populate("client", "name email")
      .populate("applications.freelancerId", "name email")
      .populate("assignedFreelancer", "name email");

    const proposals = projects.map((project) => {
      const myApplication = project.applications.find(
        (app) => app.freelancerId._id.toString() === req.user.id
      );
      return {
        projectId: project._id,
        title: project.title,
        description: project.description,
        status: myApplication.status,
        appliedOn: myApplication.createdAt,
        client: project.client,
      };
    });

    sendResponse(res, 200, true, "Freelancer proposals fetched", proposals);
  } catch (err) {
    console.error("❌ Failed to fetch freelancer proposals:", err);
    sendResponse(res, 500, false, "Server error");
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return sendResponse(res, 400, false, "Invalid project ID");

  try {
    const project = await Project.findById(id)
      .populate("client", "name email")
      .populate("applications.freelancerId", "name email")
      .populate("assignedFreelancer", "name email");

    if (!project) return sendResponse(res, 404, false, "Project not found");

    sendResponse(res, 200, true, "Project fetched", project);
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, false, "Failed to fetch project");
  }
});

router.put("/:id", auth, role(["client"]), async (req, res) => {
  const { id } = req.params;
  const { error } = projectSchema.validate(req.body);
  if (error) return sendResponse(res, 400, false, error.details[0].message);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, false, "Invalid project ID");
  }

  try {
    const project = await Project.findById(id);
    if (!project) return sendResponse(res, 404, false, "Project not found");
    if (project.client.toString() !== req.user.id)
      return sendResponse(res, 403, false, "Unauthorized");

    if (project.status !== Project.PROJECT_STATUSES.OPEN) {
      return sendResponse(res, 400, false, "Only OPEN projects can be edited");
    }

    project.title = req.body.title;
    project.description = req.body.description;
    project.skillsRequired = req.body.skillsRequired;
    project.budget = req.body.budget;
    project.deadline = new Date(req.body.deadline);

    await project.save();
    sendResponse(res, 200, true, "Project updated successfully", project);
  } catch (err) {
    console.error("✏️ Edit error:", err);
    sendResponse(res, 500, false, "Project update failed");
  }
});

module.exports = router;
