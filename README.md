# ScholarHub API

A professional Node.js + Express.js + PostgreSQL REST API for the ScholarHub scholarship platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/verify-email` | Verify email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users/profile` | Get profile | Auth |
| PUT | `/api/users/profile` | Update profile | Auth |
| GET | `/api/users` | List all users | Admin |
| PUT | `/api/users/:id/block` | Block/unblock user | Admin |
| PUT | `/api/users/:id/verify-professor` | Verify professor | Admin |

### Scholarships
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/scholarships` | List scholarships | Public |
| GET | `/api/scholarships/:id` | Get scholarship | Public |
| POST | `/api/scholarships` | Create scholarship | Professor |
| PUT | `/api/scholarships/:id` | Update scholarship | Owner/Admin |
| DELETE | `/api/scholarships/:id` | Delete scholarship | Owner/Admin |
| PUT | `/api/scholarships/:id/approve` | Approve | Admin |
| PUT | `/api/scholarships/:id/reject` | Reject | Admin |

### Applications
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/applications` | Apply | Student |
| GET | `/api/applications` | My applications | Student |
| PUT | `/api/applications/:id/withdraw` | Withdraw | Student |
| GET | `/api/applications/professor/received` | Received apps | Professor |
| PUT | `/api/applications/:id/evaluate` | Evaluate | Professor |

### Categories
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/categories` | List categories | Public |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |

### Saved & Notifications
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/saved` | Save scholarship | Auth |
| GET | `/api/saved` | Get saved | Auth |
| DELETE | `/api/saved/:id` | Unsave | Auth |
| GET | `/api/notifications` | Get notifications | Auth |
| PUT | `/api/notifications/read-all` | Mark all read | Auth |

## 🔐 Test Credentials

```
Admin:     admin@scholarhub.com / Admin@123
Professor: professor@university.edu / Prof@123
Student:   student@example.com / Student@123
```

## 🛠️ Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

## 📁 Project Structure

```
src/
├── config/          # Configuration
├── controllers/     # Request handlers
├── lib/             # Prisma client
├── middleware/      # Auth, validation, error handling
├── routes/          # API routes
├── utils/           # Helpers (JWT, password, errors)
├── app.ts          # Express app
└── index.ts        # Entry point
```
