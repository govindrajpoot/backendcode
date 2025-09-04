# Authentication API cURL Commands

## Setup Instructions

### 1. Environment Variables
Add these to your `.env` file:
```
JWT_SECRET=your_jwt_secret_here
MONGO_URI=mongodb://localhost:27017/webbackend
PORT=5000
```

## API Endpoints

### 1. User Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "password": "password123",
    "userType": "user"
  }'
```

**Expected Response:**
```json
{
  "status": true,
  "message": "User registered successfully"
}
```

### 2. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "status": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "user"
  }
}
```

### 3. Get User Profile (Protected Route)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "status": true,
  "message": "User profile retrieved successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "userType": "user",
    "createdAt": "2024-12-15T10:30:00.000Z",
    "updatedAt": "2024-12-15T10:30:00.000Z"
  }
}
```

### 4. Get All Users (Admin Only)
```bash
curl -X GET http://localhost:5000/api/auth/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Testing Steps

1. **Test Signup/Login:**
   ```bash
   # Signup
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","phone":"1234567890","email":"test@example.com","password":"test123","userType":"user"}'

   # Login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

2. **Test Protected Route:**
   ```bash
   # Use the token from login response
   curl -X GET http://localhost:5000/api/auth/profile \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

## Error Responses

### Invalid Credentials
```json
{
  "status": false,
  "code": 401,
  "message": "Incorrect password"
}
```

### User Not Found
```json
{
  "status": false,
  "code": 404,
  "message": "Invalid email address"
}
```

### Server Error
```json
{
  "status": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

## Notes

- Replace `YOUR_JWT_TOKEN_HERE` with the actual JWT token from login response
- Make sure your server is running on port 5000
- All protected routes require the `Authorization: Bearer <token>` header
