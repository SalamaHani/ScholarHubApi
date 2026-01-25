# Testimonials API - Quick Reference

## ⚡ Quick Start

### Test with cURL

**1. Get All Testimonials (Public)**
```bash
curl http://localhost:8080/api/testimonials
```

**2. Login as Professor**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "professor@university.edu",
    "password": "Prof@123"
  }'
```

**3. Create Testimonial (Requires Professor Token)**
```bash
curl -X POST http://localhost:8080/api/testimonials \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quote": "Education changes lives and opens doors.",
    "author": "Dr. Sarah Johnson",
    "role": "University Dean",
    "gradient": "from-purple-400 to-pink-600"
  }'
```

**4. Get All Testimonials by Professor**
```bash
curl http://localhost:8080/api/testimonials/professor/PROFESSOR_ID
```

**5. Update Your Testimonial**
```bash
curl -X PUT http://localhost:8080/api/testimonials/TESTIMONIAL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quote": "Updated quote text here"
  }'
```

**6. Delete Your Testimonial**
```bash
curl -X DELETE http://localhost:8080/api/testimonials/TESTIMONIAL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📋 Endpoint Summary

| HTTP | Path | Auth | Description |
|------|------|------|-------------|
| GET | `/testimonials` | None | Get all testimonials |
| GET | `/testimonials/:id` | None | Get one testimonial |
| GET | `/testimonials/professor/:id` | None | Get by professor |
| POST | `/testimonials` | Yes* | Create testimonial |
| PUT | `/testimonials/:id` | Yes* | Update testimonial |
| DELETE | `/testimonials/:id` | Yes* | Delete testimonial |

*Auth = Professor/Admin required

---

## 🔑 Default Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Professor | `professor@university.edu` | `Prof@123` |
| Admin | `admin@scholarhub.com` | `Admin@123` |
| Student | `student@example.com` | `Student@123` |

---

## 🎨 Popular Gradient Combinations

```
from-emerald-400 to-blue-500
from-amber-400 to-rose-500
from-blue-400 to-indigo-600
from-purple-400 to-pink-600
from-green-400 to-teal-500
from-orange-400 to-red-500
from-indigo-400 to-purple-600
from-cyan-400 to-blue-600
```

---

## ✅ Current Seed Data

The database includes 4 default testimonials:

1. **Nelson Mandela** - "Education is the most powerful weapon which you can use to change the world."
2. **B.B. King** - "The beautiful thing about learning is that no one can take it away from you."
3. **Benjamin Franklin** - "Invest in yourself. Education pays the best interest for your future career."
4. **Academic Board** - "Scholarship is the key that unlocks the doors of opportunity and excellence."

---

## 📝 Full Request/Response Example

### Request
```bash
POST /api/testimonials HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "quote": "Education is the key to breaking cycles of poverty.",
  "author": "Malala Yousafzai",
  "role": "Nobel Laureate & Education Activist",
  "image": null,
  "gradient": "from-pink-400 to-rose-600"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Testimonial created successfully",
  "data": {
    "testimonial": {
      "id": "clx8z9k5a0001k7p0w2q3r4s5",
      "quote": "Education is the key to breaking cycles of poverty.",
      "author": "Malala Yousafzai",
      "role": "Nobel Laureate & Education Activist",
      "image": null,
      "gradient": "from-pink-400 to-rose-600",
      "professor": {
        "id": "clx8z5k1a0001k7p0w2h3i4j5",
        "firstName": "Dr. Ahmed",
        "lastName": "Hassan",
        "avatar": null
      },
      "createdAt": "2026-01-23T10:30:00.000Z"
    }
  }
}
```

---

## ⚙️ Technical Stack

- **Framework**: Express.js (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (Bearer tokens)
- **Validation**: Express middleware validators
- **Error Handling**: Custom ApiError utility class

---

## 📂 File Structure

```
SchHubApi/
├── src/
│   ├── controllers/
│   │   └── testimonial.controller.ts    ← Business logic
│   ├── routes/
│   │   └── testimonial.routes.ts        ← Endpoint definitions
│   └── middleware/
│       └── auth.ts                       ← Authentication/Authorization
├── prisma/
│   ├── schema.prisma                    ← Database schema (Testimonial model)
│   ├── seed.ts                          ← Seeded testimonials
│   └── migrations/
│       └── 20260123000000_add_testimonials/migration.sql
├── TESTIMONIALS_IMPLEMENTATION.md       ← Full documentation
└── API_ENDPOINTS.md                     ← API reference
```

---

## 🚀 All Features Implemented

✅ GET all testimonials (paginated)  
✅ GET testimonial by ID  
✅ GET testimonials by professor  
✅ POST create testimonial (Professor/Admin only)  
✅ PUT update testimonial (Owner/Admin only)  
✅ DELETE testimonial (Owner/Admin only)  
✅ Role-based access control  
✅ Input validation  
✅ Database relationships  
✅ Error handling  
✅ Pagination support  
✅ Seed data included  

