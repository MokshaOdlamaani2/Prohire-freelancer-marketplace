const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const router = express.Router();

const Project = require("../models/Project");
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Helper for consistent API responses
const sendResponse = (res, status, success, message, data = null) => {
  res.status(status).json({ success, message, data });
};

// Validation schemas
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

// 🔍 Get projects created by logged-in client
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

// ➕ Create new project
router.post("/", auth, role(["client"]), async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) return sendResponse(res, 400, false, error.details[0].message);

  try {
    const project = new Project({
      ...req.body,
      deadline: new Date(req.body.deadline), // ✅ Ensures Date is parsed explicitly
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


// ❌ Delete project
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



// === Existing PATCH route for updating applicant status ===
router.patch(
  "/:projectId/applicants/:freelancerId/status",
  auth,
  role(["client"]),
  async (req, res) => {
    const { projectId, freelancerId } = req.params;
    const { status } = req.body;

    console.log("🔄 Updating status:", { projectId, freelancerId, status });

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
      // Fetch the project with the matching application
      const project = await Project.findOne({
        _id: projectId,
        "applications.freelancerId": freelancerId,
      });

      if (!project) return sendResponse(res, 404, false, "Project or applicant not found");

      if (project.client.toString() !== req.user.id) {
        return sendResponse(res, 403, false, "Unauthorized");
      }

      // Prepare update object
      const updateFields = {
        "applications.$.status": status,
      };

      if (status === "hired") {
        updateFields.assignedFreelancer = freelancerId;
        updateFields.status = Project.PROJECT_STATUSES.IN_PROGRESS;
      }

      // Update the project atomically
      const updatedProject = await Project.findOneAndUpdate(
        { _id: projectId, "applications.freelancerId": freelancerId },
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      // Find updated application to return
      const updatedApplication = updatedProject.applications.find(
        (app) => app.freelancerId.toString() === freelancerId
      );

      // Create Notification content
      let content = "";
      if (status === "shortlisted") {
        content = `🎉 You have been shortlisted for the project "${updatedProject.title}"`;
      } else if (status === "hired") {
        content = `✅ You have been hired for the project "${updatedProject.title}"`;
      } else {
        content = `ℹ️ Your application status for "${updatedProject.title}" is now "${status}"`;
      }

      // Create notification
      const notification = await Notification.create({
        sender: req.user.id,
        receiver: freelancerId,
        content,
      });

      console.log("✅ Notification created:", notification);

      // Emit real-time notification via Socket.IO if available
      if (global.io) {
        global.io.to(freelancerId.toString()).emit("new_notification", {
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

// === NEW: Admin-only route to fix inconsistent applicant data ===
router.patch(
  "/fix-applicant-data",
  auth,
  role(["admin"]), // Only admins can run this
  async (req, res) => {
    try {
      // Fix missing portfolioLink and empty contactInfo, etc.
      const projects = await Project.find({
        "applications.portfolioLink": { $exists: false },
      });

      let fixedCount = 0;

      for (const project of projects) {
        let modified = false;

        project.applications.forEach((app) => {
          // Fix missing portfolioLink with placeholder if empty or missing
          if (!app.portfolioLink || app.portfolioLink.trim() === "") {
            app.portfolioLink = "https://default-portfolio-link.com";
            modified = true;
          }
          // Fix empty contactInfo
          if (!app.contactInfo || app.contactInfo.trim() === "") {
            app.contactInfo = "No contact info provided";
            modified = true;
          }
          // You can add more fixes here if needed
        });

        if (modified) {
          await project.save();
          fixedCount++;
        }
      }

      return sendResponse(
        res,
        200,
        true,
        `Fixed applicant data in ${fixedCount} projects`
      );
    } catch (error) {
      console.error("🔥 Error fixing applicant data:", error);
      return sendResponse(res, 500, false, "Failed to fix applicant data");
    }
  }
);



// Mark project as completed by assigned freelancer
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

// --- FREELANCER ROUTES ---

// 📨 Apply to a project
router.post("/:id/apply", auth, role(["freelancer"]), async (req, res) => {
  const { id } = req.params;
  const { error } = applySchema.validate(req.body);
  if (error) return sendResponse(res, 400, false, error.details[0].message);

  if (!mongoose.Types.ObjectId.isValid(id))
    return sendResponse(res, 400, false, "Invalid project ID");

  try {
    const project = await Project.findById(id).populate("client");
    if (!project) return sendResponse(res, 404, false, "Project not found");
    if (project.status !== Project.PROJECT_STATUSES.OPEN)
      return sendResponse(res, 400, false, "Project not open");

    if (project.applications.some((a) => a.freelancerId.toString() === req.user.id))
      return sendResponse(res, 400, false, "Already applied");

    project.applications.push({
      freelancerId: req.user.id,
      portfolioLink: req.body.portfolioLink.trim(),
      contactInfo: req.body.contactInfo?.trim() || "",
      status: "pending",
    });

    await project.save();

    // Notify client
    await Notification.create({
      sender: req.user.id,
      receiver: project.client._id,
      content: `📨 ${req.user.name} applied to your project "${project.title}"`,
    });

    sendResponse(res, 200, true, "Application submitted");
  } catch (err) {
    console.error(err);
    sendResponse(res, 500, false, "Application failed");
  }
});

// --- PUBLIC ROUTES ---

// 📃 Get all open projects
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
// ✅ Freelancer's submitted proposals
router.get("/proposals/my", auth, role(["freelancer"]), async (req, res) => {
  try {
    const projects = await Project.find({
      "applications.freelancerId": req.user.id,
    })
      .populate("client", "name email")
      .populate("applications.freelancerId", "name email")
      .populate("assignedFreelancer", "name email");

    // Filter only the applications of the current freelancer
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

// 📄 Get project by ID
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
// ✏️ Update project (Edit)
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

    // Update fields
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
