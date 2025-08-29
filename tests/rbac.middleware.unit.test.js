import { jest } from "@jest/globals";

describe("rbac middleware", () => {
  let requireRole, User;

  beforeAll(async () => {
    // Mock User model
    jest.unstable_mockModule("../src/models/User.js", () => ({
      default: {
        findById: jest.fn(),
      },
    }));

    // Import after mocking
    const rbacModule = await import("../src/middlewares/rbacMiddleware.js");
    requireRole = rbacModule.requireRole;

    const UserModule = await import("../src/models/User.js");
    User = UserModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requireRole", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: { id: "user123" },
      };
      res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should allow access for user with required role", async () => {
      const mockUser = {
        _id: "user123",
        role: "admin",
      };
      User.findById.mockResolvedValue(mockUser);

      const middleware = requireRole("admin");
      await middleware(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should deny access for user without required role", async () => {
      const mockUser = {
        _id: "user123",
        role: "user",
      };
      User.findById.mockResolvedValue(mockUser);

      const middleware = requireRole("admin");
      await middleware(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access denied. Insufficient permissions.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle user not found", async () => {
      User.findById.mockResolvedValue(null);

      const middleware = requireRole("admin");
      await middleware(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle missing user in request", async () => {
      req.user = null;

      const middleware = requireRole("admin");
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required",
      });
      expect(User.findById).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      User.findById.mockRejectedValue(new Error("Database error"));

      const middleware = requireRole("admin");
      await middleware(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should allow access for multiple valid roles", async () => {
      const mockUser = {
        _id: "user123",
        role: "manager",
      };
      User.findById.mockResolvedValue(mockUser);

      const middleware = requireRole(["admin", "manager"]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should deny access when user role not in required roles array", async () => {
      const mockUser = {
        _id: "user123",
        role: "user",
      };
      User.findById.mockResolvedValue(mockUser);

      const middleware = requireRole(["admin", "manager"]);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access denied. Insufficient permissions.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
