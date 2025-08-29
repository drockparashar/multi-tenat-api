import { jest } from "@jest/globals";

describe("apikeyController", () => {
  let generateApiKey, listApiKeys, revokeApiKey, ApiKey;

  beforeAll(async () => {
    // Mock ApiKey model
    jest.unstable_mockModule("../src/models/ApiKey.js", () => ({
      default: function MockApiKey(data) {
        Object.assign(this, data);
        this._id = "apikey123";
        this.save = jest.fn().mockResolvedValue(this);
        return this;
      },
    }));

    // Mock crypto module
    jest.unstable_mockModule("crypto", () => ({
      default: {
        randomBytes: jest.fn().mockReturnValue({
          toString: jest.fn().mockReturnValue("mock-api-key-string"),
        }),
      },
    }));

    // Mock logger
    jest.unstable_mockModule("../src/utils/logger.js", () => ({
      logApiKeyUsage: jest.fn(),
      logAdminAction: jest.fn(),
    }));

    // Import after mocking
    const apikeyController = await import(
      "../src/controllers/apikeyController.js"
    );
    generateApiKey = apikeyController.generateApiKey;
    listApiKeys = apikeyController.listApiKeys;
    revokeApiKey = apikeyController.revokeApiKey;

    const ApiKeyModule = await import("../src/models/ApiKey.js");
    ApiKey = ApiKeyModule.default;
    ApiKey.find = jest.fn();
    ApiKey.findOneAndUpdate = jest.fn();
  });

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockReq = (userId = "user123", organizationId = "org123") => ({
    user: { userId, organizationId },
    params: {},
    originalUrl: "/api/apikeys",
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateApiKey", () => {
    it("should generate API key successfully", async () => {
      const req = mockReq();
      const res = mockRes();

      await generateApiKey(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        key: "mock-api-key-string",
      });
    });

    it("should handle errors when generating API key", async () => {
      const req = mockReq();
      const res = mockRes();

      // Mock the ApiKey constructor to throw an error during save
      const mockApiKey = new ApiKey({});
      mockApiKey.save.mockRejectedValue(new Error("Save error"));

      await generateApiKey(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to generate API key.",
        error: "Save error",
      });
    });
  });

  describe("listApiKeys", () => {
    it("should return list of API keys for organization", async () => {
      const mockApiKeys = [
        {
          _id: "key1",
          key: "key1-string",
          organizationId: "org123",
          revoked: false,
        },
        {
          _id: "key2",
          key: "key2-string",
          organizationId: "org123",
          revoked: false,
        },
      ];

      ApiKey.find.mockResolvedValue(mockApiKeys);

      const req = mockReq();
      const res = mockRes();

      await listApiKeys(req, res);

      expect(ApiKey.find).toHaveBeenCalledWith({ organizationId: "org123" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockApiKeys);
    });

    it("should handle errors when listing API keys", async () => {
      ApiKey.find.mockRejectedValue(new Error("Database error"));

      const req = mockReq();
      const res = mockRes();

      await listApiKeys(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to list API keys.",
        error: "Database error",
      });
    });
  });

  describe("revokeApiKey", () => {
    it("should revoke API key successfully", async () => {
      const revokedApiKey = {
        _id: "key1",
        key: "key1-string",
        organizationId: "org123",
        revoked: true,
      };

      ApiKey.findOneAndUpdate.mockResolvedValue(revokedApiKey);

      const req = { ...mockReq(), params: { id: "key1" } };
      const res = mockRes();

      await revokeApiKey(req, res);

      expect(ApiKey.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "key1", organizationId: "org123" },
        { revoked: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "API key revoked.",
      });
    });

    it("should return 404 if API key not found", async () => {
      ApiKey.findOneAndUpdate.mockResolvedValue(null);

      const req = { ...mockReq(), params: { id: "nonexistent" } };
      const res = mockRes();

      await revokeApiKey(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "API key not found.",
      });
    });

    it("should handle errors when revoking API key", async () => {
      ApiKey.findOneAndUpdate.mockRejectedValue(new Error("Database error"));

      const req = { ...mockReq(), params: { id: "key1" } };
      const res = mockRes();

      await revokeApiKey(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to revoke API key.",
        error: "Database error",
      });
    });
  });
});
