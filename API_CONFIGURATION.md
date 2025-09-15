# API Configuration Guide

This guide explains how to configure and use the API system in this martial arts management application.

## Environment Variables

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8003
API_BASE_URL=http://localhost:8003

# API Settings
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRY_ATTEMPTS=3

# JWT Configuration (for backend)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

### Environment-Specific URLs

**Development:**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8003
```

**Staging:**
```bash
NEXT_PUBLIC_API_BASE_URL=https://staging-api.your-domain.com
```

**Production:**
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
```

## API Structure

### Base API Class

All API classes extend from `BaseAPI` which provides:
- Centralized configuration management
- Automatic retry logic
- Request timeout handling
- Error handling
- Authentication token management

### Available API Modules

1. **Course API** (`/lib/courseAPI.ts`)
   - Create, read, update, delete courses
   - Course enrollment management

2. **Branch API** (`/lib/branchAPI.ts`)
   - Branch management operations
   - Location-specific data

3. **Student API** (`/lib/studentAPI.ts`)
   - Student registration and management
   - Attendance tracking
   - Enrollment operations

4. **Auth API** (`/lib/authAPI.ts`)
   - Authentication and authorization
   - User profile management
   - Password reset functionality

### Usage Examples

#### Using Course API
```typescript
import { courseAPI } from '@/lib/api'

// Create a course
const courseData = {
  title: "Advanced Kung Fu",
  code: "KF-ADV-001",
  // ... other fields
}

try {
  const result = await courseAPI.createCourse(courseData, authToken)
  console.log('Course created:', result.course_id)
} catch (error) {
  console.error('Failed to create course:', error.message)
}
```

#### Using Auth API
```typescript
import { authAPI } from '@/lib/api'

// Login
try {
  const result = await authAPI.login({
    email: 'user@example.com',
    password: 'password123'
  })
  console.log('Login successful:', result.token)
} catch (error) {
  console.error('Login failed:', error.message)
}
```

## Configuration Features

### Automatic Retry Logic
- Failed requests are automatically retried up to 3 times (configurable)
- Retries occur for network errors, timeouts, and 5xx server errors
- 1-second delay between retry attempts

### Request Timeout
- Default timeout: 30 seconds (configurable via environment variables)
- Prevents hanging requests

### Environment Detection
- Automatically detects development/staging/production environments
- Applies appropriate configurations for each environment

## API Endpoints

### Courses
- `POST /api/courses` - Create course
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Students
- `POST /api/students` - Create student
- `GET /api/students` - List students
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Branches
- `POST /api/branches` - Create branch
- `GET /api/branches` - List branches
- `GET /api/branches/:id` - Get branch details
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

## Security

### JWT Authentication
- All protected endpoints require Bearer token authentication
- Tokens include user role information for authorization
- Super Admin role required for course and branch management

### Role-Based Access Control
- **Super Admin**: Full access to all resources
- **Admin**: Branch-specific management access
- **Coach**: Course and student management within assigned branches
- **Student**: Read-only access to own data

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message",
  "details": ["Additional error details if applicable"]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `409` - Conflict (duplicate resource)
- `500` - Internal server error

## Development Tips

1. **Testing API Connectivity:**
   ```typescript
   import { baseAPI } from '@/lib/api'
   
   // Test connection
   try {
     const result = await baseAPI.testConnection()
     console.log('API connected:', result)
   } catch (error) {
     console.error('API connection failed:', error)
   }
   ```

2. **Getting Current Configuration:**
   ```typescript
   import { getAPIConfig } from '@/lib/config'
   
   const config = getAPIConfig()
   console.log('Current API config:', config)
   ```

3. **Environment Detection:**
   ```typescript
   import { isDevelopmentAPI } from '@/lib/api'
   
   if (isDevelopmentAPI()) {
     console.log('Running in development mode')
   }
   ```

## Deployment

When deploying to different environments:

1. Update the environment variables in your deployment platform
2. Ensure CORS is properly configured for your production API URLs
3. Use HTTPS in production environments
4. Set appropriate timeout values for your infrastructure

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure your API backend has CORS configured for your frontend domain
   - Check that the API base URL is correct

2. **Authentication Errors:**
   - Verify that the JWT secret is consistent between frontend and backend
   - Check token expiration settings

3. **Network Timeouts:**
   - Increase timeout values for slow network connections
   - Check server response times

4. **Environment Variable Issues:**
   - Ensure `.env.local` file exists and has correct values
   - Restart development server after changing environment variables
   - Use `NEXT_PUBLIC_` prefix for client-side environment variables
