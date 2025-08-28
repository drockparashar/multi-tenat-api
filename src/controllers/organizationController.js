import Organization from "../models/Organization.js";
import { logAdminAction } from "../utils/logger.js";

// Create a new organization
export const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Organization name is required." });
    }
    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) {
      return res.status(409).json({ message: "Organization already exists." });
    }
    const org = new Organization({ name });
    await org.save();
    await logAdminAction({
      action: "create_organization",
      userId: req.user.userId,
      organizationId: org._id,
      details: { orgId: org._id, name: org.name },
    });
    res.status(201).json(org);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create organization.", error: err.message });
  }
};

// List all organizations (admin only, for demo)
export const listOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.status(200).json(orgs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to list organizations.", error: err.message });
  }
};

// Get a single organization by ID
export const getOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ message: "Organization not found." });
    }
    await logAdminAction({
      action: "update_organization",
      userId: req.user.userId,
      organizationId: org._id,
      details: { orgId: org._id, name: org.name },
    });
    res.status(200).json(org);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get organization.", error: err.message });
  }
};

// Update an organization
export const updateOrganization = async (req, res) => {
  try {
    const { name } = req.body;
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!org) {
      return res.status(404).json({ message: "Organization not found." });
    }
    res.status(200).json(org);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update organization.", error: err.message });
  }
};

// Delete an organization
export const deleteOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id);
    if (!org) {
      return res.status(404).json({ message: "Organization not found." });
    }
    await logAdminAction({
      action: "delete_organization",
      userId: req.user.userId,
      organizationId: org._id,
      details: { orgId: org._id, name: org.name },
    });
    res.status(200).json({ message: "Organization deleted." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete organization.", error: err.message });
  }
};
