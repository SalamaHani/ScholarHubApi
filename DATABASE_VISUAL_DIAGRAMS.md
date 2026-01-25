# 📐 ScholarHub Database - Visual Architecture

## Complete Database Structure Diagrams

---

## 1️⃣ Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  SCHOLARHUB DATABASE                            │
│                     PostgreSQL                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   CORE TABLES      RELATIONSHIP TABLES    UTILITY TABLES
        │                  │                  │
   ┌────┴────┐        ┌────┴────┐        ┌───┴────┐
   │ • User  │        │ • Appli- │        │ • Con- │
   │ • Schol-│        │   cation │        │   tact │
   │   arship│        │ • Saved  │        │Message │
   │ • Cate- │        │Scholarship│       │        │
   │   gory  │        │ • Scholar-│       │        │
   │         │        │ OnCategory│       │        │
   └─────────┘        └──────────┘       └────────┘
```

---

## 2️⃣ Data Flow Architecture

```
                         ┌─────────────────┐
                         │   API CLIENT    │
                         │  (Frontend App) │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                  AUTH         OPERATIONS      DATA
                    │             │             │
         ┌──────────▼──────┐ ┌────▼─────┐ ┌───▼────┐
         │ Authentication  │ │ CRUD      │ │ Query  │
         │ • Login         │ │ Operations│ │Filters │
         │ • Register      │ │ • Create  │ │ • Sort │
         │ • Logout        │ │ • Read    │ │ • Page │
         │ • Refresh Token │ │ • Update  │ │        │
         └────────┬────────┘ │ • Delete  │ └────────┘
                  │          └──┬────────┘
                  └──────────────┼──────────────┐
                                 │              │
                    ┌────────────▼──────────┐   │
                    │   PRISMA ORM LAYER    │   │
                    │                       │   │
                    │ Model Definitions     │   │
                    │ Query Builder         │   │
                    │ Type Safety           │   │
                    └──────────┬────────────┘   │
                               │                │
                    ┌──────────▼────────┐      │
                    │  PostgreSQL       │      │
                    │  DATABASE         │      │
                    │                   │      │
                    │ ┌─────────────┐   │      │
                    │ │  USERS      │   │      │
                    │ │  SCHEMAS    │   │      │
                    │ │  INDEXES    │   │      │
                    │ │  RELATIONS  │   │      │
                    │ └─────────────┘   │      │
                    └───────────────────┘      │
                                               │
                    ┌──────────────────────────┘
                    │
                    ▼
           ┌────────────────────┐
           │  DATA PERSISTENCE  │
           │  (Disk Storage)    │
           └────────────────────┘
```

---

## 3️⃣ User Entity Relationship

```
                        ┌────────────────┐
                        │      USER      │
                        │  (Base Info)   │
                        └────────┬───────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
         (role=STUDENT)   (role=PROFESSOR)   (role=ADMIN)
              │                  │                  │
         ┌────▼──────────┐  ┌────▼──────────┐  ┌──┴────────┐
         │ STUDENT_      │  │ PROFESSOR_    │  │ Can:      │
         │ PROFILE       │  │ PROFILE       │  │ • Manage  │
         ├───────────────┤  ├───────────────┤  │   all     │
         │ • university  │  │ • institution │  │ • Approve │
         │ • fieldOfSt.  │  │ • department  │  │ • Verify  │
         │ • GPA         │  │ • isVerified  │  │ • Promote │
         │ • graduation  │  │ • website     │  └───────────┘
         │   Year        │  │ • bio         │
         └──────┬────────┘  └────┬──────────┘
                │                │
         Can:   │         Can:   │
         ✓ Apply │         ✓ Create
         ✓ Save  │         ✓ Teach
         ✓ View  │         ✓ Guide
                │                │
         Receives from:   Creates:
         • Scholarship    • Scholarship
         • Notification   • Testimonial
         • Application    • Application
           Status         Review
```

---

## 4️⃣ Scholarship Workflow

```
┌──────────────────────────────────────────────────────────┐
│              SCHOLARSHIP LIFECYCLE                        │
└──────────────────────────────────────────────────────────┘

STEP 1: CREATION
   Professor/Admin Creates Scholarship
        │
        ▼
   ┌─────────────────────┐
   │ DRAFT STATUS        │
   │ • Not visible       │
   │ • Editable         │
   │ • Can be deleted   │
   └─────────────────────┘
        │
        ▼
STEP 2: SUBMISSION
   Professor/Admin Submits for Approval
        │
        ▼
   ┌──────────────────────┐
   │ PENDING_APPROVAL     │
   │ • Not visible        │
   │ • Read-only         │
   │ • Awaiting admin    │
   └──────────────────────┘
        │
        ├──────────────────┬────────────────┐
        │                  │                │
        ▼                  ▼                ▼
    ✅ APPROVED        ❌ REJECTED     💾 CLOSED
    (Visible to        (Returned to   (Deadline
     all students)      Draft)         passed)
        │                  │                │
        ▼                  ▼                ▼
   Students Can:      Professor      No new
   • View             Revises        Applications
   • Apply            & Resubmits    Accepted
   • Save
   • Share

RELATIONSHIPS:
Scholarship → Application (1:M)
Scholarship → SavedScholarship (1:M)
Scholarship → ScholarshipOnCategory (1:M)
```

---

## 5️⃣ Application Process

```
┌────────────────────────────────────────────────────────┐
│          STUDENT APPLICATION FLOW                      │
└────────────────────────────────────────────────────────┘

Student Discovers Scholarship
        │
        ├─► View Details
        │
        ▼
Clicks "Apply"
        │
        ▼
┌──────────────────────────┐
│ APPLICATION CREATED      │
│ Status: DRAFT            │
│ • Student fills form     │
│ • Can save progress      │
│ • Can submit multiple    │
│   times                  │
└──────┬───────────────────┘
       │
       │ Student completes & submits
       ▼
┌──────────────────────────┐
│ PENDING REVIEW           │
│ • Professor sees it      │
│ • Student can't edit     │
│ • Waiting for response   │
└──────┬───────────────────┘
       │
    ┌──┴──────────────┬──────────────┐
    │                 │              │
    ▼                 ▼              ▼
✅ ACCEPTED     🔄 UNDER_REVIEW  ❌ REJECTED
   Scholarship      (More info
   Awarded!         needed)
                        │
                        ▼
                   Student provides
                   additional info
                        │
                        ▼
                   Resubmitted
                        │
                        ├─► ✅ ACCEPTED
                        ├─► ❌ REJECTED
                        └─► 🔄 REVIEW again

RELATIONSHIPS:
Student ──1:M─► Application ──1:M─► Scholarship
   │                              │
   └──────────── Can Save ────────┘
```

---

## 6️⃣ Testimonial Management

```
┌──────────────────────────────────────────────────┐
│      TESTIMONIAL CREATION & VISIBILITY           │
└──────────────────────────────────────────────────┘

Professor/Admin Creates Testimonial
        │
        ├─ Quote Text
        ├─ Author Name
        ├─ Author Role
        ├─ Optional Image
        └─ Gradient Color
        │
        ▼
┌────────────────────────────┐
│ TESTIMONIAL CREATED        │
│ Linked to Creator (User)   │
│ Timestamped                │
└────────┬───────────────────┘
         │

PUBLIC VISIBILITY:
│
├─► Any User Can:
│   ├─ View all testimonials
│   ├─ View by professor
│   ├─ Filter by gradient
│   └─ Display on website
│
EDIT/DELETE:
│
├─► Creator (Professor) Can:
│   ├─ Edit own testimonials
│   └─ Delete own testimonials
│
├─► Admin Can:
│   ├─ Edit all testimonials
│   ├─ Delete all testimonials
│   └─ Manage all creations
│
└─► Other Users:
    └─ Cannot edit/delete

RELATIONSHIPS:
Testimonial ──M:1─► User (Professor/Creator)
   │
   ├─ quote: String
   ├─ author: String
   ├─ role: String
   ├─ image: String (optional)
   ├─ gradient: String
   ├─ createdAt: Timestamp
   └─ updatedAt: Timestamp
```

---

## 7️⃣ Category Organization

```
┌─────────────────────────────────────────────────┐
│        CATEGORY & SCHOLARSHIP MAPPING           │
└─────────────────────────────────────────────────┘

CATEGORIES (8 Total):
┌────────────────────────────────────────────┐
│ ┌────────┐  ┌────────────────┐  ┌────────┐│
││ STEM   │  │ Arts &         │  │Business││
││ 🔬     │  │ Humanities     │  │💼      ││
││        │  │🎨              │  │        ││
│└────────┘  └────────────────┘  └────────┘│
│ ┌──────────────┐  ┌──────────────────────┤│
││ Medicine &    │  │ Social Sciences      ││
││ Health        │  │ 🌍                   ││
││ ⚕️            │  │                      ││
│└──────────────┘  └──────────────────────┘│
│ ┌────────┐  ┌────────────┐  ┌─────────┐  │
││Engineering │  │   Law      │  │Education│  │
││⚙️          │  │⚖️           │  │📚      │  │
│└────────┘  └────────────┘  └─────────┘  │
└────────────────────────────────────────────┘
         │
         │ Many-to-Many
         │ Relationship
         ▼
SCHOLARSHIPS (Multiple):
┌──────────────────────────────────────────┐
│ ┌────────────────────────────────────┐   │
││ Fulbright (STEM + Others)           │   │
││ Chevening (Business + Law)          │   │
││ DAAD (All Categories)               │   │
││ Turkish (Engineering + Medicine)    │   │
└──────────────────────────────────────────┘

JUNCTION TABLE:
ScholarshipOnCategory
    │
    ├─ scholarshipId (FK)
    ├─ categoryId (FK)
    └─ createdAt (Timestamp)

QUERY EXAMPLE:
SELECT s.* FROM Scholarship s
WHERE s.id IN (
  SELECT scholarshipId FROM ScholarshipOnCategory
  WHERE categoryId = (SELECT id FROM Category WHERE slug='stem')
)
```

---

## 8️⃣ Notification System

```
┌──────────────────────────────────────────────┐
│        NOTIFICATION FLOW & TYPES             │
└──────────────────────────────────────────────┘

SYSTEM EVENTS:
    │
    ├─ User Action
    │  ├─ Applied to scholarship
    │  ├─ Saved scholarship
    │  └─ Profile updated
    │
    ├─ Application Status
    │  ├─ Status changed
    │  ├─ New comment
    │  └─ Request for info
    │
    └─ Scholarship Update
       ├─ New scholarship
       ├─ Deadline approaching
       └─ Scholarship closed
    │
    ▼
CREATE NOTIFICATION:
    │
    ├─ Recipient (User)
    ├─ Title
    ├─ Message
    ├─ Type (system, deadline, etc)
    ├─ Link (optional)
    └─ isRead (default: false)
    │
    ▼
STORED IN DATABASE:
    │
    ├─ User ID (FK)
    ├─ Notification ID (PK)
    └─ createdAt (indexed)
    │
    ▼
USER RECEIVES:
    │
    ├─ View all notifications
    ├─ Mark as read
    ├─ Delete notification
    └─ Click to related resource
```

---

## 9️⃣ Data Access Patterns

```
┌──────────────────────────────────────────────┐
│      ROLE-BASED DATA ACCESS MATRIX           │
└──────────────────────────────────────────────┘

                STUDENT  PROFESSOR  ADMIN
                  (S)       (P)      (A)
User Profile      R*         R*       R+
  Edit            S only    P only    A+
  Delete          S only    P only    A

Scholarship
  View            R**        R***     R
  Create          ✗          R        A
  Edit            ✗         Own+      A+
  Delete          ✗         Own+      A+
  Approve         ✗          ✗        A+
  Feature         ✗          ✗        A

Application
  Create          R          ✗        ✗
  View Own        R          R**      R
  View All        ✗          ✗        R
  Edit Own        Draft      Recv     A
  Evaluate        ✗          R        A

Notification
  View            Own        Own      Own+
  Mark Read       Own        Own      Own+
  Delete          Own        Own      Own+

Testimonial
  Create          ✗          R        A
  Edit            ✗         Own+      A+
  Delete          ✗         Own+      A+
  View            R***       R***     R

LEGEND:
R = Read/View
R* = Own profile only
R** = Received applications
R*** = All testimonials (public)
+ = Full access
Own = Creator/Owner only
A+ = Can edit/delete all
```

---

## 🔟 Performance Optimization Strategy

```
┌────────────────────────────────────────────────┐
│     DATABASE PERFORMANCE OPTIMIZATION         │
└────────────────────────────────────────────────┘

INDEXING STRATEGY:

1. Primary Indexes (PK)
   ├─ All tables (automatic)
   └─ Fast ID lookups

2. Foreign Key Indexes (FK)
   ├─ userId (most queries)
   ├─ scholarshipId
   ├─ categoryId
   └─ createdBy
   Purpose: JOIN performance

3. Status/Filter Indexes
   ├─ ScholarshipStatus
   ├─ ApplicationStatus
   ├─ isRead (notifications)
   └─ isFeatured (scholarships)
   Purpose: WHERE clause optimization

4. Timestamp Indexes
   ├─ createdAt (sorting)
   ├─ deadline (upcoming)
   └─ lastLoginAt (recent users)
   Purpose: ORDER BY/time range

5. Composite Indexes
   ├─ (userId, isRead) → notifications
   ├─ (userId, scholarshipId) → unique
   └─ (createdBy, createdAt) → testimonials
   Purpose: Multi-column queries


QUERY OPTIMIZATION:

Fast Queries (< 1ms):
├─ User login (email index)
├─ Get notification count
├─ Check if saved
└─ Get user profile


Medium Queries (1-10ms):
├─ List scholarships (paginated)
├─ Get user applications
├─ Get testimonials by professor
└─ Search scholarships


Slow Queries (> 10ms):
├─ Complex filters (multiple criteria)
├─ Full-text search
├─ Cross-table analytics
└─ Aggregate calculations
```

---

## 📊 Table Sizes & Growth

```
┌──────────────────────────────────┐
│   ESTIMATED TABLE GROWTH         │
└──────────────────────────────────┘

Initial Seeding:
User:                    3 rows
StudentProfile:          1 row
ProfessorProfile:        1 row
Scholarship:             6 rows
Category:                8 rows
ScholarshipOnCategory:   6 rows
Testimonial:             4 rows
Application:             0 rows
SavedScholarship:        0 rows
Notification:            0 rows
RefreshToken:            0 rows
ContactMessage:          0 rows


After 1 Year (Estimated):
User:                  500-1000
StudentProfile:        400-800
ProfessorProfile:      50-100
Scholarship:           50-200
Application:         1000-5000
SavedScholarship:    2000-10000
Notification:        5000-50000
RefreshToken:        1000-5000
ContactMessage:       100-500


Storage Estimate:
Table              | Size (1 year) | Growth/month
─────────────────────────────────────────────────
User               | 100 KB        | 10-20 KB
Scholarship        | 500 KB        | 5-10 KB
Application        | 2-5 MB        | 200-500 KB
Notification       | 5-10 MB       | 500 KB-1 MB
SavedScholarship   | 2-5 MB        | 200-500 KB
RefreshToken       | 500 KB        | 50-100 KB
Other              | 1 MB          | 10 KB
─────────────────────────────────────────────────
TOTAL              | 10-25 MB      | 1-3 MB
```

---

## ✅ Database Health Checks

```
Regular Maintenance Tasks:

Weekly:
  ✓ Backup database
  ✓ Review error logs
  ✓ Monitor disk usage
  ✓ Check connection count

Monthly:
  ✓ Analyze slow queries
  ✓ Rebuild indexes if needed
  ✓ Review table statistics
  ✓ Update row counts

Quarterly:
  ✓ Database optimization
  ✓ Partition large tables
  ✓ Archive old data
  ✓ Performance tuning

Annually:
  ✓ Capacity planning
  ✓ Upgrade strategy
  ✓ Security audit
  ✓ Disaster recovery test
```

---

## 🎯 Summary

The ScholarHub database is designed with:

✅ **Clear Relationships** - Well-defined 1:1, 1:M, M:M relationships  
✅ **Performance** - Strategic indexing for fast queries  
✅ **Scalability** - Can handle thousands of users and records  
✅ **Integrity** - Constraints and cascade deletes  
✅ **Flexibility** - Enums, arrays, and JSON for varied data  
✅ **Security** - Role-based access patterns  
✅ **Maintainability** - Clear schema and naming conventions  

