# TribeNet

A Spring Boot REST API for club management with JWT authentication.

## Tech Stack

- Spring Boot 4.0.2
- Java 21
- MySQL 8.0
- Maven

## Setup

1. Create MySQL database:
```sql
CREATE DATABASE tribenet;
```

2. Configure database in `src/main/resources/application-local.properties`

3. Run application:
```bash
./mvnw spring-boot:run
```

## API Endpoints

**Authentication:**
- POST `/api/v1/auth/register` - Register user
- POST `/api/v1/auth/login` - Login

**Users:**
- GET `/api/v1/users` - List users
- GET `/api/v1/users/{id}` - Get user
- GET `/api/v1/users/{id}/clubs` - Get user's clubs

**Clubs:**
- POST `/api/v1/clubs` - Create club
- GET `/api/v1/clubs` - List clubs
- GET `/api/v1/clubs/{id}` - Get club
- PUT `/api/v1/clubs/{id}` - Update club
- DELETE `/api/v1/clubs/{id}` - Delete club

**Membership:**
- POST `/api/v1/clubs/{id}/join` - Join club
- DELETE `/api/v1/clubs/{id}/leave` - Leave club
- GET `/api/v1/clubs/{id}/members` - List members

**Club Admin:**
- PUT `/api/v1/clubs/{id}/members/{userId}/promote` - Promote to admin
- DELETE `/api/v1/clubs/{id}/members/{userId}` - Remove member

**System Admin:**
- GET `/api/v1/admin/users` - List all users
- DELETE `/api/v1/admin/users/{id}` - Delete user
- DELETE `/api/v1/admin/clubs/{id}` - Delete club

## Documentation

Swagger UI: `http://localhost:8080/swagger-ui.html`

API Testing: See `POSTMAN_API_TESTING.md`
