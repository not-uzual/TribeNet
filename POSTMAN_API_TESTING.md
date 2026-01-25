# TribeNet API Testing with Postman

Complete guide for testing all TribeNet API endpoints using Postman.

---

## Setup

**Base URL:** `http://localhost:8080`

### Environment Variables (Optional)
Create these in Postman environment:
- `baseUrl` = `http://localhost:8080`
- `token` = (will be set automatically from login response)

---

## 1. Authentication Endpoints

### 1.1 Register User

**POST** `/api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "John Doe",
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "User registered successfully",
  "username": "john"
}
```

**Test Script (Optional):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

---

### 1.2 Login

**POST** `/api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "john",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "john",
  "role": "USER"
}
```

**Test Script (Save Token):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```

---

## 2. User Endpoints

**Note:** All endpoints below require JWT authentication.

**Authorization Header:**
```
Authorization: Bearer {{token}}
```

### 2.1 Get All Users

**GET** `/api/v1/users`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 2,
    "name": "Jane Smith",
    "username": "jane",
    "email": "jane@example.com",
    "role": "USER"
  }
]
```

---

### 2.2 Get User by ID

**GET** `/api/v1/users/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "username": "john",
  "email": "john@example.com",
  "role": "USER"
}
```

**Expected Response (404 Not Found):**
```json
{
  "error": "User not found with id: 99"
}
```

---

### 2.3 Get User's Clubs

**GET** `/api/v1/users/1/clubs`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Tech Enthusiasts",
    "description": "A community for tech lovers",
    "category": "Technology",
    "free": true,
    "price": null,
    "clubRole": "ADMIN"
  }
]
```

---

## 3. Club Endpoints

### 3.1 Create Club

**POST** `/api/v1/clubs`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "name": "Tech Enthusiasts",
  "description": "A community for tech lovers",
  "category": "Technology",
  "free": true
}
```

**Body (Paid Club):**
```json
{
  "name": "Premium Book Club",
  "description": "Exclusive book discussions",
  "category": "Literature",
  "free": false,
  "price": 9.99
}
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "name": "Tech Enthusiasts",
  "description": "A community for tech lovers",
  "category": "Technology",
  "free": true,
  "price": null,
  "creatorId": 1,
  "memberCount": 1
}
```

---

### 3.2 Get All Clubs

**GET** `/api/v1/clubs`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Tech Enthusiasts",
    "description": "A community for tech lovers",
    "category": "Technology",
    "free": true,
    "price": null,
    "creatorId": 1,
    "memberCount": 3
  }
]
```

---

### 3.3 Get Club by ID

**GET** `/api/v1/clubs/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "name": "Tech Enthusiasts",
  "description": "A community for tech lovers",
  "category": "Technology",
  "free": true,
  "price": null,
  "creatorId": 1,
  "memberCount": 3
}
```

---

### 3.4 Update Club

**PUT** `/api/v1/clubs/1`

**Note:** Only club admins can update.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "description": "Updated description",
  "category": "Tech & Innovation"
}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "name": "Tech Enthusiasts",
  "description": "Updated description",
  "category": "Tech & Innovation",
  "free": true,
  "price": null,
  "creatorId": 1,
  "memberCount": 3
}
```

**Expected Response (403 Forbidden):**
```json
{
  "error": "Only club admins can update club details"
}
```

---

### 3.5 Delete Club

**DELETE** `/api/v1/clubs/1`

**Note:** Only system admins can delete clubs.

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Club deleted successfully"
}
```

**Expected Response (403 Forbidden):**
```json
{
  "error": "Only system administrators can delete clubs"
}
```

---

## 4. Membership Endpoints

### 4.1 Join Club

**POST** `/api/v1/clubs/1/join`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Successfully joined the club"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "You are already a member of this club"
}
```

---

### 4.2 Leave Club

**DELETE** `/api/v1/clubs/1/leave`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Successfully left the club"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Cannot leave club: you are the last admin. Please promote another member first or delete the club."
}
```

---

### 4.3 Get Club Members

**GET** `/api/v1/clubs/1/members`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "userId": 1,
    "name": "John Doe",
    "username": "john",
    "email": "john@example.com",
    "clubRole": "ADMIN",
    "joinedAt": "2026-01-25T10:30:00"
  },
  {
    "userId": 2,
    "name": "Jane Smith",
    "username": "jane",
    "email": "jane@example.com",
    "clubRole": "MEMBER",
    "joinedAt": "2026-01-25T11:00:00"
  }
]
```

---

## 5. Club Admin Endpoints

**Note:** Only club admins can access these endpoints.

### 5.1 Promote Member to Admin

**PUT** `/api/v1/clubs/1/members/2/promote`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Member promoted to admin successfully"
}
```

**Expected Response (403 Forbidden):**
```json
{
  "error": "Only club admins can promote members"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "User is already a club admin"
}
```

---

### 5.2 Remove Member from Club

**DELETE** `/api/v1/clubs/1/members/2`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Member removed successfully"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Cannot remove yourself. Use the leave endpoint instead."
}
```

---

## 6. System Admin Endpoints

**Note:** Only users with ADMIN role can access these endpoints.

### 6.1 Get All Users (Admin View)

**GET** `/api/v1/admin/users`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Admin User",
    "username": "admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  {
    "id": 2,
    "name": "John Doe",
    "username": "john",
    "email": "john@example.com",
    "role": "USER"
  }
]
```

---

### 6.2 Delete User

**DELETE** `/api/v1/admin/users/2`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

**Expected Response (403 Forbidden):**
```json
{
  "error": "Cannot delete your own account"
}
```

---

### 6.3 Force Delete Club

**DELETE** `/api/v1/admin/clubs/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Club deleted successfully"
}
```

---

## 7. Error Responses

### Validation Errors (400 Bad Request)

**Example:**
```json
{
  "name": "Club name is required",
  "description": "Description is required"
}
```

### Unauthorized (401 Unauthorized)

**Example:**
```json
{
  "error": "Invalid credentials"
}
```

### Forbidden (403 Forbidden)

**Example:**
```json
{
  "error": "Only club admins can update club details"
}
```

### Not Found (404 Not Found)

**Example:**
```json
{
  "error": "Club not found with id: 99"
}
```

---

## 8. Testing Workflow

### Complete Test Flow:

1. **Register User 1 (Admin)**
   - POST `/api/v1/auth/register`
   - Set role as ADMIN in database manually for testing

2. **Login User 1**
   - POST `/api/v1/auth/login`
   - Save token

3. **Create Club**
   - POST `/api/v1/clubs`
   - User 1 becomes club admin

4. **Register User 2**
   - POST `/api/v1/auth/register`

5. **Login User 2**
   - POST `/api/v1/auth/login`
   - Save token

6. **User 2 Joins Club**
   - POST `/api/v1/clubs/1/join`

7. **Get Club Members**
   - GET `/api/v1/clubs/1/members`

8. **Promote User 2 (as User 1)**
   - PUT `/api/v1/clubs/1/members/2/promote`

9. **Update Club (as User 2)**
   - PUT `/api/v1/clubs/1`

10. **User 2 Leaves Club**
    - DELETE `/api/v1/clubs/1/leave`

---

## 9. Postman Collection Import

### Create Collection:

1. Create new collection named "TribeNet API"
2. Add folder "1. Authentication"
3. Add folder "2. Users"
4. Add folder "3. Clubs"
5. Add folder "4. Membership"
6. Add folder "5. Club Admin"
7. Add folder "6. System Admin"

### Collection Variables:
```
baseUrl: http://localhost:8080
token: (empty - set from login)
```

### Authorization (Collection Level):
- Type: Bearer Token
- Token: {{token}}

---

## 10. Common Test Scripts

### Save Token from Login:
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```

### Verify Success Response:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
});
```

### Verify Created Response:
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has id", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
});
```

### Verify Error Response:
```javascript
pm.test("Status code is 403", function () {
    pm.response.to.have.status(403);
});

pm.test("Response has error message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('error');
});
```

---

## Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Register | POST | `/api/v1/auth/register` |
| Login | POST | `/api/v1/auth/login` |
| Create Club | POST | `/api/v1/clubs` |
| Join Club | POST | `/api/v1/clubs/{id}/join` |
| Get Members | GET | `/api/v1/clubs/{id}/members` |
| Promote | PUT | `/api/v1/clubs/{id}/members/{userId}/promote` |
| Leave Club | DELETE | `/api/v1/clubs/{id}/leave` |

**All endpoints except `/auth/**` require JWT token in Authorization header.**
