import { jest } from "@jest/globals";

// Comprehensive unit tests for authentication controller
describe("authController.register", () => {
  let register, User, Organization, bcrypt, jwt;

  beforeAll(async () => {
    // Mock all dependencies before importing
    const mockUser = {
      findOne: jest.fn(),
      prototype: {
        save: jest.fn(),
      },
    };

    const mockOrganization = {
      findOne: jest.fn(),
      prototype: {
        save: jest.fn(),
      },
    };

    const mockBcrypt = {
      hash: jest.fn(),
    };

    const mockJwt = {
      sign: jest.fn(),
    };

    // Mock the modules
    jest.unstable_mockModule("../src/models/User.js", () => ({
      default: function MockUser(data) {
        Object.assign(this, data);
        this.save = jest.fn().mockResolvedValue(this);
        return this;
      },
    }));

    jest.unstable_mockModule("../src/models/Organization.js", () => ({
      default: function MockOrganization(data) {
        Object.assign(this, data);
        this._id = "mock-org-id";
        this.save = jest.fn().mockResolvedValue(this);
        return this;
      },
    }));

    jest.unstable_mockModule("bcrypt", () => ({
      default: mockBcrypt,
    }));

    jest.unstable_mockModule("jsonwebtoken", () => ({
      default: mockJwt,
    }));

    jest.unstable_mockModule("../src/utils/logger.js", () => ({
      logLoginAttempt: jest.fn(),
    }));

    // Now import the controller and mocked dependencies
    const authController = await import("../src/controllers/authController.js");
    register = authController.register;

    const UserModule = await import("../src/models/User.js");
    User = UserModule.default;
    User.findOne = jest.fn();

    const OrgModule = await import("../src/models/Organization.js");
    Organization = OrgModule.default;
    Organization.findOne = jest.fn();

    const bcryptModule = await import("bcrypt");
    bcrypt = bcryptModule.default;

    const jwtModule = await import("jsonwebtoken");
    jwt = jwtModule.default;
  });

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if required fields are missing", async () => {
    const req = { body: { email: "", password: "", organization: "" } };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining("required"),
    });
  });

  it("should return 409 if user already exists", async () => {
    User.findOne.mockResolvedValue({ email: "test@example.com" });

    const req = {
      body: {
        email: "test@example.com",
        password: "pass",
        organization: "Org",
      },
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining("already exists"),
    });
  });

  it("should create user and return token if valid", async () => {
    User.findOne.mockResolvedValue(null);
    Organization.findOne.mockResolvedValue({ _id: "org-id", name: "Org" });
    bcrypt.hash.mockResolvedValue("hashedpass");
    jwt.sign.mockReturnValue("token123");

    const req = {
      body: {
        email: "new@example.com",
        password: "pass",
        organization: "Org",
        name: "Name",
      },
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      token: "token123",
      user: expect.objectContaining({ email: "new@example.com" }),
    });
  });

  it("should handle errors and return 500", async () => {
    User.findOne.mockRejectedValue(new Error("DB error"));

    const req = {
      body: { email: "err@example.com", password: "pass", organization: "Org" },
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining("Registration failed"),
      error: "DB error",
    });
  });
});
