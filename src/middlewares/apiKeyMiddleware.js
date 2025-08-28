import ApiKey from "../models/ApiKey.js";

// Middleware to authenticate requests using API key
export const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ message: "API key missing." });
  }

  try {
    const keyDoc = await ApiKey.findOne({ key: apiKey, revoked: false });
    if (!keyDoc) {
      return res.status(401).json({ message: "Invalid or revoked API key." });
    }
    // Attach organization info to request
    req.organizationId = keyDoc.organizationId;
    // Optionally update lastUsedAt
    keyDoc.lastUsedAt = new Date();
    await keyDoc.save();
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "API key authentication failed.", error: err.message });
  }
};
