# Multi-Tenant API with Express.js

A secure, scalable multi-tenant API built with Express.js, featuring JWT authentication, role-based access control, API key management, and comprehensive audit logging.

## 🚀 Features

- **Multi-Tenant Architecture**: Complete organization isolation
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin, Manager, User roles
- **API Key Management**: Generate, rotate, and revoke API keys
- **Audit Logging**: Comprehensive activity tracking
- **Security**: Rate limiting, CORS, security headers, input validation
- **Testing**: Comprehensive unit test coverage

## 📁 Project Structure

```
multi-tenant-api/
├── src/
│   ├── controllers/          # Business logic controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── organizationController.js
│   │   └── apikeyController.js
│   ├── middlewares/          # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── rbacMiddleware.js
│   │   ├── apiKeyMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   ├── tenantMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Organization.js
│   │   ├── Project.js
│   │   ├── ApiKey.js
│   │   └── AuditLog.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── project.js
│   │   ├── organization.js
│   │   ├── apikey.js
│   │   └── index.js
│   ├── utils/               # Utility functions
│   │   ├── logger.js
│   │   └── validator.js
│   ├── app.js               # Express app configuration
│   └── server.js            # Server entry point
├── tests/                   # Unit tests
├── .env.example             # Environment variables template
├── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/drockparashar/multi-tenat-api.git
   cd multi-tenat-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/multi-tenant-api
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=3000
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=100
   API_KEY_LENGTH=32
   LOG_LEVEL=info
   ```

4. **Start MongoDB**

   ```bash
   # If using local MongoDB
   mongod

   # Or use MongoDB Atlas cloud connection string in MONGODB_URI
   ```

5. **Run the application**

   ```bash
   # Development mode
   npm start

   # The server will start on http://localhost:3000
   ```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/authController.unit.test.js

# Run tests with coverage
npm test -- --coverage
```

## 📚 API Documentation

### Base URL

```
http://localhost:000/api
```

### Authentication Flow

#### 1. Register a New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "organization": "My Company",
  "name": "John Doe",
  "role": "user"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a8b8c8e4d5f6a7b8c9d0",
    "email": "user@example.com",
    "role": "user",
    "organizationId": "64f8a8b8c8e4d5f6a7b8c9d1",
    "name": "John Doe"
  }
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Protected Routes

All protected routes require the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

#### User Management (Admin only)

```http
GET /api/users                    # List users in organization
GET /api/users/:id                # Get specific user
```

#### Project Management

```http
GET /api/projects                 # List projects (all roles)
GET /api/projects/:id             # Get project (all roles)
POST /api/projects                # Create project (manager, admin)
PUT /api/projects/:id             # Update project (manager, admin)
DELETE /api/projects/:id          # Delete project (admin only)
```

#### Organization Management (Admin only)

```http
GET /api/organizations            # List all organizations
GET /api/organizations/:id        # Get organization
POST /api/organizations           # Create organization
PUT /api/organizations/:id        # Update organization
DELETE /api/organizations/:id     # Delete organization
```

#### API Key Management (Admin only)

```http
GET /api/apikeys                  # List API keys
POST /api/apikeys                 # Generate new API key
POST /api/apikeys/:id/revoke      # Revoke API key
POST /api/apikeys/:id/rotate      # Rotate API key
```

### API Key Authentication

For external integrations, use API key authentication:

```http
X-API-Key: your_generated_api_key
```

## 👥 User Roles

| Role        | Permissions                                                                        |
| ----------- | ---------------------------------------------------------------------------------- |
| **user**    | Read-only access to organization data                                              |
| **manager** | Read access + Create/Update projects                                               |
| **admin**   | Full access including user management, organization operations, API key management |

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Configurable request rate limits
- **CORS Protection**: Cross-origin request handling
- **Security Headers**: Helmet.js integration
- **Input Validation**: express-validator integration
- **Tenant Isolation**: Organization-scoped data access
- **API Key Security**: Revocation and rotation support

## 📊 Audit Logging

The system logs the following events:

- Login attempts (success/failure)
- Admin actions (user management, permission changes)
- API key usage and management
- Critical security events

Logs are stored in the `AuditLog` collection with the following structure:

```json
{
  "event": "login_success",
  "userId": "64f8a8b8c8e4d5f6a7b8c9d0",
  "organizationId": "64f8a8b8c8e4d5f6a7b8c9d1",
  "details": {
    "email": "user@example.com"
  },
  "createdAt": "2025-08-29T10:30:00.000Z"
}
```

## 🧪 Testing

The project includes comprehensive unit tests covering:

- Authentication controllers
- User management
- Project operations
- API key management
- Middleware functionality
- Utility functions

Test files are located in the `tests/` directory and use Jest with ES modules support.

## 📮 Postman Collection

A complete Postman collection is included in this repository (`Multi-tenat-api.postman_collection.json`) with:

- **Authentication APIs**: Signup and SignIn endpoints
- **User Management**: GetUsers endpoint with JWT authentication
- **Project Management**: CreateProject endpoint with authorization
- **API Key Management**: CreateAPIKey endpoint for admin users
- **Environment Variables**: Uses `{{baseURL}}` for easy environment switching
- **Pre-configured Headers**: Authorization tokens and content types

### Importing the Postman Collection

1. Open Postman
2. Click "Import" button
3. Select "Upload Files"
4. Choose `Multi-tenat-api.postman_collection.json` from the repository
5. The collection includes a pre-configured `baseURL` variable set to `http://localhost:3000`

### Collection Structure

The collection includes these comprehensive endpoints:

- **Signup** (`POST {{baseURL}}/api/auth/register`)
  - Creates new user with organization
  - Sample payload included
- **SignIn** (`POST {{baseURL}}/api/auth/login`)
  - User authentication
  - Returns JWT token
- **GetUsers** (`GET /api/users`)
  - Admin-only endpoint
  - Requires Bearer token authorization
- **CreateProject** (`POST /api/projects`)
  - Create new project in organization
  - Requires authentication and manager/admin role
- **CreateAPIKey** (`POST /api/apikeys`)
  - Generate API key for external integrations
  - Admin-only functionality

### Usage Tips

1. **Start with Authentication**: Use Signup or SignIn to get JWT token
2. **Set Authorization**: Copy the JWT token to Authorization headers for protected endpoints
3. **Environment Variables**: Update `baseURL` if running on different port/host
4. **Role-based Testing**: Test with different user roles (user, manager, admin)

### Important Notes

⚠️ **Port Configuration**: The collection is pre-configured for port 3000. If you need to use a different port, update the `baseURL` variable in the collection or set `PORT` in your `.env` file.

## 🔧 Configuration

### Environment Variables

| Variable               | Description                       | Default                                      |
| ---------------------- | --------------------------------- | -------------------------------------------- |
| `MONGODB_URI`          | MongoDB connection string         | `mongodb://localhost:27017/multi-tenant-api` |
| `JWT_SECRET`           | Secret key for JWT signing        | Required                                     |
| `PORT`                 | Server port                       | `3000`                                       |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `60000`                                      |
| `RATE_LIMIT_MAX`       | Max requests per window           | `100`                                        |
| `API_KEY_LENGTH`       | Generated API key length          | `32`                                         |
| `LOG_LEVEL`            | Logging level                     | `info`                                       |

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set production values for all environment variables
2. **Database**: Use MongoDB Atlas or production MongoDB instance
3. **Security**:
   - Use strong JWT secrets
   - Enable MongoDB authentication
   - Configure proper CORS origins
   - Set up SSL/TLS certificates
4. **Monitoring**: Implement logging and monitoring solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

