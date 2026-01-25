# ScholarHub API Endpoints Documentation

**Base URL**: `http://localhost:8080/api`

---

## 🔐 Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login and get tokens | Public |
| POST | `/auth/refresh` | Get new access token | Public (Requires refresh token) |
| POST | `/auth/logout` | Logout and blacklist token | Yes |
| POST | `/auth/verify-email` | Verify user email | Public |
| POST | `/auth/forgot-password`| Request password reset | Public |
| POST | `/auth/reset-password` | Reset password with token | Public |
| GET | `/auth/me` | Get current user's info | Yes |

---

## 👤 User Management (`/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/users/profile` | Get logged-in user profile | Yes |
| PUT | `/users/profile` | Update logged-in user profile | Yes |
| PUT | `/users/change-password`| Update user password | Yes |
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin |
| PUT | `/users/:id/block` | Block/Unblock a user | Admin |
| PUT | `/users/:id/verify-professor`| Verify professor status | Admin |
| DELETE| `/users/:id` | Delete a user | Admin |

---

## 🎓 Scholarships (`/scholarships`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/scholarships` | Get list of scholarships | Public |
| GET | `/scholarships/:id` | Get single scholarship | Optional |
| POST | `/scholarships` | Create a scholarship | Professor/Admin |
| GET | `/scholarships/professor/my`| Get own scholarships | Professor |
| PUT | `/scholarships/:id` | Update a scholarship | Owner/Admin |
| DELETE| `/scholarships/:id` | Delete a scholarship | Owner/Admin |
| GET | `/scholarships/admin/pending`| View pending approvals | Admin |
| PUT | `/scholarships/:id/approve` | Approve a scholarship | Admin |
| PUT | `/scholarships/:id/reject` | Reject a scholarship | Admin |
| PUT | `/scholarships/:id/feature`| Toggle featured status | Admin |

**Filters (Query Params)**: `page`, `limit`, `search`, `country`, `degreeLevel`, `fundingType`, `category`, `status`, `featured`, `language`, `studyMode`, `open`, `sortBy`, `sortOrder`.

---

## 📝 Applications (`/applications`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/applications` | Submit application | Student |
| GET | `/applications` | Get own applications | Student |
| GET | `/applications/:id` | Get single application | Owner/Creator/Admin |
| PUT | `/applications/:id` | Update (Draft/Pending) | Student |
| PUT | `/applications/:id/withdraw`| Withdraw application | Student |
| GET | `/applications/professor/received`| View received apps | Professor |
| PUT | `/applications/:id/evaluate`| Accept/Reject application | Professor |
| GET | `/applications/admin/all` | View all applications | Admin |
| GET | `/applications/admin/stats` | View application metrics | Admin |

---

## 📂 Categories (`/categories`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/categories` | Get active categories | Public |
| GET | `/categories/:slug` | Get specific category | Public |
| GET | `/categories/admin/all`| View all (incl. inactive) | Admin |
| POST | `/categories` | Create new category | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE| `/categories/:id` | Delete category | Admin |

---

## 🔖 Saved Scholarships (`/saved`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/saved` | Bookmark a scholarship | Yes |
| GET | `/saved` | List all bookmarked | Yes |
| GET | `/saved/check/:scholarshipId`| Check if bookmarked | Yes |
| DELETE| `/saved/:scholarshipId` | Remove bookmark | Yes |

---

## 🔔 Notifications (`/notifications`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/notifications` | Get user notifications | Yes |
| PUT | `/notifications/:id/read`| Mark as read | Yes |
| PUT | `/notifications/read-all`| Mark all as read | Yes |
| DELETE| `/notifications/:id` | Delete notification | Yes |
| POST | `/notifications/admin/send`| Send custom alert | Admin |
| POST | `/notifications/admin/deadline-reminders`| Auto-send reminders | Admin |

---

## 💬 Testimonials (`/testimonials`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/testimonials` | Get all testimonials (paginated) | Public |
| GET | `/testimonials/:id` | Get testimonial by ID | Public |
| GET | `/testimonials/professor/:professorId` | Get testimonials by professor | Public |
| POST | `/testimonials` | Create testimonial | Professor/Admin |
| PUT | `/testimonials/:id` | Update testimonial | Owner/Admin |
| DELETE| `/testimonials/:id` | Delete testimonial | Owner/Admin |

**Filters (Query Params)**: `limit`, `offset` (for pagination).

### POST `/testimonials` - Create Testimonial
**Body**:
```json
{
  "quote": "Education is the most powerful weapon which you can use to change the world.",
  "author": "Nelson Mandela",
  "role": "Global Leader & Visionary",
  "image": "https://example.com/image.jpg",
  "gradient": "from-emerald-400 to-blue-500"
}
```

### PUT `/testimonials/:id` - Update Testimonial
**Body**: Same as POST (all fields optional)

---
