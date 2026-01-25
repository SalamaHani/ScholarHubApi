# Document Upload API Endpoints

## Overview
Professional document upload and management system for students and professors with file validation, storage, and database tracking.

## Features
- ✅ Secure file upload (PDF, Word, Excel, Images)
- ✅ File size validation (max 10MB)
- ✅ MIME type validation
- ✅ Document type enumeration (type-safe)
- ✅ Database persistence
- ✅ Verification workflow for admin
- ✅ Permission-based access control

## Supported File Types

### Student & Professor Documents
- **ID_CARD** - National ID or identity card
- **UNIVERSITY_CARD** - University/institutional card
- **ACADEMIC_CERTIFICATE** - Academic certificates
- **PASSPORT** - Passport document
- **HIGH_DIPLOMA_CERTIFICATE** - High school diploma
- **BA_CERTIFICATE** - Bachelor's degree certificate
- **PHD_CERTIFICATE** - PhD degree certificate
- **DATE_OF_BIRTH** - Birth certificate
- **TRANSCRIPT** - Academic transcripts
- **RECOMMENDATION_LETTER** - Recommendation letters
- **MOTIVATION_LETTER** - Motivation/cover letters
- **CV** - Curriculum Vitae/Resume
- **TEACHING_CERTIFICATE** - Teaching certifications
- **RESEARCH_PUBLICATION** - Published research papers
- **PDF_FILE** - General PDF files
- **OTHER** - Other document types

## File Format Support
- **PDF**: `application/pdf`
- **Word**: `.doc`, `.docx`
- **Excel**: `.xls`, `.xlsx`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`

## Endpoints

### Student Document Endpoints

#### 1. Upload Student Document
```http
POST /api/documents/student/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- file: <binary>
- documentType: ID_CARD | UNIVERSITY_CARD | ACADEMIC_CERTIFICATE | PASSPORT | HIGH_DIPLOMA_CERTIFICATE | BA_CERTIFICATE | PHD_CERTIFICATE | DATE_OF_BIRTH | TRANSCRIPT | RECOMMENDATION_LETTER | MOTIVATION_LETTER | CV | TEACHING_CERTIFICATE | RESEARCH_PUBLICATION | PDF_FILE | OTHER
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "cuid-123",
    "documentType": "PASSPORT",
    "fileName": "my_passport.pdf",
    "fileUrl": "/uploads/documents/doc-1705926000000-my_passport.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "verificationStatus": "PENDING",
    "uploadedAt": "2026-01-24T15:40:00Z"
  }
}
```

#### 2. Get All Student Documents
```http
GET /api/documents/student
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid-123",
      "documentType": "PASSPORT",
      "fileName": "my_passport.pdf",
      "fileUrl": "/uploads/documents/doc-1705926000000-my_passport.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "verificationStatus": "APPROVED",
      "verificationNotes": null,
      "createdAt": "2026-01-24T15:40:00Z"
    },
    {
      "id": "cuid-124",
      "documentType": "TRANSCRIPT",
      "fileName": "academic_transcript.pdf",
      "fileUrl": "/uploads/documents/doc-1705926001000-academic_transcript.pdf",
      "fileSize": 1536000,
      "mimeType": "application/pdf",
      "verificationStatus": "APPROVED",
      "verificationNotes": null,
      "createdAt": "2026-01-24T15:41:00Z"
    }
  ]
}
```

#### 3. Delete Student Document
```http
DELETE /api/documents/student/:documentId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Professor Document Endpoints

#### 1. Upload Professor Document
```http
POST /api/documents/professor/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- file: <binary>
- documentType: ID_CARD | UNIVERSITY_CARD | ACADEMIC_CERTIFICATE | PASSPORT | HIGH_DIPLOMA_CERTIFICATE | BA_CERTIFICATE | PHD_CERTIFICATE | DATE_OF_BIRTH | TRANSCRIPT | RECOMMENDATION_LETTER | MOTIVATION_LETTER | CV | TEACHING_CERTIFICATE | RESEARCH_PUBLICATION | PDF_FILE | OTHER
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "cuid-125",
    "documentType": "DEGREE_CERTIFICATE",
    "fileName": "phd_certificate.pdf",
    "fileUrl": "/uploads/documents/doc-1705926002000-phd_certificate.pdf",
    "fileSize": 2097152,
    "mimeType": "application/pdf",
    "verificationStatus": "PENDING",
    "uploadedAt": "2026-01-24T15:42:00Z"
  }
}
```

#### 2. Get All Professor Documents
```http
GET /api/documents/professor
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid-125",
      "documentType": "DEGREE_CERTIFICATE",
      "fileName": "phd_certificate.pdf",
      "fileUrl": "/uploads/documents/doc-1705926002000-phd_certificate.pdf",
      "fileSize": 2097152,
      "mimeType": "application/pdf",
      "verificationStatus": "APPROVED",
      "verificationNotes": null,
      "createdAt": "2026-01-24T15:42:00Z"
    }
  ]
}
```

#### 3. Delete Professor Document
```http
DELETE /api/documents/professor/:documentId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You cannot delete this document"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Document not found"
}
```

## Constraints

| Constraint | Value |
|-----------|-------|
| Max File Size | 10MB |
| Allowed Formats | PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF |
| Storage Location | `/uploads/documents/` |
| File Naming | Auto-generated with timestamp (e.g., `doc-1705926000000-filename.pdf`) |
| Verification Status | PENDING, APPROVED, REJECTED |

## Database Schema

### StudentDocument
- `id` (PK) - Unique identifier
- `studentProfileId` (FK) - Reference to StudentProfile
- `documentType` - Enum: PASSPORT, TRANSCRIPT, CERTIFICATE, ESSAY, RESUME
- `fileName` - Original file name
- `fileUrl` - Relative URL to stored file
- `fileSize` - File size in bytes
- `mimeType` - MIME type of file
- `uploadedBy` - User ID who uploaded
- `verificationStatus` - PENDING, APPROVED, REJECTED
- `verificationNotes` - Admin verification notes
- `verifiedBy` - Admin user ID
- `verifiedAt` - Verification timestamp
- `createdAt` - Upload timestamp
- `updatedAt` - Last modified timestamp

### ProfessorDocument
- Same structure as StudentDocument but for professors
- `documentType` - String values: DEGREE_CERTIFICATE, EMPLOYEE_ID, PUBLICATION, QUALIFICATION, LICENSE

## Usage Examples

### Example: Upload Student Passport
```bash
curl -X POST http://localhost:5000/api/documents/student/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/passport.pdf" \
  -F "documentType=PASSPORT"
```

### Example: Get Student Documents
```bash
curl -X GET http://localhost:5000/api/documents/student \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example: Delete Student Document
```bash
curl -X DELETE http://localhost:5000/api/documents/student/cuid-123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Security Considerations

1. **File Validation**
   - MIME type validation on upload
   - File extension whitelist
   - Max file size enforcement

2. **Access Control**
   - User must be authenticated
   - Users can only manage their own documents
   - Profile ownership verified before operations

3. **File Storage**
   - Files stored outside web root for security
   - Unique filenames to prevent conflicts
   - Original names preserved in database

4. **Admin Verification**
   - Documents require admin verification before use
   - Admin can add notes and reject documents
   - Verification timestamps tracked

## Implementation Notes

- Files uploaded to `uploads/documents/` directory
- Document URLs are relative paths for flexibility
- Filenames auto-sanitized to prevent path traversal
- Timestamps in milliseconds for unique file names
- Profile ownership verified before any operation
- Soft deletes not implemented (hard delete only)
