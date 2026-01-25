# 📊 ScholarHub Database Diagram & Schema

## Complete Database Architecture

---

## 🗂️ Database Overview

**Database**: PostgreSQL  
**ORM**: Prisma  
**Total Tables**: 12  
**Relationships**: Multiple (One-to-Many, Many-to-Many)

---

## 📐 Complete ER Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        SCHOLARHUB DATABASE STRUCTURE                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │     USER     │
                                    ├──────────────┤
                                    │ • id (PK)    │
                                    │ • email      │
                                    │ • password   │
                                    │ • firstName  │
                                    │ • lastName   │
                                    │ • role       │
                                    │ • avatar     │
                                    │ • phone      │
                                    │ • isBlocked  │
                                    │ • createdAt  │
                                    └──────┬───────┘
                      ┌─────────────────────┼─────────────────────┐
                      │                     │                     │
          ┌───────────▼──────────┐  ┌──────▼────────────┐  ┌────▼─────────────┐
          │ STUDENT_PROFILE      │  │ PROFESSOR_PROFILE │  │  REFRESH_TOKEN   │
          ├──────────────────────┤  ├───────────────────┤  ├──────────────────┤
          │ • id (PK)            │  │ • id (PK)         │  │ • id (PK)        │
          │ • userId (FK)        │  │ • userId (FK)     │  │ • userId (FK)    │
          │ • university         │  │ • institution     │  │ • token          │
          │ • fieldOfStudy       │  │ • department      │  │ • expiresAt      │
          │ • currentDegree      │  │ • position        │  │ • createdAt      │
          │ • gpa                │  │ • isVerified      │  └──────────────────┘
          │ • graduationYear     │  │ • verifiedAt      │
          │ • country            │  │ • verifiedBy      │
          │ • bio                │  └───────────────────┘
          └──────────────────────┘

                      ┌──────────────────────────────────────┐
                      │        SCHOLARSHIP (Created by User) │
                      ├──────────────────────────────────────┤
                      │ • id (PK)                            │
                      │ • title                              │
                      │ • description                        │
                      │ • organization                       │
                      │ • country                            │
                      │ • fieldOfStudy[] (array)             │
                      │ • degreeLevel[] (array)              │
                      │ • fundingType                        │
                      │ • amount                             │
                      │ • currency                           │
                      │ • deadline                           │
                      │ • status                             │
                      │ • createdById (FK -> User)           │
                      │ • approvedById (FK -> User)          │
                      │ • isFeatured                         │
                      │ • createdAt, updatedAt               │
                      └──────┬───────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼──────────────┐  ┌─▼──────────────┐  ┌──▼─────────────────────┐
    │  APPLICATION     │  │ SAVED_          │  │ SCHOLARSHIP_ON_         │
    │                  │  │ SCHOLARSHIP     │  │ CATEGORY                │
    ├──────────────────┤  ├─────────────────┤  ├─────────────────────────┤
    │ • id (PK)        │  │ • id (PK)       │  │ • id (PK)               │
    │ • userId (FK)    │  │ • userId (FK)   │  │ • scholarshipId (FK)    │
    │ • scholarshipId   │  │ • scholarshipId │  │ • categoryId (FK)       │
    │   (FK)           │  │   (FK)          │  │ • createdAt             │
    │ • status         │  │ • savedAt       │  └─────────────────────────┘
    │ • answers{}      │  └─────────────────┘
    │ • submittedAt    │
    │ • updatedAt      │
    └──────────────────┘

        ┌───────────────────────────────┐
        │      CATEGORY                 │
        ├───────────────────────────────┤
        │ • id (PK)                     │
        │ • name                        │
        │ • slug                        │
        │ • description                 │
        │ • icon                        │
        │ • color                       │
        │ • createdAt                   │
        └───────────────────────────────┘

    ┌─────────────────────────┐    ┌──────────────────────┐
    │   NOTIFICATION          │    │  TESTIMONIAL         │
    ├─────────────────────────┤    ├──────────────────────┤
    │ • id (PK)               │    │ • id (PK)            │
    │ • userId (FK -> User)   │    │ • quote              │
    │ • title                 │    │ • author             │
    │ • message               │    │ • role               │
    │ • type                  │    │ • image              │
    │ • link                  │    │ • gradient           │
    │ • isRead                │    │ • createdBy (FK)     │
    │ • createdAt             │    │ • createdAt          │
    └─────────────────────────┘    │ • updatedAt          │
                                    └──────────────────────┘

                    ┌─────────────────────┐
                    │  CONTACT_MESSAGE    │
                    ├─────────────────────┤
                    │ • id (PK)           │
                    │ • name              │
                    │ • email             │
                    │ • subject           │
                    │ • message           │
                    │ • isRead            │
                    │ • repliedAt         │
                    │ • createdAt         │
                    └─────────────────────┘
```

---

## 📋 Detailed Table Specifications

### **1. USER Table** (Core User Data)
```
┌─────────────────────────────────────────────────┐
│                      USER                        │
├─────────────────────────────────────────────────┤
│ Column Name          │ Type      │ Constraints │
├──────────────────────┼───────────┼─────────────┤
│ id                   │ TEXT      │ PK, UNIQUE  │
│ email                │ TEXT      │ UNIQUE      │
│ password             │ TEXT      │ NOT NULL    │
│ firstName            │ TEXT      │ NOT NULL    │
│ lastName             │ TEXT      │ NOT NULL    │
│ role                 │ ENUM      │ DEFAULT     │
│ avatar               │ TEXT      │ NULLABLE    │
│ phone                │ TEXT      │ NULLABLE    │
│ isEmailVerified      │ BOOLEAN   │ DEFAULT     │
│ isActive             │ BOOLEAN   │ DEFAULT     │
│ isBlocked            │ BOOLEAN   │ DEFAULT     │
│ emailVerifyToken     │ TEXT      │ NULLABLE    │
│ emailVerifyExpires   │ TIMESTAMP │ NULLABLE    │
│ resetPasswordToken   │ TEXT      │ NULLABLE    │
│ resetPasswordExpires │ TIMESTAMP │ NULLABLE    │
│ lastLoginAt          │ TIMESTAMP │ NULLABLE    │
│ createdAt            │ TIMESTAMP │ DEFAULT NOW │
│ updatedAt            │ TIMESTAMP │ AUTO UPDATE │
├─────────────────────────────────────────────────┤
│ Indexes: (email), (role), (createdAt)           │
│ Enums: UserRole (STUDENT, PROFESSOR, ADMIN)     │
└─────────────────────────────────────────────────┘
```

### **2. STUDENT_PROFILE Table** (Student-Specific Data)
```
┌──────────────────────────────────────────────────┐
│              STUDENT_PROFILE                     │
├──────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints      │
├───────────────────┼───────────┼──────────────────┤
│ id                │ TEXT      │ PK               │
│ userId            │ TEXT      │ FK -> User (1:1) │
│ university        │ TEXT      │ NULLABLE         │
│ fieldOfStudy      │ TEXT      │ NULLABLE         │
│ currentDegree     │ ENUM      │ NULLABLE         │
│ gpa               │ FLOAT     │ NULLABLE         │
│ graduationYear    │ INTEGER   │ NULLABLE         │
│ country           │ TEXT      │ NULLABLE         │
│ bio               │ TEXT      │ NULLABLE         │
│ createdAt         │ TIMESTAMP │ DEFAULT NOW      │
│ updatedAt         │ TIMESTAMP │ AUTO UPDATE      │
├──────────────────────────────────────────────────┤
│ Enums: DegreeLevel (BACHELOR, MASTER, PHD, etc) │
│ Cascade Delete on User removal                   │
└──────────────────────────────────────────────────┘
```

### **3. PROFESSOR_PROFILE Table** (Professor-Specific Data)
```
┌──────────────────────────────────────────────────┐
│            PROFESSOR_PROFILE                     │
├──────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints      │
├───────────────────┼───────────┼──────────────────┤
│ id                │ TEXT      │ PK               │
│ userId            │ TEXT      │ FK -> User (1:1) │
│ institution       │ TEXT      │ NOT NULL         │
│ department        │ TEXT      │ NULLABLE         │
│ position          │ TEXT      │ NULLABLE         │
│ specialization    │ TEXT      │ NULLABLE         │
│ website           │ TEXT      │ NULLABLE         │
│ bio               │ TEXT      │ NULLABLE         │
│ isVerified        │ BOOLEAN   │ DEFAULT false    │
│ verifiedAt        │ TIMESTAMP │ NULLABLE         │
│ verifiedBy        │ TEXT      │ NULLABLE         │
│ createdAt         │ TIMESTAMP │ DEFAULT NOW      │
│ updatedAt         │ TIMESTAMP │ AUTO UPDATE      │
├──────────────────────────────────────────────────┤
│ Cascade Delete on User removal                   │
└──────────────────────────────────────────────────┘
```

### **4. SCHOLARSHIP Table** (Scholarship Listings)
```
┌────────────────────────────────────────────────────┐
│              SCHOLARSHIP                           │
├────────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints        │
├───────────────────┼───────────┼────────────────────┤
│ id                │ TEXT      │ PK                 │
│ title             │ TEXT      │ NOT NULL           │
│ description       │ TEXT      │ NOT NULL           │
│ organization      │ TEXT      │ NOT NULL           │
│ country           │ TEXT      │ NOT NULL           │
│ region            │ TEXT      │ NULLABLE           │
│ fieldOfStudy      │ TEXT[]    │ Array              │
│ degreeLevel       │ ENUM[]    │ Array              │
│ fundingType       │ ENUM      │ NOT NULL           │
│ amount            │ DECIMAL   │ NULLABLE           │
│ currency          │ TEXT      │ NULLABLE           │
│ deadline          │ TIMESTAMP │ NOT NULL           │
│ applicationLink   │ TEXT      │ NOT NULL           │
│ requirements      │ TEXT      │ NULLABLE           │
│ eligibility       │ TEXT      │ NULLABLE           │
│ benefits          │ TEXT      │ NULLABLE           │
│ status            │ ENUM      │ DEFAULT DRAFT      │
│ language          │ TEXT      │ NULLABLE           │
│ studyMode         │ TEXT      │ NULLABLE           │
│ isFeatured        │ BOOLEAN   │ DEFAULT false      │
│ createdById       │ TEXT      │ FK -> User         │
│ approvedById      │ TEXT      │ FK -> User         │
│ approvedAt        │ TIMESTAMP │ NULLABLE           │
│ createdAt         │ TIMESTAMP │ DEFAULT NOW        │
│ updatedAt         │ TIMESTAMP │ AUTO UPDATE        │
├────────────────────────────────────────────────────┤
│ Indexes: (createdById), (status), (deadline)      │
│ Enums: ScholarshipStatus, FundingType, DegreeLevel│
│ Relationships: createdBy, approvedBy (FK -> User) │
└────────────────────────────────────────────────────┘
```

### **5. APPLICATION Table** (Scholarship Applications)
```
┌────────────────────────────────────────────────────┐
│              APPLICATION                           │
├────────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints        │
├───────────────────┼───────────┼────────────────────┤
│ id                │ TEXT      │ PK                 │
│ userId            │ TEXT      │ FK -> User         │
│ scholarshipId     │ TEXT      │ FK -> Scholarship  │
│ status            │ ENUM      │ DEFAULT PENDING    │
│ answers           │ JSON      │ Application data   │
│ submittedAt       │ TIMESTAMP │ DEFAULT NOW        │
│ updatedAt         │ TIMESTAMP │ AUTO UPDATE        │
├────────────────────────────────────────────────────┤
│ Unique: (userId, scholarshipId)                    │
│ Indexes: (userId), (scholarshipId), (status)      │
│ Enums: ApplicationStatus (PENDING, ACCEPTED, etc) │
│ Cascade Delete on User/Scholarship removal         │
└────────────────────────────────────────────────────┘
```

### **6. CATEGORY Table** (Scholarship Categories)
```
┌─────────────────────────────────────────────────┐
│              CATEGORY                            │
├─────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints     │
├───────────────────┼───────────┼─────────────────┤
│ id                │ TEXT      │ PK              │
│ name              │ TEXT      │ NOT NULL        │
│ slug              │ TEXT      │ UNIQUE          │
│ description       │ TEXT      │ NULLABLE        │
│ icon              │ TEXT      │ NULLABLE        │
│ color             │ TEXT      │ NULLABLE        │
│ createdAt         │ TIMESTAMP │ DEFAULT NOW     │
├─────────────────────────────────────────────────┤
│ Indexes: (slug)                                 │
└─────────────────────────────────────────────────┘
```

### **7. SCHOLARSHIP_ON_CATEGORY Table** (Many-to-Many)
```
┌──────────────────────────────────────────────────┐
│         SCHOLARSHIP_ON_CATEGORY                  │
├──────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints      │
├───────────────────┼───────────┼──────────────────┤
│ id                │ TEXT      │ PK               │
│ scholarshipId     │ TEXT      │ FK -> Scholarship│
│ categoryId        │ TEXT      │ FK -> Category   │
│ createdAt         │ TIMESTAMP │ DEFAULT NOW      │
├──────────────────────────────────────────────────┤
│ Unique: (scholarshipId, categoryId)              │
│ Indexes: (scholarshipId), (categoryId)           │
│ Links Scholarships to multiple Categories        │
└──────────────────────────────────────────────────┘
```

### **8. SAVED_SCHOLARSHIP Table** (User Bookmarks)
```
┌─────────────────────────────────────────────────┐
│           SAVED_SCHOLARSHIP                      │
├─────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints     │
├───────────────────┼───────────┼─────────────────┤
│ id                │ TEXT      │ PK              │
│ userId            │ TEXT      │ FK -> User      │
│ scholarshipId     │ TEXT      │ FK -> Scholar.  │
│ notes             │ TEXT      │ NULLABLE        │
│ savedAt           │ TIMESTAMP │ DEFAULT NOW     │
├─────────────────────────────────────────────────┤
│ Unique: (userId, scholarshipId)                 │
│ Indexes: (userId), (scholarshipId)              │
│ Cascade Delete on User/Scholarship removal      │
└─────────────────────────────────────────────────┘
```

### **9. NOTIFICATION Table** (User Notifications)
```
┌──────────────────────────────────────────────────┐
│             NOTIFICATION                         │
├──────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints      │
├───────────────────┼───────────┼──────────────────┤
│ id                │ TEXT      │ PK               │
│ userId            │ TEXT      │ FK -> User       │
│ title             │ TEXT      │ NOT NULL         │
│ message           │ TEXT      │ NOT NULL         │
│ type              │ TEXT      │ (deadline, etc)  │
│ link              │ TEXT      │ NULLABLE         │
│ isRead            │ BOOLEAN   │ DEFAULT false    │
│ createdAt         │ TIMESTAMP │ DEFAULT NOW      │
├──────────────────────────────────────────────────┤
│ Indexes: (userId, isRead), (createdAt)          │
│ Cascade Delete on User removal                   │
└──────────────────────────────────────────────────┘
```

### **10. TESTIMONIAL Table** (Student/Professor Testimonials)
```
┌──────────────────────────────────────────────────┐
│             TESTIMONIAL                          │
├──────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints      │
├───────────────────┼───────────┼──────────────────┤
│ id                │ TEXT      │ PK               │
│ quote             │ TEXT      │ NOT NULL         │
│ author            │ TEXT      │ NOT NULL         │
│ role              │ TEXT      │ NOT NULL         │
│ image             │ TEXT      │ NULLABLE         │
│ gradient          │ TEXT      │ DEFAULT value    │
│ createdBy         │ TEXT      │ FK -> User       │
│ createdAt         │ TIMESTAMP │ DEFAULT NOW      │
│ updatedAt         │ TIMESTAMP │ AUTO UPDATE      │
├──────────────────────────────────────────────────┤
│ Indexes: (createdBy), (createdAt)               │
│ Cascade Delete on User removal                   │
│ Created by Professor/Admin only                  │
└──────────────────────────────────────────────────┘
```

### **11. REFRESH_TOKEN Table** (JWT Tokens)
```
┌──────────────────────────────────────────────────┐
│            REFRESH_TOKEN                         │
├──────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints      │
├───────────────────┼───────────┼──────────────────┤
│ id                │ TEXT      │ PK               │
│ userId            │ TEXT      │ FK -> User       │
│ token             │ TEXT      │ NOT NULL, UNIQUE │
│ expiresAt         │ TIMESTAMP │ NOT NULL         │
│ createdAt         │ TIMESTAMP │ DEFAULT NOW      │
├──────────────────────────────────────────────────┤
│ Cascade Delete on User removal                   │
│ Used for JWT token management                    │
└──────────────────────────────────────────────────┘
```

### **12. CONTACT_MESSAGE Table** (Contact Form)**
```
┌──────────────────────────────────────────────────┐
│            CONTACT_MESSAGE                       │
├──────────────────────────────────────────────────┤
│ Column Name       │ Type      │ Constraints      │
├───────────────────┼───────────┼──────────────────┤
│ id                │ TEXT      │ PK               │
│ name              │ TEXT      │ NOT NULL         │
│ email             │ TEXT      │ NOT NULL         │
│ subject           │ TEXT      │ NOT NULL         │
│ message           │ TEXT      │ NOT NULL         │
│ isRead            │ BOOLEAN   │ DEFAULT false    │
│ repliedAt         │ TIMESTAMP │ NULLABLE         │
│ createdAt         │ TIMESTAMP │ DEFAULT NOW      │
├──────────────────────────────────────────────────┤
│ Indexes: (email), (createdAt)                    │
│ For contact form submissions                     │
└──────────────────────────────────────────────────┘
```

---

## 🔗 Relationship Map

```
USER (1) ──────────┬─────────── (1) STUDENT_PROFILE
         └─────────┼─────────── (1) PROFESSOR_PROFILE
         └─────────┼─────────── (1) REFRESH_TOKEN
         └─────────┼─────────── (M) SCHOLARSHIP (createdBy)
         └─────────┼─────────── (M) SCHOLARSHIP (approvedBy)
         └─────────┼─────────── (M) APPLICATION
         └─────────┼─────────── (M) SAVED_SCHOLARSHIP
         └─────────┼─────────── (M) NOTIFICATION
         └─────────┼─────────── (M) TESTIMONIAL

SCHOLARSHIP (1) ──┬─────────── (M) APPLICATION
               └─────────── (M) SAVED_SCHOLARSHIP
               └─────────── (M) SCHOLARSHIP_ON_CATEGORY

CATEGORY (1) ─────────────── (M) SCHOLARSHIP_ON_CATEGORY

```

---

## 📊 Enum Types

### **UserRole**
```typescript
enum UserRole {
  STUDENT
  PROFESSOR
  ADMIN
}
```

### **ScholarshipStatus**
```typescript
enum ScholarshipStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
  CLOSED
}
```

### **ApplicationStatus**
```typescript
enum ApplicationStatus {
  PENDING
  DRAFT
  UNDER_REVIEW
  ACCEPTED
  REJECTED
  WITHDRAWN
}
```

### **FundingType**
```typescript
enum FundingType {
  FULL
  PARTIAL
  TUITION_ONLY
  STIPEND_ONLY
}
```

### **DegreeLevel**
```typescript
enum DegreeLevel {
  BACHELOR
  MASTER
  PHD
  POSTDOC
  RESEARCH
}
```

---

## 🎯 Database Statistics

| Metric | Value |
|--------|-------|
| Total Tables | 12 |
| Total Relationships | 20+ |
| One-to-One Relations | 3 |
| One-to-Many Relations | 12 |
| Many-to-Many Relations | 1 |
| Enum Types | 5 |
| Total Indexes | 30+ |
| Cascade Delete Tables | 8 |

---

## 🔐 Access Control by Role

### **ADMIN**
```
✅ View all users
✅ Block/Unblock users
✅ Verify professors
✅ Delete users
✅ Change user roles
✅ Create/Edit/Delete scholarships
✅ Approve/Reject scholarships
✅ View all applications
✅ Create testimonials
✅ Edit/Delete any testimonial
```

### **PROFESSOR**
```
✅ View own profile
✅ Edit own profile
✅ Create scholarships
✅ Edit own scholarships
✅ Delete own scholarships
✅ View received applications
✅ Create testimonials
✅ Edit/Delete own testimonials
✅ View notifications
```

### **STUDENT**
```
✅ View own profile
✅ Edit own profile
✅ View all scholarships
✅ Apply to scholarships
✅ View own applications
✅ Edit own applications (draft/pending)
✅ Save scholarships
✅ View notifications
```

---

## 🏗️ Database Design Principles

✅ **Normalization**: 3rd Normal Form applied  
✅ **Primary Keys**: CUID for distributed systems  
✅ **Foreign Keys**: Referential integrity maintained  
✅ **Indexes**: On frequently queried columns  
✅ **Cascading**: Delete propagation for data integrity  
✅ **Timestamps**: Automatic created/updated tracking  
✅ **Arrays**: Used for flexible multi-select fields  
✅ **Enums**: Type safety for constrained values  
✅ **JSON**: For flexible application data storage  

---

## 🔍 Key Indexes

```sql
-- USER indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_createdAt ON "User"(createdAt);

-- SCHOLARSHIP indexes
CREATE INDEX idx_scholarship_createdBy ON "Scholarship"(createdById);
CREATE INDEX idx_scholarship_status ON "Scholarship"(status);
CREATE INDEX idx_scholarship_deadline ON "Scholarship"(deadline);

-- APPLICATION indexes
CREATE INDEX idx_application_userId ON "Application"(userId);
CREATE INDEX idx_application_scholarshipId ON "Application"(scholarshipId);
CREATE INDEX idx_application_status ON "Application"(status);

-- NOTIFICATION indexes
CREATE INDEX idx_notification_userId ON "Notification"(userId);
CREATE INDEX idx_notification_read ON "Notification"(userId, isRead);

-- TESTIMONIAL indexes
CREATE INDEX idx_testimonial_createdBy ON "Testimonial"(createdBy);
CREATE INDEX idx_testimonial_createdAt ON "Testimonial"(createdAt);
```

---

## 💾 Data Integrity Constraints

```
User → StudentProfile      (1:1, CASCADE DELETE)
User → ProfessorProfile    (1:1, CASCADE DELETE)
User → RefreshToken        (1:M, CASCADE DELETE)
User → Scholarship         (1:M, CASCADE DELETE)
User → Application         (1:M, CASCADE DELETE)
User → SavedScholarship    (1:M, CASCADE DELETE)
User → Notification        (1:M, CASCADE DELETE)
User → Testimonial         (1:M, CASCADE DELETE)

Scholarship → Application          (1:M, CASCADE DELETE)
Scholarship → SavedScholarship     (1:M, CASCADE DELETE)
Scholarship → ScholarshipOnCategory (1:M, CASCADE DELETE)

Category → ScholarshipOnCategory (1:M, CASCADE DELETE)
```

---

## 📈 Query Performance Optimization

### **High-Traffic Queries**
```sql
-- Get scholarships (paginated)
SELECT * FROM "Scholarship" 
  WHERE status = 'APPROVED' 
  ORDER BY createdAt DESC 
  LIMIT 10 OFFSET 0;
-- Index: (status, createdAt)

-- Get user notifications
SELECT * FROM "Notification" 
  WHERE userId = ? AND isRead = false 
  ORDER BY createdAt DESC;
-- Index: (userId, isRead, createdAt)

-- Get testimonials by professor
SELECT * FROM "Testimonial" 
  WHERE createdBy = ? 
  ORDER BY createdAt DESC;
-- Index: (createdBy, createdAt)
```

---

## 🔄 Database Relationships Visualization

```
                          ┌─────────────┐
                          │   CATEGORY  │
                          └──────┬──────┘
                                 │
                    ┌────────────┴────────────┐
                    │                        │
            ┌───────▼────────┐      ┌────────▼────────┐
            │  SCHOLARSHIP   │◄─────│ SCHOLARSHIP_ON_ │
            │                │      │  CATEGORY       │
            └────────┬────────┘      └─────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼──────┐ ┌──▼────────┐ ┌──▼──────────────┐
    │APPLICATION│ │   SAVED_  │ │   USER          │
    │           │ │SCHOLARSHIP│ │  (createdBy)    │
    └───────────┘ └───────────┘ └────────┬────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
            ┌───────▼──────┐  ┌──────────▼──────┐  ┌──────────▼────┐
            │STUDENT_      │  │ PROFESSOR_      │  │REFRESH_       │
            │PROFILE       │  │ PROFILE         │  │TOKEN          │
            └──────────────┘  └─────────────────┘  └───────────────┘

            ┌──────────────────────┐  ┌──────────────────────┐
            │  NOTIFICATION        │  │  TESTIMONIAL         │
            │(userId -> User)      │  │(createdBy -> User)   │
            └──────────────────────┘  └──────────────────────┘

            ┌──────────────────────┐
            │  CONTACT_MESSAGE     │
            │(Independent Table)   │
            └──────────────────────┘
```

---

## 🔐 Foreign Key Constraints

```sql
ALTER TABLE "StudentProfile" 
  ADD CONSTRAINT "StudentProfile_userId_fkey" 
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE;

ALTER TABLE "ProfessorProfile" 
  ADD CONSTRAINT "ProfessorProfile_userId_fkey" 
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE;

ALTER TABLE "Scholarship" 
  ADD CONSTRAINT "Scholarship_createdById_fkey" 
  FOREIGN KEY (createdById) REFERENCES "User"(id) ON DELETE CASCADE;

ALTER TABLE "Application" 
  ADD CONSTRAINT "Application_userId_fkey" 
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE;
  
ALTER TABLE "SavedScholarship" 
  ADD CONSTRAINT "SavedScholarship_userId_fkey" 
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE;

ALTER TABLE "Notification" 
  ADD CONSTRAINT "Notification_userId_fkey" 
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE;

ALTER TABLE "Testimonial" 
  ADD CONSTRAINT "Testimonial_createdBy_fkey" 
  FOREIGN KEY (createdBy) REFERENCES "User"(id) ON DELETE CASCADE;
```

---

## 📊 Current Data (After Seeding)

```
Users:
  ├─ 1 Admin
  ├─ 1 Professor (with profile)
  └─ 1 Student (with profile)

Scholarships: 6
  ├─ Fulbright Foreign Student Program
  ├─ Chevening Scholarships
  ├─ DAAD Scholarships
  ├─ Turkish Scholarships
  ├─ Erasmus Mundus Joint Masters
  └─ MEXT Scholarship (Japan)

Testimonials: 4
  ├─ Nelson Mandela
  ├─ B.B. King
  ├─ Benjamin Franklin
  └─ Academic Board

Categories: 8
  ├─ STEM
  ├─ Arts & Humanities
  ├─ Business
  ├─ Medicine & Health
  ├─ Social Sciences
  ├─ Engineering
  ├─ Law
  └─ Education
```

---

## 🎯 Summary

The ScholarHub database is a **well-structured, normalized PostgreSQL database** with:

✅ 12 tables with clear relationships  
✅ Role-based access control  
✅ Comprehensive data integrity  
✅ Performance-optimized indexes  
✅ Flexible data structures (enums, arrays, JSON)  
✅ Cascade delete for data consistency  
✅ Seeded with sample data  
✅ Ready for production use  

