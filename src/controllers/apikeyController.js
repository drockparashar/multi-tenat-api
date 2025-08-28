import ApiKey from "../models/ApiKey.js";
import crypto from "crypto";
import { logApiKeyUsage, logAdminAction } from "../utils/logger.js";

// Generate a new API key for organization
export const generateApiKey = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const key = crypto
      .randomBytes(parseInt(process.env.API_KEY_LENGTH) || 32)
      .toString("hex");
    const apiKey = new ApiKey({ key, organizationId });
    await apiKey.save();
    await logApiKeyUsage({
      apiKeyId: apiKey._id,
      organizationId,
      userId: req.user.userId,
      endpoint: req.originalUrl,
    });
    await logAdminAction({
      action: "generate_api_key",
      userId: req.user.userId,
      organizationId,
      details: { apiKeyId: apiKey._id },
    });
    res.status(201).json({ key: apiKey.key });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to generate API key.", error: err.message });
  }
};

// List all API keys for organization
export const listApiKeys = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const keys = await ApiKey.find({ organizationId });
    res.status(200).json(keys);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to list API keys.", error: err.message });
  }
};

// Revoke an API key
export const revokeApiKey = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const apiKey = await ApiKey.findOneAndUpdate(
      { _id: req.params.id, organizationId },
      { revoked: true },
      { new: true }
    );
    if (!apiKey) {
      return res.status(404).json({ message: "API key not found." });
    }
    await logApiKeyUsage({
      apiKeyId: apiKey._id,
      organizationId,
      userId: req.user.userId,
      endpoint: req.originalUrl,
    });
    await logAdminAction({
      action: "revoke_api_key",
      userId: req.user.userId,
      organizationId,
      details: { apiKeyId: apiKey._id },
    });
    res.status(200).json({ message: "API key revoked." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to revoke API key.", error: err.message });
  }
};

// Rotate (regenerate) an API key
export const rotateApiKey = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const newKey = crypto
      .randomBytes(parseInt(process.env.API_KEY_LENGTH) || 32)
      .toString("hex");
    const apiKey = await ApiKey.findOneAndUpdate(
      { _id: req.params.id, organizationId, revoked: false },
      { key: newKey },
      { new: true }
    );
    if (!apiKey) {
      return res.status(404).json({ message: "API key not found or revoked." });
    }
    await logApiKeyUsage({
      apiKeyId: apiKey._id,
      organizationId,
      userId: req.user.userId,
      endpoint: req.originalUrl,
    });
    await logAdminAction({
      action: "rotate_api_key",
      userId: req.user.userId,
      organizationId,
      details: { apiKeyId: apiKey._id },
    });
    res.status(200).json({ key: apiKey.key });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to rotate API key.", error: err.message });
  }
};
