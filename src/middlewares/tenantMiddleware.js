// Middleware to check if resource belongs to user's organization
export const checkOrganization = (resourceOrgIdField = "organizationId") => {
  return (req, res, next) => {
    // Assumes req.user is set by auth middleware
    const userOrgId = req.user.organizationId;
    const resourceOrgId =
      req[resourceOrgIdField] ||
      (req.body && req.body[resourceOrgIdField]) ||
      (req.params && req.params[resourceOrgIdField]);

    if (!resourceOrgId || resourceOrgId.toString() !== userOrgId.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied: organization mismatch." });
    }
    next();
  };
};
