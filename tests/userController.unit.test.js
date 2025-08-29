import { jest } from "@jest/globals";

describe("userController", () => {
  let listUsers, getUser, User;

  beforeAll(async () => {
    // Mock User model
    jest.unstable_mockModule("../src/models/User.js", () => ({
      default: {
        find: jest.fn(),
        findOne: jest.fn(),
      },
    }));

    // Import after mocking
    const userController = await import("../src/controllers/userController.js");
    listUsers = userController.listUsers;
    getUser = userController.getUser;

    const UserModule = await import("../src/models/User.js");
    User = UserModule.default;
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
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listUsers", () => {
    it("should return list of users in same organization", async () => {
      const mockUsers = [
        { _id: "user1", email: "user1@example.com", organizationId: "org123" },
        { _id: "user2", email: "user2@example.com", organizationId: "org123" },
      ];

      User.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      const req = mockReq();
      const res = mockRes();

      await listUsers(req, res);

      expect(User.find).toHaveBeenCalledWith({ organizationId: "org123" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should handle errors when listing users", async () => {
      User.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      const req = mockReq();
      const res = mockRes();

      await listUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to list users.",
        error: "Database error",
      });
    });
  });

  describe("getUser", () => {
    it("should return user if found in same organization", async () => {
      const mockUser = {
        _id: "user1",
        email: "user1@example.com",
        organizationId: "org123",
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const req = { ...mockReq(), params: { id: "user1" } };
      const res = mockRes();

      await getUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        _id: "user1",
        organizationId: "org123",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 404 if user not found", async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = { ...mockReq(), params: { id: "nonexistent" } };
      const res = mockRes();

      await getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found.",
      });
    });

    it("should handle errors when getting user", async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      const req = { ...mockReq(), params: { id: "user1" } };
      const res = mockRes();

      await getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to get user.",
        error: "Database error",
      });
    });
  });
});
