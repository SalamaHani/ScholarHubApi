# Document Types Reference

## DocumentType Enum Values

The following document types are supported in the system for both students and professors:

### Identity Documents
- `ID_CARD` - National ID or identity card
- `PASSPORT` - Passport or travel document
- `DATE_OF_BIRTH` - Birth certificate

### Education Certificates
- `ACADEMIC_CERTIFICATE` - General academic certificate
- `HIGH_DIPLOMA_CERTIFICATE` - High school/secondary diploma
- `BA_CERTIFICATE` - Bachelor of Arts degree certificate
- `PHD_CERTIFICATE` - Doctor of Philosophy degree certificate

### Academic Documents
- `TRANSCRIPT` - Academic transcripts from university/institution
- `RECOMMENDATION_LETTER` - Academic or professional recommendation letters
- `MOTIVATION_LETTER` - Motivation letter or statement of purpose

### Professional Documents
- `CV` - Curriculum Vitae or Resume
- `TEACHING_CERTIFICATE` - Certification for teaching ability/experience
- `RESEARCH_PUBLICATION` - Published research papers or articles

### Miscellaneous
- `UNIVERSITY_CARD` - University or institutional ID card
- `PDF_FILE` - General PDF file (for other documents)
- `OTHER` - Any other document type not listed above

## Usage by Role

### Students
Students can upload any of the 16 document types to build their profile:
```
POST /api/documents/student/upload
{
  "file": <binary>,
  "documentType": "PASSPORT" | "TRANSCRIPT" | "CV" | ... | "OTHER"
}
```

### Professors
Professors can upload any of the 16 document types to build their profile:
```
POST /api/documents/professor/upload
{
  "file": <binary>,
  "documentType": "PHD_CERTIFICATE" | "TEACHING_CERTIFICATE" | "RESEARCH_PUBLICATION" | ... | "OTHER"
}
```

## Document Categories

### Identity & Personal (3 types)
- ID_CARD
- PASSPORT
- DATE_OF_BIRTH

### Educational Credentials (4 types)
- ACADEMIC_CERTIFICATE
- HIGH_DIPLOMA_CERTIFICATE
- BA_CERTIFICATE
- PHD_CERTIFICATE

### Academic Support Materials (3 types)
- TRANSCRIPT
- RECOMMENDATION_LETTER
- MOTIVATION_LETTER

### Professional Materials (3 types)
- CV
- TEACHING_CERTIFICATE
- RESEARCH_PUBLICATION

### Other (3 types)
- UNIVERSITY_CARD
- PDF_FILE
- OTHER

## File Format Support

All document types can be uploaded in these formats:
- **PDF**: `application/pdf` (.pdf)
- **Microsoft Word**: `application/msword` (.doc), `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (.docx)
- **Microsoft Excel**: `application/vnd.ms-excel` (.xls), `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (.xlsx)
- **Images**: `image/jpeg` (.jpg, .jpeg), `image/png` (.png), `image/gif` (.gif)

## Verification Workflow

All uploaded documents go through a verification workflow:

1. **PENDING** (default) - Document uploaded, awaiting admin verification
2. **APPROVED** - Admin verified the document is valid
3. **REJECTED** - Admin rejected the document with notes

Example document in database:
```json
{
  "id": "cuid-123",
  "documentType": "PASSPORT",
  "fileName": "my_passport.pdf",
  "fileUrl": "/uploads/documents/doc-1705926000000-my_passport.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "verificationStatus": "PENDING",
  "verificationNotes": null,
  "uploadedBy": "user-id-456",
  "verifiedBy": null,
  "verifiedAt": null,
  "createdAt": "2026-01-24T15:40:00Z",
  "updatedAt": "2026-01-24T15:40:00Z"
}
```

## Best Practices

### For Students
1. Upload all identity documents first (PASSPORT, ID_CARD)
2. Follow with academic credentials (TRANSCRIPT, CERTIFICATES)
3. Add supporting materials (RECOMMENDATION_LETTER, CV)
4. Use CV for professional/work-related applications

### For Professors
1. Upload degree certificates (BA_CERTIFICATE, PHD_CERTIFICATE)
2. Provide university card or employee ID
3. Include teaching certificate if applicable
4. Add research publications to demonstrate expertise
5. Use RECOMMENDATION_LETTER if transitioning fields

### General Guidelines
- Use specific document types instead of `OTHER` when possible
- Keep file names descriptive but short
- Ensure documents are clear and legible (for images)
- Use PDF format when possible for consistency
- Check file size before uploading (10MB limit)
- Verify document type matches content

## Constraints & Limits

| Property | Value |
|----------|-------|
| Total Document Types | 16 |
| Max File Size | 10 MB |
| Supported Formats | PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF |
| Max Filename Length | System default |
| Storage Location | `/uploads/documents/` |
| File Retention | Permanent (unless manually deleted) |

## API Examples

### Upload Passport (Student)
```bash
curl -X POST http://localhost:5000/api/documents/student/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@passport.pdf" \
  -F "documentType=PASSPORT"
```

### Upload PhD Certificate (Professor)
```bash
curl -X POST http://localhost:5000/api/documents/professor/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@phd_certificate.pdf" \
  -F "documentType=PHD_CERTIFICATE"
```

### Get All Documents
```bash
curl -X GET http://localhost:5000/api/documents/student \
  -H "Authorization: Bearer <token>"
```

### Delete Document
```bash
curl -X DELETE http://localhost:5000/api/documents/student/cuid-123 \
  -H "Authorization: Bearer <token>"
```

## Database Schema

### StudentDocument Table
```prisma
model StudentDocument {
  id                 String         @id @default(cuid())
  studentProfileId   String
  studentProfile     StudentProfile @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)
  documentType       DocumentType   // One of 16 enum values
  fileName           String
  fileUrl            String
  fileSize           Int
  mimeType           String
  uploadedBy         String?
  verificationStatus String         @default("PENDING")
  verificationNotes  String?
  verifiedBy         String?
  verifiedAt         DateTime?
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt
  
  @@index([studentProfileId])
  @@index([documentType])
  @@index([verificationStatus])
}
```

### ProfessorDocument Table
```prisma
model ProfessorDocument {
  id                  String          @id @default(cuid())
  professorProfileId  String
  professorProfile    ProfessorProfile @relation(fields: [professorProfileId], references: [id], onDelete: Cascade)
  documentType        DocumentType    // One of 16 enum values
  fileName            String
  fileUrl             String
  fileSize            Int
  mimeType            String
  uploadedBy          String?
  verificationStatus  String          @default("PENDING")
  verificationNotes   String?
  verifiedBy          String?
  verifiedAt          DateTime?
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  
  @@index([professorProfileId])
  @@index([documentType])
  @@index([verificationStatus])
}
```
