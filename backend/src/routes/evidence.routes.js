exports.uploadEvidence = async (req, res) => {

  try {

    const milestone = await ProjectMilestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    // Save evidence
    milestone.evidenceUrl = req.body.evidenceUrl;

    // STEP 1: VALIDATION (simple for now)
    const isValid = validateEvidence(milestone.title, req.body.evidenceUrl);

    if (isValid) {
      milestone.status = "COMPLETED";
      milestone.isValidated = true;

      // Remove evidence after success
      milestone.evidenceUrl = null;
    }

    await milestone.save();

    // Check project completion
    const completedCount = await ProjectMilestone.countDocuments({
      projectId: milestone.projectId,
      status: "COMPLETED"
    });

    let projectCompleted = false;

    if (completedCount === 5) {
      const project = await Project.findById(milestone.projectId);

      project.status = "COMPLETED";
      await project.save();

      await awardXP(project.studentId, 50, "Project Completed");

      projectCompleted = true;
    }

    res.json({
      milestone,
      valid: isValid,
      projectCompleted
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};