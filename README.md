# TribeNet - Club Management Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A Spring Boot REST API for managing student clubs with JWT authentication and role-based access control, using MySQL database with JPA/Hibernate for data persistence. Users can create/join clubs (free or paid via Razorpay), while admins manage memberships and permissions at different hierarchy levels.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Security Implementation](#security-implementation)
- [Payment Integration](#payment-integration)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

## Overview

TribeNet streamlines club management for educational institutions. Students can create, join, and manage clubs while administrators oversee the platform. The system implements JWT authentication, role-based access control, and secure payment processing.

## Features

### Authentication & Authorization
- JWT-based stateless authentication (HMAC SHA-256)
- Role-based access control (USER, CLUB_ADMIN, SYSTEM_ADMIN)
- BCrypt password encryption
- Custom security filter chain

### User Management
- User registration with validation
- Profile retrieval and management
- View club memberships
- Admin-only user deletion

### Club Management
- Create clubs with descriptions, categories, and pricing
- Update club details (admins only)
- Delete clubs (system admin only)
- Support for free and paid memberships
- Browse and discover clubs by category

### Membership Management
- Join/leave clubs
- View club members with roles
- Hierarchical roles (MEMBER, ADMIN)
- Promote members to admin
- Remove members from clubs

### Payment Processing
- Razorpay integration for paid memberships
- Order creation and payment verification
- Payment status tracking (PENDING, SUCCESS, FAILED)
- Transaction history

### Admin Capabilities
- System-wide user and club management
- Delete any user or club
- Full platform oversight

## Technology Stack

**Backend:** Spring Boot 4.0.2, Java 21, Maven  
**Database:** MySQL 8.0, Spring Data JPA, Hibernate  
**Security:** Spring Security 6.x, JWT, BCrypt  
**Payment:** Razorpay SDK  
**Documentation:** Swagger/OpenAPI 3.0  
**Validation:** Jakarta Bean Validation  
**Tools:** Lombok, Spring DevTools, Thymeleaf

## Architecture

```
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  (Controllers + DTOs)               │
├─────────────────────────────────────┤
│     Security Layer                  │
│  (JWT Filter + Security Config)     │
├─────────────────────────────────────┤
│     Business Logic Layer            │
│  (Services)                         │
├─────────────────────────────────────┤
│     Data Access Layer               │
│  (Repositories + JPA)               │
├─────────────────────────────────────┤
│     Domain Model Layer              │
│  (Entities + Enums)                 │
└─────────────────────────────────────┘
```

### Design Patterns

- DTO Pattern for request/response isolation
- Repository Pattern with Spring Data JPA
- Constructor-based Dependency Injection
- Filter Chain for JWT authentication
- Service Layer for business logic
- Centralized Exception Handling

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐         ┌─────────────────┐         ┌──────────────┐
│    User      │         │   UserClub      │         │    Club      │
├──────────────┤         ├─────────────────┤         ├──────────────┤
│ id (PK)      │────────<│ user_id (FK)    │>────────│ id (PK)      │
│ name         │         │ club_id (FK)    │         │ name         │
│ username     │         │ clubRole        │         │ description  │
│ email        │         │ joinedAt        │         │ category     │
│ password     │         └─────────────────┘         │ free         │
│ role         │                                     │ price        │
└──────────────┘                                     │ creator_id   │
                                                     └──────────────┘

┌──────────────┐
│   Payment    │
├──────────────┤
│ id (PK)      │
│ orderId      │
│ paymentId    │
│ amount       │
│ currency     │
│ status       │
│ userId       │
│ createdAt    │
│ updatedAt    │
└──────────────┘
```

### Entities

**User:** Account information with username, email, password (BCrypt), and role (USER/ADMIN)

**Club:** Club details including name, description, category, free/paid status, and price

**UserClub:** Join table managing many-to-many relationships with clubRole (MEMBER/ADMIN) and joinedAt timestamp. Unique constraint on (user_id, club_id)

**Payment:** Transaction tracking with orderId, paymentId, amount, currency, and status (PENDING/SUCCESS/FAILED)

## Getting Started

### Prerequisites

- **Java Development Kit (JDK) 21** or higher
- **Maven 3.8+** (included via Maven Wrapper)
- **MySQL 8.0+** with root or admin access
- **Git** for version control
- **Razorpay Account** (for payment features)

### Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/tribenet.git
cd tribenet
```

#### 2. Database Setup
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE tribenet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated user (optional but recommended)
CREATE USER 'tribenet_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON tribenet.* TO 'tribenet_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Application Name
spring.application.name=TribeNet

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/tribenet?useSSL=false&serverTimezone=UTC
spring.datasource.username=tribenet_user
spring.datasource.password=your_secure_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration (Generate a secure 256-bit key)
jwt.secret=your_32_character_secret_key_minimum_256_bits_long
jwt.expiration=86400000

# Razorpay Configuration
razorpay.key_id=your_razorpay_key_id
razorpay.key_secret=your_razorpay_key_secret

# Server Configuration
server.port=8080

# Logging
logging.level.org.tribenet=DEBUG
logging.level.org.springframework.security=DEBUG
```

#### 4. Generate JWT Secret Key

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### 5. Setup Razorpay (Optional - for payment features)

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings → API Keys
3. Generate Test/Live API keys
4. Copy `Key ID` and `Key Secret` to application.properties

#### 6. Build the Application

```bash
# Using Maven Wrapper (recommended)
./mvnw clean install

# On Windows
mvnw.cmd clean install

# Using local Maven
mvn clean install
```

#### 7. Run the Application

```bash
# Using Maven Wrapper
./mvnw spring-boot:run

# On Windows
mvnw.cmd spring-boot:run

# Using JAR file
java -jar target/TribeNet-0.0.1-SNAPSHOT.jar
```

#### 8. Verify Installation

- **API Health Check**: http://localhost:8080/
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### User Endpoints

All user endpoints require JWT authentication via `Authorization: Bearer <token>` header.

#### Get All Users
```http
GET /api/v1/users
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER"
  }
]
```

#### Get User by ID
```http
GET /api/v1/users/{userId}
Authorization: Bearer <token>
```

#### Get User's Clubs
```http
GET /api/v1/users/{userId}/clubs
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "name": "Photography Club",
    "description": "Learn and practice photography",
    "category": "Arts",
    "free": true,
    "memberCount": 25
  }
]
```

### Club Endpoints

#### Create Club
```http
POST /api/v1/clubs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chess Club",
  "description": "Strategic board game enthusiasts",
  "category": "Sports",
  "free": false,
  "price": 500.00
}

Response: 201 Created
{
  "id": 5,
  "name": "Chess Club",
  "description": "Strategic board game enthusiasts",
  "category": "Sports",
  "free": false,
  "price": 500.00,
  "creator": {
    "id": 1,
    "name": "John Doe"
  },
  "memberCount": 1
}
```

#### Get All Clubs
```http
GET /api/v1/clubs
Authorization: Bearer <token>
```

#### Get Club by ID
```http
GET /api/v1/clubs/{clubId}
Authorization: Bearer <token>
```

#### Update Club
```http
PUT /api/v1/clubs/{clubId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Club Name",
  "description": "Updated description",
  "category": "Technology",
  "free": true
}
```

#### Delete Club
```http
DELETE /api/v1/clubs/{clubId}
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Club deleted successfully"
}
```

### Membership Endpoints

#### Join Club
```http
POST /api/v1/clubs/{clubId}/join
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Successfully joined the club"
}
```

#### Leave Club
```http
DELETE /api/v1/clubs/{clubId}/leave
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Successfully left the club"
}
```

#### Get Club Members
```http
GET /api/v1/clubs/{clubId}/members
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "userId": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "clubRole": "CREATOR",
    "joinedAt": "2024-01-15T10:30:00"
  },
  {
    "userId": 2,
    "name": "Jane Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "clubRole": "MEMBER",
    "joinedAt": "2024-01-16T14:20:00"
  }
]
```

#### Promote Member to Admin
```http
PUT /api/v1/clubs/{clubId}/members/{userId}/promote
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Member promoted to admin successfully"
}
```

#### Remove Member
```http
DELETE /api/v1/clubs/{clubId}/members/{userId}
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Member removed successfully"
}
```

### Payment Endpoints

#### Create Razorpay Order
```http
POST /api/v1/payments/create-order?userId=1
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500.00,
  "currency": "INR"
}

Response: 200 OK
{
  "orderId": "order_MNbQx7y8z9ABC",
  "amount": 500.00,
  "currency": "INR",
  "status": "created",
  "keyId": "rzp_test_xxxxx"
}
```

#### Verify Payment
```http
POST /api/v1/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpayOrderId": "order_MNbQx7y8z9ABC",
  "razorpayPaymentId": "pay_MNbQx7y8z9XYZ",
  "razorpaySignature": "generated_signature_hash"
}

Response: 200 OK
{
  "id": 1,
  "orderId": "order_MNbQx7y8z9ABC",
  "paymentId": "pay_MNbQx7y8z9XYZ",
  "amount": 500.00,
  "currency": "INR",
  "status": "SUCCESS",
  "createdAt": "2024-01-15T10:30:00"
}
```

#### Get User Payments
```http
GET /api/v1/payments/user/{userId}
Authorization: Bearer <token>
```

#### Get Payment by ID
```http
GET /api/v1/payments/{id}
Authorization: Bearer <token>
```

### Admin Endpoints

Requires ADMIN role in JWT token.

#### Get All Users (Admin)
```http
GET /api/v1/admin/users
Authorization: Bearer <admin-token>
```

#### Delete User (Admin)
```http
DELETE /api/v1/admin/users/{userId}
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "message": "User deleted successfully"
}
```

#### Delete Club (Admin)
```http
DELETE /api/v1/admin/clubs/{clubId}
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "message": "Club deleted successfully"
}
```

Visit **http://localhost:8080/swagger-ui.html** for complete interactive API documentation.

## Security Implementation

### JWT Authentication Flow

1. User provides credentials at registration/login
2. Server generates JWT with username and role claims
3. Client receives and stores token
4. Client includes token in Authorization header for requests
5. JwtAuthenticationFilter validates token on each request
6. Role-based authorization enforced

### JWT Token Structure

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "johndoe",
  "role": "USER",
  "iat": 1705334400,
  "exp": 1705420800
}

Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### Security Features

- Stateless sessions (no server-side storage)
- CSRF disabled (token-based auth)
- BCrypt password encryption
- Configurable CORS
- HTTPS/SSL ready

### Role-Based Access Control

| Endpoint | USER | CLUB_ADMIN | SYSTEM_ADMIN |
|----------|------|------------|--------------|
| Register/Login | ✅ | ✅ | ✅ |
| Create Club | ✅ | ✅ | ✅ |
| Join Club | ✅ | ✅ | ✅ |
| Update Club | Creator/Admin | ✅ | ✅ |
| Delete Club | Creator | Creator | ✅ |
| Promote Member | ❌ | ✅ | ✅ |
| Remove Member | ❌ | ✅ | ✅ |
| Delete User | ❌ | ❌ | ✅ |
| Admin Operations | ❌ | ❌ | ✅ |

## Payment Integration

### Razorpay Flow

**Order Creation:** Client requests order → Server creates Razorpay order → Returns order details

**Payment Verification:** Client completes payment → Razorpay returns signature → Server verifies using HMAC SHA-256 → Status updated

**Security:** Signature verification, unique order IDs, status tracking, comprehensive error handling

## Error Handling

### Exception Hierarchy

```
Exception
  └── RuntimeException
        ├── ResourceNotFoundException (404)
        ├── UnauthorizedException (403)
        ├── BadRequestException (400)
        ├── PaymentException (400)
        └── MethodArgumentNotValidException (400)
```

### Error Response Format

```json
{
  "error": "Resource not found",
  "details": "Club with ID 999 does not exist"
}
```

### Validation Error Format

```json
{
  "name": "Name must not be blank",
  "email": "Email must be valid",
  "password": "Password must be at least 8 characters"
}
```

### Global Exception Handler

Centralized exception handling with @RestControllerAdvice ensures consistent error responses across all endpoints with appropriate HTTP status codes.

## Testing

### Running Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=TribeNetApplicationTests

# Run with coverage
./mvnw test jacoco:report
```

### Test Structure

- **Unit Tests**: Service layer logic testing
- **Integration Tests**: Controller and repository testing
- **Security Tests**: Authentication and authorization testing
- **Test Database**: H2 in-memory database for testing

## Deployment

### Production Checklist

- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` (never use `update` in production)
- [ ] Configure production database with connection pooling
- [ ] Set strong JWT secret (minimum 256 bits)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for specific origins
- [ ] Set up logging with rotation
- [ ] Configure external configuration (environment variables)
- [ ] Set up monitoring and health checks
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Docker Deployment (Optional)

```dockerfile
FROM eclipse-temurin:21-jdk-alpine
VOLUME /tmp
COPY target/TribeNet-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

```bash
docker build -t tribenet .
docker run -p 8080:8080 tribenet
```

### Environment Variables

```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/tribenet
export SPRING_DATASOURCE_USERNAME=tribenet_user
export SPRING_DATASOURCE_PASSWORD=secure_password
export JWT_SECRET=your_production_secret_key
export RAZORPAY_KEY_ID=your_key_id
export RAZORPAY_KEY_SECRET=your_key_secret
```

## Project Structure

```
TribeNet/
├── src/
│   ├── main/
│   │   ├── java/org/tribenet/tribenet/
│   │   │   ├── config/              # Security & Configuration
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── RazorpayConfig.java
│   │   │   ├── controller/          # REST Controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── UserController.java
│   │   │   │   ├── ClubController.java
│   │   │   │   ├── AdminController.java
│   │   │   │   └── PaymentController.java
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── RegisterDTO.java
│   │   │   │   ├── LoginDTO.java
│   │   │   │   ├── AuthResponseDTO.java
│   │   │   │   ├── ClubCreateDTO.java
│   │   │   │   ├── ClubUpdateDTO.java
│   │   │   │   ├── ClubDetailDTO.java
│   │   │   │   ├── UserResponseDTO.java
│   │   │   │   ├── MemberResponseDTO.java
│   │   │   │   ├── CreateOrderRequest.java
│   │   │   │   ├── PaymentVerificationRequest.java
│   │   │   │   ├── OrderResponse.java
│   │   │   │   └── PaymentResponse.java
│   │   │   ├── exception/           # Custom Exceptions
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── UnauthorizedException.java
│   │   │   │   ├── BadRequestException.java
│   │   │   │   └── PaymentException.java
│   │   │   ├── model/               # JPA Entities
│   │   │   │   ├── User.java
│   │   │   │   ├── Club.java
│   │   │   │   ├── UserClub.java
│   │   │   │   ├── Payment.java
│   │   │   │   ├── Role.java
│   │   │   │   ├── ClubRole.java
│   │   │   │   ├── PaymentStatus.java
│   │   │   │   └── UserPrincipal.java
│   │   │   ├── repository/          # Data Access Layer
│   │   │   │   ├── UserRepo.java
│   │   │   │   ├── ClubRepo.java
│   │   │   │   ├── UserClubRepo.java
│   │   │   │   └── PaymentRepository.java
│   │   │   ├── service/             # Business Logic
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── ClubService.java
│   │   │   │   ├── AdminService.java
│   │   │   │   └── PaymentService.java
│   │   │   ├── utility/             # Helper Classes
│   │   │   │   └── JwtUtil.java
│   │   │   └── TribeNetApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/              # Landing Page
│   │           ├── index.html
│   │           ├── styles.css
│   │           └── script.js
│   └── test/
│       └── java/org/tribenet/tribenet/
│           └── TribeNetApplicationTests.java
├── target/                          # Build Output
├── pom.xml                          # Maven Configuration
├── README.md                        # This File
├── POSTMAN_API_TESTING.md          # API Testing Guide
├── mvnw                            # Maven Wrapper (Unix)
└── mvnw.cmd                        # Maven Wrapper (Windows)
```

## Key Implementations

- Custom JWT handling with `JwtUtil`
- `JwtAuthenticationFilter` for request-level authentication
- DTO pattern for API contracts
- Service layer for business logic
- Spring Data JPA repositories
- Global exception handling
- Razorpay SDK integration
- Jakarta Bean Validation
