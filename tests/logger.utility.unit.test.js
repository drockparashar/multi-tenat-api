import { jest } from "@jest/globals";

describe("logger utility", () => {
  let logEvent, logLoginAttempt, logAdminAction, logApiKeyUsage, AuditLog;

  beforeAll(async () => {
    // Mock AuditLog model
    jest.unstable_mockModule("../src/models/AuditLog.js", () => ({
      default: function MockAuditLog(data) {
        Object.assign(this, data);
        this._id = "log123";
        this.save = jest.fn().mockResolvedValue(this);
        return this;
      },
    }));

    // Import after mocking
    const logger = await import("../src/utils/logger.js");
    logEvent = logger.logEvent;
    logLoginAttempt = logger.logLoginAttempt;
    logAdminAction = logger.logAdminAction;
    logApiKeyUsage = logger.logApiKeyUsage;

    const AuditLogModule = await import("../src/models/AuditLog.js");
    AuditLog = AuditLogModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to prevent test output pollution
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("logEvent", () => {
    it("should create and save audit log successfully", async () => {
      const eventData = {
        action: "test_action",
        userId: "user123",
        organizationId: "org123",
        details: { test: "data" },
      };

      await logEvent(eventData);

      expect(AuditLog.prototype.save).toHaveBeenCalled();
    });

    it("should handle errors when saving audit log", async () => {
      jest
        .spyOn(AuditLog.prototype, "save")
        .mockRejectedValue(new Error("Save error"));

      const eventData = {
        action: "test_action",
        userId: "user123",
      };

      await logEvent(eventData);

      expect(console.error).toHaveBeenCalledWith(
        "Audit log failed:",
        expect.any(Error)
      );
    });
  });

  describe("logLoginAttempt", () => {
    it("should log successful login attempt", async () => {
      const loginData = {
        email: "user@example.com",
        success: true,
        userId: "user123",
        organizationId: "org123",
      };

      await logLoginAttempt(loginData);

      expect(AuditLog.prototype.save).toHaveBeenCalled();
    });

    it("should log failed login attempt", async () => {
      const loginData = {
        email: "user@example.com",
        success: false,
      };

      await logLoginAttempt(loginData);

      expect(AuditLog.prototype.save).toHaveBeenCalled();
    });
  });

  describe("logAdminAction", () => {
    it("should log admin action successfully", async () => {
      const actionData = {
        action: "create_organization",
        userId: "admin123",
        organizationId: "org123",
        details: { orgName: "Test Org" },
      };

      await logAdminAction(actionData);

      expect(AuditLog.prototype.save).toHaveBeenCalled();
    });
  });

  describe("logApiKeyUsage", () => {
    it("should log API key usage successfully", async () => {
      const usageData = {
        apiKeyId: "key123",
        organizationId: "org123",
        userId: "user123",
        endpoint: "/api/projects",
      };

      await logApiKeyUsage(usageData);

      expect(AuditLog.prototype.save).toHaveBeenCalled();
    });
  });
});
