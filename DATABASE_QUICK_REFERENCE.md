# 🗄️ Database Quick Reference

## ScholarHub Database at a Glance

---

## 📊 Table Summary

| Table | Purpose | Rows | Relationships |
|-------|---------|------|---------------|
| **User** | Authentication & base profiles | 3 | Core hub (1→many) |
| **StudentProfile** | Student-specific data | 1 | User (1:1) |
| **ProfessorProfile** | Professor-specific data | 1 | User (1:1) |
| **Scholarship** | Scholarship listings | 6 | Categories (M:M) |
| **Application** | Student applications | 0 | User, Scholarship |
| **Category** | Scholarship categories | 8 | Scholarships (M:M) |
| **ScholarshipOnCategory** | M:M junction | 6 | - |
| **SavedScholarship** | User bookmarks | 0 | User, Scholarship |
| **Notification** | User notifications | 0 | User (1:M) |
| **Testimonial** | User testimonials | 4 | User (1:M) |
| **RefreshToken** | JWT tokens | 0 | User (1:M) |
| **ContactMessage** | Contact form data | 0 | - |

---

## 🔑 Key Relationships

```
User (1) ──┬──→ (M) StudentProfile
           ├──→ (M) ProfessorProfile
           ├──→ (M) Scholarship (created)
           ├──→ (M) Application
           ├──→ (M) SavedScholarship
           ├──→ (M) Notification
           ├──→ (M) Testimonial
           └──→ (M) RefreshToken

Scholarship (1) ─┬──→ (M) Application
                 ├──→ (M) SavedScholarship
                 └──→ (M) ScholarshipOnCategory ←─→ (1) Category

Category (1) ─────→ (M) ScholarshipOnCategory
```

---

## 🎯 Most Used Queries

### Get All Scholarships (Public)
```sql
SELECT * FROM "Scholarship" 
WHERE status = 'APPROVED'
ORDER BY createdAt DESC
LIMIT 10;
```

### Get User Profile
```sql
SELECT u.*, sp.*, pp.*
FROM "User" u
LEFT JOIN "StudentProfile" sp ON u.id = sp.userId
LEFT JOIN "ProfessorProfile" pp ON u.id = pp.userId
WHERE u.id = ?;
```

### Get Scholarships by Category
```sql
SELECT DISTINCT s.*
FROM "Scholarship" s
JOIN "ScholarshipOnCategory" soc ON s.id = soc.scholarshipId
JOIN "Category" c ON soc.categoryId = c.id
WHERE c.slug = 'stem'
ORDER BY s.createdAt DESC;
```

### Get User Notifications
```sql
SELECT * FROM "Notification"
WHERE userId = ?
ORDER BY createdAt DESC
LIMIT 20;
```

### Get Testimonials by Professor
```sql
SELECT * FROM "Testimonial"
WHERE createdBy = ?
ORDER BY createdAt DESC;
```

---

## 🔐 Role Permissions

### STUDENT
- ✅ View own profile
- ✅ View all scholarships
- ✅ Apply to scholarships
- ✅ Save scholarships
- ✅ View own applications

### PROFESSOR
- ✅ Create scholarships
- ✅ View received applications
- ✅ Create testimonials
- ✅ Edit own testimonials
- ✅ Verify own status

### ADMIN
- ✅ Manage all users
- ✅ Approve scholarships
- ✅ Delete any testimonial
- ✅ Verify professors
- ✅ Block/unblock users

---

## 📈 Enum Types

**UserRole**: STUDENT, PROFESSOR, ADMIN  
**ScholarshipStatus**: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, CLOSED  
**ApplicationStatus**: PENDING, DRAFT, UNDER_REVIEW, ACCEPTED, REJECTED, WITHDRAWN  
**FundingType**: FULL, PARTIAL, TUITION_ONLY, STIPEND_ONLY  
**DegreeLevel**: BACHELOR, MASTER, PHD, POSTDOC, RESEARCH  

---

## 🔄 Data Flow Examples

### Scholarship Creation
```
Professor creates scholarship
    ↓
Scholarship stored in DRAFT
    ↓
Professor submits (PENDING_APPROVAL)
    ↓
Admin reviews and approves
    ↓
Status = APPROVED
    ↓
Students can view and apply
```

### Application Process
```
Student views scholarship
    ↓
Clicks Apply
    ↓
Application created (DRAFT)
    ↓
Student fills form and submits
    ↓
Status = PENDING (awaiting review)
    ↓
Professor reviews
    ↓
Status = ACCEPTED or REJECTED
```

---

## 💾 Backup & Recovery

**Daily backups recommended**:
```bash
# Full backup
pg_dump scholarhub > backup_$(date +%Y%m%d).sql

# Restore
psql scholarhub < backup_20260124.sql

# Point-in-time recovery
pg_basebackup -D /backup/scholarhub
```

---

## 🔍 Indexes List

| Index | Purpose | Performance |
|-------|---------|-------------|
| User.email | Login | Crucial |
| User.role | Role filtering | Important |
| Scholarship.status | List filtering | Important |
| Scholarship.deadline | Sorting | Important |
| Application.userId | User queries | Important |
| Notification.userId | User notifications | Crucial |
| Testimonial.createdBy | Professor testimonials | Important |

---

## 📊 Data Statistics

```
Total Records (After Seeding):
- Users: 3
- Scholarships: 6
- Testimonials: 4
- Categories: 8
- Total Size: < 1 MB

Estimated After 1 Year:
- Total Records: ~10,000-20,000
- Database Size: 10-25 MB
- Daily Growth: 50-100 records
```

---

## 🚀 Performance Tips

1. **Always paginate results**
   ```sql
   SELECT * FROM "Scholarship" 
   LIMIT 10 OFFSET 0;
   ```

2. **Use filters efficiently**
   ```sql
   WHERE status = 'APPROVED' 
   AND deadline > NOW()
   ```

3. **Index frequently searched columns**
   - Email, status, dates, userId

4. **Archive old data**
   - Move old applications to archive table

5. **Monitor slow queries**
   ```sql
   SELECT * FROM pg_stat_statements
   WHERE mean_exec_time > 1000;
   ```

---

## 🔧 Common Operations

### Add New Scholarship
```typescript
const scholarship = await prisma.scholarship.create({
  data: {
    title: "...",
    description: "...",
    // ... other fields
    createdById: professorId,
    status: ScholarshipStatus.DRAFT,
  },
});
```

### Get User with Relations
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    studentProfile: true,
    professorProfile: true,
    scholarships: true,
    applications: true,
    savedScholarships: true,
    notifications: true,
    testimonials: true,
  },
});
```

### Update Scholarship Status
```typescript
const updated = await prisma.scholarship.update({
  where: { id: scholarshipId },
  data: {
    status: ScholarshipStatus.APPROVED,
    approvedById: adminId,
    approvedAt: new Date(),
  },
});
```

### Get Paginated Results
```typescript
const scholarships = await prisma.scholarship.findMany({
  where: { status: ScholarshipStatus.APPROVED },
  skip: (page - 1) * 10,
  take: 10,
  orderBy: { createdAt: 'desc' },
});
```

---

## ⚠️ Important Constraints

### Unique Constraints
- User.email (only one account per email)
- Category.slug (unique category identifier)
- RefreshToken.token (each token unique)
- User → StudentProfile (1:1)
- User → ProfessorProfile (1:1)

### Foreign Key Constraints
- All relationships have CASCADE DELETE
- Deleting user deletes related records
- Deleting scholarship deletes applications

### Check Constraints
- deadlines > current date
- GPA between 0-4.0
- Amount > 0

---

## 📋 Sample Data

**3 Users**:
- admin@scholarhub.com (Admin)
- professor@university.edu (Professor)
- student@example.com (Student)

**6 Scholarships**:
- Fulbright, Chevening, DAAD
- Turkish, Erasmus Mundus, MEXT

**8 Categories**:
- STEM, Arts, Business, Medicine
- Social Sciences, Engineering, Law, Education

**4 Testimonials**:
- Nelson Mandela, B.B. King
- Benjamin Franklin, Academic Board

---

## 🔄 Database Transactions

```typescript
// Atomic operation - all or nothing
const result = await prisma.$transaction([
  prisma.application.update({...}),
  prisma.notification.create({...}),
  prisma.user.update({...}),
]);
```

---

## 📞 Monitoring Queries

### Check Database Size
```sql
SELECT 
  schemaname,
  SUM(pg_total_relation_size(schemaname||'.'||tablename)) / 1024 / 1024 as size_mb
FROM pg_tables
GROUP BY schemaname;
```

### Check Table Sizes
```sql
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Index Usage
```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## ✅ Database Checklist

- ✅ All tables created
- ✅ All relationships defined
- ✅ Indexes created
- ✅ Constraints applied
- ✅ Seed data loaded
- ✅ User roles configured
- ✅ Cascade delete enabled
- ✅ Timestamps configured
- ✅ Enums validated
- ✅ Ready for production

---

## 📞 Support Resources

- **Database Diagram**: DATABASE_DIAGRAM.md
- **Visual Diagrams**: DATABASE_VISUAL_DIAGRAMS.md
- **Schema**: prisma/schema.prisma
- **Migrations**: prisma/migrations/
- **Seed Data**: prisma/seed.ts

