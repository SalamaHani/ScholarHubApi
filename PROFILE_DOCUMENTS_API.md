# Profile & Document Management API

## Overview
Professional endpoints for managing student and professor profiles, including detailed profile retrieval with documents and comprehensive document verification workflows.

## Student Profile Endpoints

### 1. Get Student Profile Details
Retrieve complete student profile including all uploaded documents.

```http
GET /api/users/profile/student
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cuid-student-1",
    "userId": "cuid-user-1",
    "university": "Gaza University",
    "fieldOfStudy": "Computer Science",
    "currentDegree": "BACHELOR",
    "gpa": 3.8,
    "graduationYear": 2026,
    "country": "Palestine",
    "bio": "Passionate about computer science and innovation",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-24T15:40:00Z",
    "user": {
      "id": "cuid-user-1",
      "email": "student@example.com",
      "firstName": "Sarah",
      "lastName": "Mohammed",
      "role": "STUDENT",
      "phone": "+970123456789",
      "avatar": "/uploads/avatars/avatar-123.jpg",
      "createdAt": "2026-01-15T10:00:00Z"
    },
    "documents": [
      {
        "id": "cuid-doc-1",
        "documentType": "PASSPORT",
        "fileName": "passport.pdf",
        "verificationStatus": "APPROVED",
        "createdAt": "2026-01-20T14:30:00Z"
      },
      {
        "id": "cuid-doc-2",
        "documentType": "TRANSCRIPT",
        "fileName": "transcript.pdf",
        "verificationStatus": "APPROVED",
        "createdAt": "2026-01-21T09:15:00Z"
      },
      {
        "id": "cuid-doc-3",
        "documentType": "CV",
        "fileName": "cv.pdf",
        "verificationStatus": "PENDING",
        "createdAt": "2026-01-22T16:45:00Z"
      }
    ]
  }
}
```

### 2. Update Student Profile
Update student profile information (education details, bio, etc).

```http
PUT /api/users/profile/student
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "university": "University of Palestine",
  "fieldOfStudy": "Computer Science",
  "currentDegree": "MASTER",
  "gpa": 3.9,
  "graduationYear": 2028,
  "country": "Palestine",
  "bio": "Master's student focused on AI and Machine Learning"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student profile updated successfully",
  "data": {
    "id": "cuid-student-1",
    "userId": "cuid-user-1",
    "university": "University of Palestine",
    "fieldOfStudy": "Computer Science",
    "currentDegree": "MASTER",
    "gpa": 3.9,
    "graduationYear": 2028,
    "country": "Palestine",
    "bio": "Master's student focused on AI and Machine Learning",
    "user": {
      "id": "cuid-user-1",
      "email": "student@example.com",
      "firstName": "Sarah",
      "lastName": "Mohammed",
      "role": "STUDENT"
    }
  }
}
```

**Validation Rules:**
- `gpa`: Must be between 0 and 4.0
- `graduationYear`: Must be between 2026 and 2035
- All fields optional (partial updates allowed)

## Professor Profile Endpoints

### 1. Get Professor Profile Details
Retrieve complete professor profile including all uploaded documents.

```http
GET /api/users/profile/professor
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cuid-prof-1",
    "userId": "cuid-user-2",
    "institution": "Gaza University",
    "department": "Computer Science",
    "position": "Associate Professor",
    "specialization": "Machine Learning",
    "website": "https://example.com",
    "bio": "Experienced professor with 15 years in academia",
    "isVerified": true,
    "verifiedAt": "2026-01-15T10:00:00Z",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-24T15:40:00Z",
    "user": {
      "id": "cuid-user-2",
      "email": "professor@university.edu",
      "firstName": "Dr. Ahmed",
      "lastName": "Hassan",
      "role": "PROFESSOR",
      "phone": "+970987654321",
      "avatar": "/uploads/avatars/avatar-456.jpg",
      "createdAt": "2026-01-15T10:00:00Z"
    },
    "documents": [
      {
        "id": "cuid-doc-4",
        "documentType": "PHD_CERTIFICATE",
        "fileName": "phd_certificate.pdf",
        "verificationStatus": "APPROVED",
        "createdAt": "2026-01-18T11:20:00Z"
      },
      {
        "id": "cuid-doc-5",
        "documentType": "TEACHING_CERTIFICATE",
        "fileName": "teaching_cert.pdf",
        "verificationStatus": "APPROVED",
        "createdAt": "2026-01-19T13:50:00Z"
      },
      {
        "id": "cuid-doc-6",
        "documentType": "RESEARCH_PUBLICATION",
        "fileName": "paper.pdf",
        "verificationStatus": "APPROVED",
        "createdAt": "2026-01-20T08:30:00Z"
      }
    ]
  }
}
```

### 2. Update Professor Profile
Update professor profile information (institution details, specialization, etc).

```http
PUT /api/users/profile/professor
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "institution": "Al-Quds University",
  "department": "Artificial Intelligence",
  "position": "Professor",
  "specialization": "Deep Learning & Computer Vision",
  "website": "https://scholar.example.com",
  "bio": "Leading research in AI applications for healthcare"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Professor profile updated successfully",
  "data": {
    "id": "cuid-prof-1",
    "userId": "cuid-user-2",
    "institution": "Al-Quds University",
    "department": "Artificial Intelligence",
    "position": "Professor",
    "specialization": "Deep Learning & Computer Vision",
    "website": "https://scholar.example.com",
    "bio": "Leading research in AI applications for healthcare",
    "isVerified": true,
    "user": {
      "id": "cuid-user-2",
      "email": "professor@university.edu",
      "firstName": "Dr. Ahmed",
      "lastName": "Hassan",
      "role": "PROFESSOR"
    }
  }
}
```

**All fields optional** (partial updates allowed)

## Document Verification (Admin Only)

### 1. Verify Student Document
Approve or reject a student's uploaded document.

```http
PUT /api/documents/admin/student/:documentId/verify
Authorization: Bearer <adminToken>
Content-Type: application/json

Body:
{
  "verificationStatus": "APPROVED",
  "verificationNotes": "Document verified successfully"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Document approved successfully",
  "data": {
    "id": "cuid-doc-1",
    "studentProfileId": "cuid-student-1",
    "documentType": "PASSPORT",
    "fileName": "passport.pdf",
    "fileUrl": "/uploads/documents/doc-1705926000000-passport.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "uploadedBy": "cuid-user-1",
    "verificationStatus": "APPROVED",
    "verificationNotes": "Document verified successfully",
    "verifiedBy": "cuid-admin-1",
    "verifiedAt": "2026-01-24T16:00:00Z",
    "createdAt": "2026-01-20T14:30:00Z",
    "updatedAt": "2026-01-24T16:00:00Z"
  }
}
```

### 2. Reject Student Document
```http
PUT /api/documents/admin/student/:documentId/verify
Authorization: Bearer <adminToken>
Content-Type: application/json

Body:
{
  "verificationStatus": "REJECTED",
  "verificationNotes": "Document is not legible. Please resubmit a clearer copy."
}
```

### 3. Verify Professor Document
Approve or reject a professor's uploaded document.

```http
PUT /api/documents/admin/professor/:documentId/verify
Authorization: Bearer <adminToken>
Content-Type: application/json

Body:
{
  "verificationStatus": "APPROVED",
  "verificationNotes": "PhD certificate verified"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Document approved successfully",
  "data": {
    "id": "cuid-doc-4",
    "professorProfileId": "cuid-prof-1",
    "documentType": "PHD_CERTIFICATE",
    "fileName": "phd_certificate.pdf",
    "fileUrl": "/uploads/documents/doc-1705926002000-phd_certificate.pdf",
    "fileSize": 2097152,
    "mimeType": "application/pdf",
    "uploadedBy": "cuid-user-2",
    "verificationStatus": "APPROVED",
    "verificationNotes": "PhD certificate verified",
    "verifiedBy": "cuid-admin-1",
    "verifiedAt": "2026-01-24T16:00:00Z",
    "createdAt": "2026-01-18T11:20:00Z",
    "updatedAt": "2026-01-24T16:00:00Z"
  }
}
```

### 4. Get Pending Documents (Admin)
Retrieve all pending documents awaiting verification.

```http
GET /api/documents/admin/pending?role=student&documentType=PASSPORT
Authorization: Bearer <adminToken>
```

**Query Parameters:**
- `role` (optional): `student` or `professor` (if omitted, gets both)
- `documentType` (optional): Filter by specific document type

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "pendingCount": 2,
    "studentDocuments": [
      {
        "id": "cuid-doc-3",
        "studentProfileId": "cuid-student-1",
        "documentType": "CV",
        "fileName": "cv.pdf",
        "fileUrl": "/uploads/documents/doc-1705926003000-cv.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "uploadedBy": "cuid-user-1",
        "verificationStatus": "PENDING",
        "verificationNotes": null,
        "verifiedBy": null,
        "verifiedAt": null,
        "createdAt": "2026-01-22T16:45:00Z",
        "updatedAt": "2026-01-22T16:45:00Z",
        "studentProfile": {
          "user": {
            "id": "cuid-user-1",
            "email": "student@example.com",
            "firstName": "Sarah",
            "lastName": "Mohammed"
          }
        }
      }
    ],
    "professorDocuments": [
      {
        "id": "cuid-doc-7",
        "professorProfileId": "cuid-prof-2",
        "documentType": "RESEARCH_PUBLICATION",
        "fileName": "paper.pdf",
        "fileUrl": "/uploads/documents/doc-1705926004000-paper.pdf",
        "fileSize": 3145728,
        "mimeType": "application/pdf",
        "uploadedBy": "cuid-user-3",
        "verificationStatus": "PENDING",
        "verificationNotes": null,
        "verifiedBy": null,
        "verifiedAt": null,
        "createdAt": "2026-01-23T10:15:00Z",
        "updatedAt": "2026-01-23T10:15:00Z",
        "professorProfile": {
          "user": {
            "id": "cuid-user-3",
            "email": "prof2@university.edu",
            "firstName": "Dr. Fatima",
            "lastName": "Ali"
          }
        }
      }
    ]
  }
}
```

## Error Responses

### 400 Bad Request - Invalid Graduation Year
```json
{
  "success": false,
  "message": "Invalid graduation year"
}
```

### 400 Bad Request - Invalid GPA
```json
{
  "success": false,
  "message": "GPA must be between 0 and 4.0"
}
```

### 403 Forbidden - Wrong Role
```json
{
  "success": false,
  "message": "Only students can update student profile"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Student profile not found"
}
```

## API Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile/student` | Get student profile + docs | Student |
| PUT | `/api/users/profile/student` | Update student profile | Student |
| GET | `/api/users/profile/professor` | Get professor profile + docs | Professor |
| PUT | `/api/users/profile/professor` | Update professor profile | Professor |
| PUT | `/api/documents/admin/student/:id/verify` | Verify student doc | Admin |
| PUT | `/api/documents/admin/professor/:id/verify` | Verify professor doc | Admin |
| GET | `/api/documents/admin/pending` | Get pending docs | Admin |

## Usage Examples

### Update Student Profile with cURL
```bash
curl -X PUT http://localhost:5000/api/users/profile/student \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "university": "University of Palestine",
    "gpa": 3.9,
    "graduationYear": 2028
  }'
```

### Get Student Profile with cURL
```bash
curl -X GET http://localhost:5000/api/users/profile/student \
  -H "Authorization: Bearer <token>"
```

### Verify Document with cURL (Admin)
```bash
curl -X PUT http://localhost:5000/api/documents/admin/student/cuid-doc-1/verify \
  -H "Authorization: Bearer <adminToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationStatus": "APPROVED",
    "verificationNotes": "Document verified"
  }'
```

### Get Pending Documents with cURL (Admin)
```bash
curl -X GET "http://localhost:5000/api/documents/admin/pending?role=student" \
  -H "Authorization: Bearer <adminToken>"
```
