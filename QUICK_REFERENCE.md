# Quick Reference - Document & Profile System

## 🚀 New Features

### Document Upload System
- Upload documents (students & professors)
- Admin verification workflow
- 16 document types supported
- 10MB file size limit

### Profile Management
- Update student/professor profiles
- View profiles with documents
- Professional validation

## 📋 API Quick Reference

### Upload Document
```
POST /api/documents/{role}/upload
role: student | professor

Body:
- file: <binary>
- documentType: <one of 16 types>

Response: 201 Created
```

### Get Documents
```
GET /api/documents/{role}
role: student | professor

Response: 200 OK - Array of documents
```

### Update Profile
```
PUT /api/users/profile/{role}
role: student | professor

Body: {...profile fields}

Response: 200 OK - Updated profile
```

### Get Profile with Documents
```
GET /api/users/profile/{role}
role: student | professor

Response: 200 OK - Profile + documents
```

### Admin: Verify Document
```
PUT /api/documents/admin/{role}/:documentId/verify
role: student | professor

Body:
{
  "verificationStatus": "APPROVED" | "REJECTED",
  "verificationNotes": "optional notes"
}

Response: 200 OK
```

### Admin: Get Pending Documents
```
GET /api/documents/admin/pending?role=student&documentType=PASSPORT
Query params:
- role: student | professor (optional)
- documentType: any document type (optional)

Response: 200 OK - Pending documents
```

## 📁 Document Types (16 Total)

**Identity Documents**
- ID_CARD
- PASSPORT
- DATE_OF_BIRTH

**Education Certificates**
- ACADEMIC_CERTIFICATE
- HIGH_DIPLOMA_CERTIFICATE
- BA_CERTIFICATE
- PHD_CERTIFICATE

**Academic Materials**
- TRANSCRIPT
- RECOMMENDATION_LETTER
- MOTIVATION_LETTER

**Professional Materials**
- CV
- TEACHING_CERTIFICATE
- RESEARCH_PUBLICATION

**Other**
- UNIVERSITY_CARD
- PDF_FILE
- OTHER

## 🔐 Access Control

| Endpoint | Student | Professor | Admin |
|----------|---------|-----------|-------|
| Upload Document | ✓ | ✓ | - |
| Get Documents | ✓ | ✓ | - |
| Delete Document | ✓ | ✓ | - |
| Update Profile | ✓ | ✓ | - |
| Get Profile | ✓ | ✓ | - |
| Verify Document | - | - | ✓ |
| Get Pending | - | - | ✓ |

## 📊 Database Models

### StudentDocument / ProfessorDocument
- id (PK)
- {role}ProfileId (FK)
- documentType (enum)
- fileName, fileUrl, fileSize
- mimeType
- uploadedBy
- verificationStatus (PENDING|APPROVED|REJECTED)
- verificationNotes
- verifiedBy, verifiedAt
- createdAt, updatedAt

## 🛠️ File Upload Details

**Max Size**: 10MB
**Formats**: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF
**Storage**: `/uploads/documents/`
**Naming**: Auto-generated with timestamp

## 🎯 Student Profile Fields

- university
- fieldOfStudy
- currentDegree
- gpa (0-4.0)
- graduationYear (2026-2035)
- country
- bio

## 👨‍🏫 Professor Profile Fields

- institution
- department
- position
- specialization
- website
- bio

## ✅ Verification Status States

1. **PENDING** - Waiting for admin review
2. **APPROVED** - Document verified and accepted
3. **REJECTED** - Document rejected with notes

## 📚 File Locations

```
Controllers:   src/controllers/document.controller.ts
Middleware:    src/middleware/uploadDocument.ts
Routes:        src/routes/document.routes.ts
Updated:       src/routes/user.routes.ts
               src/controllers/user.controller.ts
Storage:       uploads/documents/
```

## 📖 Documentation

- **DOCUMENTS_API.md** - Full document API
- **DOCUMENT_TYPES_REFERENCE.md** - Document types guide
- **PROFILE_DOCUMENTS_API.md** - Profile & verification API
- **DOCUMENT_SYSTEM_COMPLETE.md** - Complete overview

## 🧪 Example: Upload & Verify

### 1. Student uploads passport
```bash
curl -X POST /api/documents/student/upload \
  -F "file=@passport.pdf" \
  -F "documentType=PASSPORT"
```

### 2. Admin sees pending
```bash
curl -X GET /api/documents/admin/pending?role=student
```

### 3. Admin verifies
```bash
curl -X PUT /api/documents/admin/student/{docId}/verify \
  -d '{"verificationStatus":"APPROVED"}'
```

### 4. Student checks profile
```bash
curl -X GET /api/users/profile/student
```

## 🔗 Integration Points

- Uses existing auth middleware
- Uses existing isAdmin middleware
- Follows project error handling pattern
- Compatible with existing user system
- Extends StudentProfile & ProfessorProfile models

## 📦 Exports

All new functions exported from:
- `src/controllers/index.ts`
- Available for direct import or via routes

## ⚡ Performance

- Indexed on: profileId, documentType, verificationStatus
- Efficient queries with includes
- Minimal database hits per request

## 🚫 Error Handling

All endpoints return:
- 400: Bad Request (invalid input)
- 401: Unauthorized (auth required)
- 403: Forbidden (wrong role/permission)
- 404: Not Found (resource doesn't exist)
- 201/200: Success

## ✨ Features Implemented

✅ Document upload with validation
✅ Document storage & tracking
✅ Database persistence
✅ Admin verification workflow
✅ Professional profile management
✅ Profile + documents retrieval
✅ Comprehensive error handling
✅ Role-based access control
✅ Ownership verification
✅ File format validation
✅ Type-safe enums
✅ Full documentation

## 🎉 Ready to Use!

All endpoints are production-ready and fully documented.
