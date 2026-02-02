# TribeNet API Testing Guide - Postman Documentation

Comprehensive testing guide for all TribeNet REST API endpoints with detailed request/response examples.

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Authentication Endpoints](#1-authentication-endpoints)
3. [User Endpoints](#2-user-endpoints)
4. [Club Management](#3-club-management-endpoints)
5. [Membership Management](#4-membership-management-endpoints)
6. [Club Admin Operations](#5-club-admin-endpoints)
7. [System Admin Operations](#6-system-admin-endpoints)
8. [Payment Processing](#7-payment-endpoints)
9. [Error Response Reference](#8-error-response-reference)
10. [Complete Testing Workflow](#9-complete-testing-workflow)
11. [Postman Collection Setup](#10-postman-collection-setup)
12. [Automated Test Scripts](#11-automated-test-scripts)

---

## Initial Setup

### Base Configuration

**Base URL:** `http://localhost:8080`

### Postman Environment Variables

Create these variables in your Postman environment:

| Variable | Initial Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:8080` | API base URL |
| `token` | (empty) | JWT token (auto-set from login) |
| `userId` | (empty) | Current user ID |
| `clubId` | (empty) | Created club ID |
| `adminToken` | (empty) | Admin user token |

### Pre-requisites

- TribeNet backend running on `http://localhost:8080`
- MySQL database configured and running
- Postman installed (version 9.0 or later recommended)

---

## 1. Authentication Endpoints

All authentication endpoints are **PUBLIC** - no JWT token required.

### 1.1 Register User

Creates a new user account with default USER role.

**Endpoint:** `POST /api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Field Validations:**
- `name`: Required, not blank
- `username`: Required, 3-50 characters, unique
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `role`: Optional (defaults to USER)

**Success Response (200 OK):**
```json
{
  "message": "User registered successfully",
  "username": "johndoe"
}
```

**Error Response (409 Conflict):**
```json
{
  "error": "Username already exists"
}
```

**Validation Error (400 Bad Request):**
```json
{
  "name": "Name is required",
  "email": "Email must be valid",
  "password": "Password must be at least 6 characters"
}
```

**Test Script:**
```javascript
pm.test("User registered successfully", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData.username).to.eql('johndoe');
});
```

---

### 1.2 Login

Authenticates user and returns JWT token.

**Endpoint:** `POST /api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huZG9lIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MDYwMTYwMDAsImV4cCI6MTcwNjEwMjQwMH0.signature",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

**Test Script (Save Token & User Info):**
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    
    // Save token for subsequent requests
    pm.environment.set("token", jsonData.token);
    pm.environment.set("userId", jsonData.user.id);
    
    // Validate response structure
    pm.expect(jsonData).to.have.property('token');
    pm.expect(jsonData.user).to.have.property('username');
    pm.expect(jsonData.user.role).to.be.oneOf(['USER', 'ADMIN']);
});
```

---

## 2. User Endpoints

**🔒 Authentication Required:** All endpoints require `Authorization: Bearer {{token}}` header.

### 2.1 Get All Users

Retrieves list of all users (excludes current user).

**Endpoint:** `GET /api/v1/users`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
[
  {
    "id": 2,
    "name": "Jane Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "role": "USER"
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "username": "bobjohnson",
    "email": "bob@example.com",
    "role": "USER"
  }
]
```

**Test Script:**
```javascript
pm.test("Get users successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
    
    if (jsonData.length > 0) {
        pm.expect(jsonData[0]).to.have.property('id');
        pm.expect(jsonData[0]).to.have.property('username');
        pm.expect(jsonData[0]).to.have.property('email');
    }
});
```

---

### 2.2 Get User by ID

Retrieves specific user details by user ID.

**Endpoint:** `GET /api/v1/users/{userId}`

**Example:** `GET /api/v1/users/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User not found with id: 99"
}
```

---

### 2.3 Get User's Clubs

Retrieves all clubs that a user is a member of, including their role in each club.

**Endpoint:** `GET /api/v1/users/{userId}/clubs`

**Example:** `GET /api/v1/users/1/clubs`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Photography Club",
    "description": "Learn and practice photography",
    "category": "Arts",
    "free": true,
    "price": null,
    "clubRole": "ADMIN"
  },
  {
    "id": 3,
    "name": "Chess Club",
    "description": "Strategic board game enthusiasts",
    "category": "Sports",
    "free": false,
    "price": 500.00,
    "clubRole": "MEMBER"
  }
]
```

**Empty Response (200 OK):**
```json
[]
```

---

## 3. Club Management Endpoints

### 3.1 Create Club

Creates a new club. Creator automatically becomes club admin.

**Endpoint:** `POST /api/v1/clubs`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Request Body (Free Club):**
```json
{
  "name": "Photography Club",
  "description": "Learn and practice photography techniques",
  "category": "Arts",
  "free": true
}
```

**Request Body (Paid Club):**
```json
{
  "name": "Premium Chess Club",
  "description": "Advanced chess strategies and tournaments",
  "category": "Sports",
  "free": false,
  "price": 500.00
}
```

**Field Validations:**
- `name`: Required, not blank
- `description`: Required, not blank
- `category`: Required, not blank
- `free`: Required (boolean)
- `price`: Required if `free: false`, must be positive

**Success Response (201 Created):**
```json
{
  "id": 5,
  "name": "Premium Chess Club",
  "description": "Advanced chess strategies and tournaments",
  "category": "Sports",
  "free": false,
  "price": 500.00,
  "creatorId": 1,
  "memberCount": 1
}
```

**Validation Error (400 Bad Request):**
```json
{
  "name": "Club name is required",
  "description": "Description is required",
  "category": "Category is required",
  "free": "Free status is required"
}
```

**Test Script:**
```javascript
pm.test("Club created successfully", function () {
    pm.response.to.have.status(201);
    var jsonData = pm.response.json();
    
    // Save club ID for future tests
    pm.environment.set("clubId", jsonData.id);
    
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData.memberCount).to.eql(1);
    pm.expect(jsonData.creatorId).to.eql(pm.environment.get("userId"));
});
```

---

### 3.2 Get All Clubs

Retrieves all available clubs in the system.

**Endpoint:** `GET /api/v1/clubs`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Photography Club",
    "description": "Learn and practice photography",
    "category": "Arts",
    "free": true,
    "price": null,
    "creatorId": 1,
    "memberCount": 15
  },
  {
    "id": 2,
    "name": "Premium Chess Club",
    "description": "Advanced chess strategies",
    "category": "Sports",
    "free": false,
    "price": 500.00,
    "creatorId": 2,
    "memberCount": 8
  }
]
```

---

### 3.3 Get Club by ID

Retrieves detailed information about a specific club.

**Endpoint:** `GET /api/v1/clubs/{clubId}`

**Example:** `GET /api/v1/clubs/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Photography Club",
  "description": "Learn and practice photography",
  "category": "Arts",
  "free": true,
  "price": null,
  "creatorId": 1,
  "memberCount": 15
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Club not found with id: 99"
}
```

---

### 3.4 Update Club

Updates club details. **Only club admins** can update.

**Endpoint:** `PUT /api/v1/clubs/{clubId}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Request Body (Partial Update Supported):**
```json
{
  "name": "Advanced Photography Club",
  "description": "Professional photography techniques and mentorship",
  "category": "Arts & Media"
}
```

**All fields are optional in update:**
- `name`: Optional
- `description`: Optional
- `category`: Optional
- `free`: Optional
- `price`: Optional

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Advanced Photography Club",
  "description": "Professional photography techniques and mentorship",
  "category": "Arts & Media",
  "free": true,
  "price": null,
  "creatorId": 1,
  "memberCount": 15
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Only club admins can update club details"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Club not found with id: 99"
}
```

---

### 3.5 Delete Club

Deletes a club. **Only system administrators** can delete clubs.

**Endpoint:** `DELETE /api/v1/clubs/{clubId}`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
{
  "message": "Club deleted successfully"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Only system administrators can delete clubs"
}
```

---

## 4. Membership Management Endpoints

### 4.1 Join Club

Allows a user to join a club as a member.

**Endpoint:** `POST /api/v1/clubs/{clubId}/join`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
{
  "message": "Successfully joined the club"
}
```

**Error Response (400 Bad Request - Already Member):**
```json
{
  "error": "You are already a member of this club"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Club not found with id: 99"
}
```

**Test Script:**
```javascript
pm.test("Successfully joined club", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("Successfully joined");
});
```

---

### 4.2 Leave Club

Allows a user to leave a club.

**Endpoint:** `DELETE /api/v1/clubs/{clubId}/leave`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
{
  "message": "Successfully left the club"
}
```

**Error Response (400 Bad Request - Last Admin):**
```json
{
  "error": "Cannot leave club: you are the last admin. Please promote another member first or delete the club."
}
```

**Error Response (404 Not Found - Not a Member):**
```json
{
  "error": "You are not a member of this club"
}
```

**Business Rules:**
- Last admin cannot leave without promoting another member first
- User must be a member to leave
- Membership is automatically deleted upon leaving

---

### 4.3 Get Club Members

Retrieves all members of a club with their roles.

**Endpoint:** `GET /api/v1/clubs/{clubId}/members`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
[
  {
    "userId": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "clubRole": "ADMIN",
    "joinedAt": "2026-01-25T10:30:00"
  },
  {
    "userId": 2,
    "name": "Jane Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "clubRole": "MEMBER",
    "joinedAt": "2026-01-26T14:20:00"
  },
  {
    "userId": 3,
    "name": "Bob Johnson",
    "username": "bobjohnson",
    "email": "bob@example.com",
    "clubRole": "ADMIN",
    "joinedAt": "2026-01-27T09:15:00"
  }
]
```

**Club Roles:**
- `MEMBER`: Regular club member
- `ADMIN`: Club administrator (can manage members and update club)

---

## 5. Club Admin Endpoints

**🔒 Permission:** Only club admins can access these endpoints.

### 5.1 Promote Member to Admin

Promotes a regular member to admin status.

**Endpoint:** `PUT /api/v1/clubs/{clubId}/members/{userId}/promote`

**Example:** `PUT /api/v1/clubs/1/members/2/promote`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
{
  "message": "Member promoted to admin successfully"
}
```

**Error Response (403 Forbidden - Not Admin):**
```json
{
  "error": "Only club admins can promote members"
}
```

**Error Response (400 Bad Request - Already Admin):**
```json
{
  "error": "User is already a club admin"
}
```

**Error Response (404 Not Found - Not a Member):**
```json
{
  "error": "User is not a member of this club"
}
```

---

### 5.2 Remove Member from Club

Removes a member from the club. Cannot remove yourself (use leave endpoint).

**Endpoint:** `DELETE /api/v1/clubs/{clubId}/members/{userId}`

**Example:** `DELETE /api/v1/clubs/1/members/3`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
{
  "message": "Member removed successfully"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Only club admins can remove members"
}
```

**Error Response (400 Bad Request - Self Removal):**
```json
{
  "error": "Cannot remove yourself. Use the leave endpoint instead."
}
```

**Error Response (400 Bad Request - Last Admin):**
```json
{
  "error": "Cannot remove the last admin. Promote another member first."
}
```

**Business Rules:**
- Only admins can remove members
- Cannot remove yourself (must use leave endpoint)
- Cannot remove the last admin without promoting another member first

---

## 6. System Admin Endpoints

**🔒 Permission:** Only users with ADMIN role can access these endpoints.

### 6.1 Get All Users (Admin View)

Retrieves complete list of all users in the system.

**Endpoint:** `GET /api/v1/admin/users`

**Headers:**
```
Authorization: Bearer {{adminToken}}
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Admin User",
    "username": "admin",
    "email": "admin@tribenet.com",
    "role": "ADMIN"
  },
  {
    "id": 2,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER"
  },
  {
    "id": 3,
    "name": "Jane Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "role": "USER"
  }
]
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Only system administrators can access this resource"
}
```

---

### 6.2 Delete User

Deletes a user from the system. Cannot delete your own account.

**Endpoint:** `DELETE /api/v1/admin/users/{userId}`

**Headers:**
```
Authorization: Bearer {{adminToken}}
```

**Success Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

**Error Response (403 Forbidden - Not Admin):**
```json
{
  "error": "Only system administrators can delete users"
}
```

**Error Response (403 Forbidden - Self Deletion):**
```json
{
  "error": "Cannot delete your own account"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User not found with id: 99"
}
```

---

### 6.3 Force Delete Club (Admin)

Allows system admin to delete any club regardless of ownership.

**Endpoint:** `DELETE /api/v1/admin/clubs/{clubId}`

**Headers:**
```
Authorization: Bearer {{adminToken}}
```

**Success Response (200 OK):**
```json
{
  "message": "Club deleted successfully"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Only system administrators can force delete clubs"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Club not found with id: 99"
}
```

---

## 7. Payment Endpoints

Razorpay integration for paid club memberships.

### 7.1 Create Payment Order

Creates a Razorpay order for payment processing.

**Endpoint:** `POST /api/v1/payments/create-order?userId={userId}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Request Body:**
```json
{
  "amount": 500.00,
  "currency": "INR"
}
```

**Success Response (200 OK):**
```json
{
  "orderId": "order_MNbQx7y8z9ABC",
  "amount": 500.00,
  "currency": "INR",
  "status": "created",
  "keyId": "rzp_test_xxxxxxxxxxxxx"
}
```

---

### 7.2 Verify Payment

Verifies payment signature after successful payment.

**Endpoint:** `POST /api/v1/payments/verify`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Request Body:**
```json
{
  "razorpayOrderId": "order_MNbQx7y8z9ABC",
  "razorpayPaymentId": "pay_MNbQx7y8z9XYZ",
  "razorpaySignature": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "orderId": "order_MNbQx7y8z9ABC",
  "paymentId": "pay_MNbQx7y8z9XYZ",
  "amount": 500.00,
  "currency": "INR",
  "status": "SUCCESS",
  "createdAt": "2026-01-31T10:30:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Payment verification failed: Invalid signature"
}
```

---

### 7.3 Get User Payments

Retrieves payment history for a user.

**Endpoint:** `GET /api/v1/payments/user/{userId}`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "orderId": "order_MNbQx7y8z9ABC",
    "paymentId": "pay_MNbQx7y8z9XYZ",
    "amount": 500.00,
    "currency": "INR",
    "status": "SUCCESS",
    "createdAt": "2026-01-31T10:30:00"
  },
  {
    "id": 2,
    "orderId": "order_XYZ123456",
    "paymentId": null,
    "amount": 750.00,
    "currency": "INR",
    "status": "PENDING",
    "createdAt": "2026-01-31T15:45:00"
  }
]
```

---

### 7.4 Get Payment by ID

Retrieves specific payment details.

**Endpoint:** `GET /api/v1/payments/{id}`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "orderId": "order_MNbQx7y8z9ABC",
  "paymentId": "pay_MNbQx7y8z9XYZ",
  "amount": 500.00,
  "currency": "INR",
  "status": "SUCCESS",
  "createdAt": "2026-01-31T10:30:00"
}
```

---

## 8. Error Response Reference

### Standard Error Formats

#### Validation Errors (400 Bad Request)
```json
{
  "name": "Name is required",
  "email": "Email must be valid",
  "password": "Password must be at least 6 characters",
  "username": "Username must be between 3 and 50 characters"
}
```

#### Business Logic Errors (400 Bad Request)
```json
{
  "error": "You are already a member of this club"
}
```

#### Authentication Errors (401 Unauthorized)
```json
{
  "error": "Invalid credentials"
}
```

#### Authorization Errors (403 Forbidden)
```json
{
  "error": "Only club admins can update club details"
}
```

#### Resource Not Found (404 Not Found)
```json
{
  "error": "Club not found with id: 99"
}
```

#### Conflict Errors (409 Conflict)
```json
{
  "error": "Username already exists"
}
```

#### Server Errors (500 Internal Server Error)
```json
{
  "error": "An unexpected error occurred",
  "details": "NullPointerException: ..."
}
```

---

## 9. Complete Testing Workflow

### Scenario 1: User Registration and Club Creation

```
1. Register User 1 (John)
   POST /api/v1/auth/register
   Save username: johndoe

2. Login User 1
   POST /api/v1/auth/login
   Save token as {{token}}
   Save userId as {{userId}}

3. Create Photography Club (Free)
   POST /api/v1/clubs
   Save clubId as {{clubId}}

4. Verify membership
   GET /api/v1/clubs/{{clubId}}/members
   Expected: 1 member (John as ADMIN)

5. View created club
   GET /api/v1/clubs/{{clubId}}
   Expected: memberCount = 1
```

### Scenario 2: Multi-User Membership Management

```
1. Register User 2 (Jane)
   POST /api/v1/auth/register
   username: janesmith

2. Login User 2
   POST /api/v1/auth/login
   Save token as {{token2}}

3. User 2 joins Photography Club
   POST /api/v1/clubs/{{clubId}}/join
   (using {{token2}})

4. View club members (as User 1)
   GET /api/v1/clubs/{{clubId}}/members
   Expected: 2 members (John=ADMIN, Jane=MEMBER)

5. User 1 promotes User 2 to Admin
   PUT /api/v1/clubs/{{clubId}}/members/{{user2Id}}/promote
   (using {{token}})

6. User 2 updates club description
   PUT /api/v1/clubs/{{clubId}}
   (using {{token2}} - now has permission)

7. User 2 leaves club
   DELETE /api/v1/clubs/{{clubId}}/leave
   (using {{token2}})
```

### Scenario 3: Admin Operations

```
1. Manually set User 1 role to ADMIN in database:
   UPDATE users SET role = 'ADMIN' WHERE username = 'johndoe';

2. Login as Admin
   POST /api/v1/auth/login
   Save token as {{adminToken}}

3. View all users
   GET /api/v1/admin/users
   (using {{adminToken}})

4. Create test user to delete
   POST /api/v1/auth/register
   username: testuser

5. Delete test user
   DELETE /api/v1/admin/users/{{testUserId}}
   (using {{adminToken}})

6. Force delete any club
   DELETE /api/v1/admin/clubs/{{clubId}}
   (using {{adminToken}})
```

### Scenario 4: Payment Flow (Paid Club)

```
1. Create paid club
   POST /api/v1/clubs
   {
     "name": "Premium Club",
     "free": false,
     "price": 500.00
   }

2. Create payment order
   POST /api/v1/payments/create-order?userId={{userId}}
   Save orderId

3. Simulate Razorpay payment success
   (In real scenario, Razorpay SDK handles this)

4. Verify payment
   POST /api/v1/payments/verify
   {
     "razorpayOrderId": "{{orderId}}",
     "razorpayPaymentId": "pay_test123",
     "razorpaySignature": "signature"
   }

5. View payment history
   GET /api/v1/payments/user/{{userId}}
```

---

## 10. Postman Collection Setup

### Collection Structure

```
📁 TribeNet API
  📁 1. Authentication
    └── Register User
    └── Login
  📁 2. Users
    └── Get All Users
    └── Get User by ID
    └── Get User Clubs
  📁 3. Clubs
    └── Create Club (Free)
    └── Create Club (Paid)
    └── Get All Clubs
    └── Get Club by ID
    └── Update Club
    └── Delete Club
  📁 4. Membership
    └── Join Club
    └── Leave Club
    └── Get Club Members
  📁 5. Club Admin
    └── Promote Member
    └── Remove Member
  📁 6. System Admin
    └── Get All Users (Admin)
    └── Delete User
    └── Force Delete Club
  📁 7. Payments
    └── Create Order
    └── Verify Payment
    └── Get User Payments
    └── Get Payment by ID
```

### Collection-Level Authorization

**Type:** Bearer Token  
**Token:** `{{token}}`

This automatically applies to all requests except Authentication endpoints.

### Collection Variables

Create these at collection level:

```
baseUrl = http://localhost:8080
token = 
userId = 
clubId = 
adminToken = 
user2Token = 
user2Id = 
```

---

## 11. Automated Test Scripts

### Pre-request Script (Collection Level)

```javascript
// Add timestamp to requests for uniqueness
pm.variables.set("timestamp", Date.now());

// Log request for debugging
console.log(`${pm.request.method} ${pm.request.url.toString()}`);
```

### Global Test Script Template

```javascript
// Check response time
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Check JSON response
pm.test("Response is JSON", function () {
    pm.response.to.have.header("Content-Type", /application\/json/);
});
```

### Save Token from Login (Tests Tab)

```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    
    // Save authentication data
    pm.environment.set("token", jsonData.token);
    pm.environment.set("userId", jsonData.user.id);
    
    // Validate token format
    pm.expect(jsonData.token).to.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+$/);
    
    console.log("User ID: " + jsonData.user.id);
    console.log("Role: " + jsonData.user.role);
});
```

### Save Club ID from Create (Tests Tab)

```javascript
pm.test("Club created successfully", function () {
    pm.response.to.have.status(201);
    var jsonData = pm.response.json();
    
    pm.environment.set("clubId", jsonData.id);
    pm.expect(jsonData.memberCount).to.eql(1);
    pm.expect(jsonData.creatorId).to.eql(parseInt(pm.environment.get("userId")));
    
    console.log("Created Club ID: " + jsonData.id);
});
```

### Validate Error Response (Tests Tab)

```javascript
pm.test("Error response format is correct", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('error');
    pm.expect(jsonData.error).to.be.a('string');
    pm.expect(jsonData.error.length).to.be.above(0);
});
```

### Dynamic Username Generation (Pre-request Script)

```javascript
// Generate unique username for registration
var timestamp = Date.now();
pm.variables.set("uniqueUsername", "user_" + timestamp);
pm.variables.set("uniqueEmail", "user_" + timestamp + "@example.com");
```

Then in request body:
```json
{
  "name": "Test User",
  "username": "{{uniqueUsername}}",
  "email": "{{uniqueEmail}}",
  "password": "password123"
}
```

---

## Quick Reference Table

| Category | Method | Endpoint | Auth | Role Required |
|----------|--------|----------|------|---------------|
| **Auth** | POST | `/api/v1/auth/register` | No | - |
| **Auth** | POST | `/api/v1/auth/login` | No | - |
| **Users** | GET | `/api/v1/users` | Yes | Any |
| **Users** | GET | `/api/v1/users/{id}` | Yes | Any |
| **Users** | GET | `/api/v1/users/{id}/clubs` | Yes | Any |
| **Clubs** | POST | `/api/v1/clubs` | Yes | Any |
| **Clubs** | GET | `/api/v1/clubs` | Yes | Any |
| **Clubs** | GET | `/api/v1/clubs/{id}` | Yes | Any |
| **Clubs** | PUT | `/api/v1/clubs/{id}` | Yes | Club Admin |
| **Clubs** | DELETE | `/api/v1/clubs/{id}` | Yes | System Admin |
| **Member** | POST | `/api/v1/clubs/{id}/join` | Yes | Any |
| **Member** | DELETE | `/api/v1/clubs/{id}/leave` | Yes | Any |
| **Member** | GET | `/api/v1/clubs/{id}/members` | Yes | Any |
| **Admin** | PUT | `/api/v1/clubs/{cid}/members/{uid}/promote` | Yes | Club Admin |
| **Admin** | DELETE | `/api/v1/clubs/{cid}/members/{uid}` | Yes | Club Admin |
| **Sys Admin** | GET | `/api/v1/admin/users` | Yes | System Admin |
| **Sys Admin** | DELETE | `/api/v1/admin/users/{id}` | Yes | System Admin |
| **Sys Admin** | DELETE | `/api/v1/admin/clubs/{id}` | Yes | System Admin |
| **Payment** | POST | `/api/v1/payments/create-order` | Yes | Any |
| **Payment** | POST | `/api/v1/payments/verify` | Yes | Any |
| **Payment** | GET | `/api/v1/payments/user/{id}` | Yes | Any |
| **Payment** | GET | `/api/v1/payments/{id}` | Yes | Any |

---

## Notes

- All authenticated endpoints require `Authorization: Bearer {token}` header
- JWT tokens expire after the configured expiration time (default: 24 hours)
- System Admin role must be manually set in the database for testing
- Payment endpoints require valid Razorpay credentials in application.properties
- All timestamps are in ISO 8601 format (e.g., `2026-01-31T10:30:00`)
- Boolean values must be `true` or `false` (lowercase)
- Price values should be valid decimals (e.g., `500.00`, `99.99`)

---

**For Swagger UI Documentation:** Visit `http://localhost:8080/swagger-ui.html` after starting the application.
