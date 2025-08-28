import Project from "../models/Project.js";

// Create a new project
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const organizationId = req.user.organizationId;
    const createdBy = req.user.userId;
    if (!name) {
      return res.status(400).json({ message: "Project name is required." });
    }
    const project = new Project({
      name,
      description,
      organizationId,
      createdBy,
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create project.", error: err.message });
  }
};

// List all projects in organization
export const listProjects = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const projects = await Project.find({ organizationId });
    res.status(200).json(projects);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to list projects.", error: err.message });
  }
};

// Get a single project by ID (must belong to org)
export const getProject = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const project = await Project.findOne({
      _id: req.params.id,
      organizationId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    res.status(200).json(project);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get project.", error: err.message });
  }
};

// Update a project (must belong to org)
export const updateProject = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { name, description } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, organizationId },
      { name, description },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    res.status(200).json(project);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update project.", error: err.message });
  }
};

// Delete a project (must belong to org)
export const deleteProject = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      organizationId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    res.status(200).json({ message: "Project deleted." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete project.", error: err.message });
  }
};
