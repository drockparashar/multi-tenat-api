import User from "../models/User.js";

// List users in the same organization (admin only)
export const listUsers = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const users = await User.find({ organizationId: orgId }).select(
      "-password"
    );
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to list users.", error: err.message });
  }
};

// Get a single user (must belong to same org)
export const getUser = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const user = await User.findOne({
      _id: req.params.id,
      organizationId: orgId,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get user.", error: err.message });
  }
};
