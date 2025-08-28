import AuditLog from "../models/AuditLog.js";

// Log an event to the database
export const logEvent = async ({ event, userId, organizationId, details }) => {
  try {
    const log = new AuditLog({
      event,
      userId,
      organizationId,
      details,
    });
    await log.save();
  } catch (err) {
    console.error("Audit log failed:", err);
  }
};

// Log login attempt (success or failure)
export const logLoginAttempt = async ({
  email,
  success,
  userId,
  organizationId,
}) => {
  await logEvent({
    event: success ? "login_success" : "login_failure",
    userId,
    organizationId,
    details: { email },
  });
};

// Log admin action (e.g., permission update)
export const logAdminAction = async ({
  action,
  userId,
  organizationId,
  details,
}) => {
  await logEvent({
    event: "admin_action",
    userId,
    organizationId,
    details: { action, ...details },
  });
};

// Log API key usage
export const logApiKeyUsage = async ({
  apiKeyId,
  organizationId,
  userId,
  endpoint,
}) => {
  await logEvent({
    event: "api_key_usage",
    userId,
    organizationId,
    details: { apiKeyId, endpoint },
  });
};
