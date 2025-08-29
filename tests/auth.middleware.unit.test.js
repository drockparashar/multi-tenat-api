import { jest } from "@jest/globals";

describe("auth middleware", () => {
  let verifyToken, verifyRole, jwt;

  beforeAll(async () => {
    // Mock jsonwebtoken
    jest.unstable_mockModule("jsonwebtoken", () => ({
      default: {
        verify: jest.fn(),
      },
    }));

    // Import after mocking
    const authMiddleware = await import("../src/middlewares/authMiddleware.js");
    verifyToken = authMiddleware.verifyToken;
    verifyRole = authMiddleware.verifyRole;

    const jwtModule = await import("jsonwebtoken");
    jwt = jwtModule.default;
  });

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("verifyToken", () => {
    it("should verify valid token and set req.user", async () => {
      const mockPayload = {
        userId: "user123",
        role: "user",
        organizationId: "org123",
      };

      jwt.verify.mockReturnValue(mockPayload);

      const req = {
        headers: {
          authorization: "Bearer valid-token",
        },
      };
      const res = mockRes();

      await verifyToken(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-token",
        process.env.JWT_SECRET
      );
      expect(req.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 401 if no token provided", async () => {
      const req = { headers: {} };
      const res = mockRes();

      await verifyToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access token required.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 403 if token is invalid", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const req = {
        headers: {
          authorization: "Bearer invalid-token",
        },
      };
      const res = mockRes();

      await verifyToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired token.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("verifyRole", () => {
    it("should allow access for admin role", () => {
      const middleware = verifyRole(["admin"]);
      const req = {
        user: { role: "admin" },
      };
      const res = mockRes();

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should allow access for multiple allowed roles", () => {
      const middleware = verifyRole(["admin", "user"]);
      const req = {
        user: { role: "user" },
      };
      const res = mockRes();

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should deny access for unauthorized role", () => {
      const middleware = verifyRole(["admin"]);
      const req = {
        user: { role: "user" },
      };
      const res = mockRes();

      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Insufficient permissions.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
