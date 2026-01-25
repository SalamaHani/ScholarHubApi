# Admin Scholarships Management API

## Overview
Professional admin interface for managing all scholarships with advanced pagination, filtering, and sorting capabilities.

## Base URL
```
GET /api/scholarships/admin/all
```

## Authentication
**Required**: JWT Bearer Token + Admin Role

## Query Parameters

### Pagination
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 20 | Items per page (1-100) |

### Filtering
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search in title, description, organization |
| `status` | enum | Filter by scholarship status: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `CLOSED` |
| `country` | string | Filter by country name |
| `degreeLevel` | enum | Filter by degree: `BACHELOR`, `MASTER`, `PHD`, `POSTDOC`, `RESEARCH` |
| `fundingType` | enum | Filter by funding: `FULL`, `PARTIAL`, `TUITION_ONLY`, `STIPEND_ONLY` |
| `category` | string | Filter by category slug |
| `language` | string | Filter by study language (e.g., "English", "French") |
| `studyMode` | string | Filter by mode: `Online`, `On-campus`, `Hybrid` |
| `createdBy` | string | Filter by creator user ID |
| `featured` | string | Filter by featured status: `true`, `false` |

### Sorting
| Parameter | Type | Default | Values |
|-----------|------|---------|--------|
| `sortBy` | string | createdAt | `createdAt`, `deadline`, `views`, `amount` |
| `sortOrder` | string | desc | `asc`, `desc` |

## Response Structure

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "scholarships": [
      {
        "id": "clv1234567890abcdef",
        "title": "Global Excellence Scholarship",
        "description": "Full scholarship for international students",
        "organization": "University of Excellence",
        "country": "Canada",
        "region": "Ontario",
        "fieldOfStudy": ["Computer Science", "Engineering"],
        "degreeLevel": ["BACHELOR", "MASTER"],
        "fundingType": "FULL",
        "amount": "50000",
        "currency": "CAD",
        "deadline": "2026-06-30T23:59:59Z",
        "startDate": "2026-09-01T00:00:00Z",
        "duration": "2 years",
        "language": "English",
        "studyMode": "On-campus",
        "applicationLink": "https://example.com/apply",
        "requirements": "Minimum GPA 3.5",
        "eligibility": "International students only",
        "benefits": "Tuition + living allowance",
        "documents": ["Passport", "Academic transcripts", "Statement of purpose"],
        "status": "APPROVED",
        "isExternal": false,
        "isFeatured": true,
        "views": 1250,
        "createdById": "prof_id_123",
        "createdBy": {
          "id": "prof_id_123",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@university.edu",
          "role": "PROFESSOR"
        },
        "approvedById": "admin_id_456",
        "approvedAt": "2026-01-20T10:30:00Z",
        "rejectionReason": null,
        "createdAt": "2026-01-15T08:00:00Z",
        "updatedAt": "2026-01-20T10:30:00Z",
        "categories": [
          {
            "id": "cat_123",
            "name": "STEM",
            "slug": "stem"
          }
        ],
        "_count": {
          "applications": 45,
          "savedBy": 120
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8,
      "hasMore": true
    },
    "stats": {
      "totalCount": 156,
      "totalFunding": 7500000,
      "averageViews": 342
    }
  }
}
```

### Error Response (401/403)
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

## Usage Examples

### Get All Scholarships (First Page)
```bash
curl -X GET "http://localhost:8080/api/scholarships/admin/all" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get Page 2 with 50 Items
```bash
curl -X GET "http://localhost:8080/api/scholarships/admin/all?page=2&limit=50" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Filter by Status and Country
```bash
curl -X GET "http://localhost:8080/api/scholarships/admin/all?status=PENDING_APPROVAL&country=USA" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Search and Filter
```bash
curl -X GET "http://localhost:8080/api/scholarships/admin/all?search=engineering&degreeLevel=MASTER&fundingType=FULL" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Sort by Amount (Descending) and Featured Only
```bash
curl -X GET "http://localhost:8080/api/scholarships/admin/all?sortBy=amount&sortOrder=desc&featured=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Filter by Creator and Study Mode
```bash
curl -X GET "http://localhost:8080/api/scholarships/admin/all?createdBy=prof_123&studyMode=Online&language=French" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Complex Query (Multiple Filters + Sorting)
```bash
curl -X GET "http://localhost:8080/api/scholarships/admin/all?page=1&limit=30&search=STEM&status=APPROVED&country=Canada&fundingType=FULL&sortBy=views&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Filtering Examples

### Get All Pending Scholarships for Review
```bash
GET /api/scholarships/admin/all?status=PENDING_APPROVAL&page=1&limit=20
```

### Get Featured Scholarships with High Views
```bash
GET /api/scholarships/admin/all?featured=true&sortBy=views&sortOrder=desc&limit=10
```

### Get All Scholarships in Specific Country
```bash
GET /api/scholarships/admin/all?country=Germany&sortBy=deadline&sortOrder=asc
```

### Get Scholarships by Specific Professor
```bash
GET /api/scholarships/admin/all?createdBy=USER_ID&sortBy=createdAt&sortOrder=desc
```

### Get Recent Approved Scholarships
```bash
GET /api/scholarships/admin/all?status=APPROVED&sortBy=createdAt&sortOrder=desc&limit=25
```

### Get All Draft Scholarships
```bash
GET /api/scholarships/admin/all?status=DRAFT&limit=50
```

### Search for Scholarships by Organization
```bash
GET /api/scholarships/admin/all?search=Harvard&limit=20
```

### Get Online Study Mode Scholarships
```bash
GET /api/scholarships/admin/all?studyMode=Online&sortBy=amount&sortOrder=desc
```

### Get All Rejected Scholarships
```bash
GET /api/scholarships/admin/all?status=REJECTED&sortBy=updatedAt&sortOrder=desc
```

## Response Statistics

The response includes useful statistics about the filtered scholarships:

```json
"stats": {
  "totalCount": 156,           // Total scholarships matching filters
  "totalFunding": 7500000,     // Sum of all amounts (with decimal)
  "averageViews": 342          // Average views per scholarship
}
```

## Status Values

| Status | Description |
|--------|-------------|
| `DRAFT` | Scholarship saved but not submitted |
| `PENDING_APPROVAL` | Awaiting admin review |
| `APPROVED` | Approved and publicly visible |
| `REJECTED` | Rejected with reason |
| `CLOSED` | Deadline passed or manually closed |

## Funding Types

| Type | Description |
|------|-------------|
| `FULL` | Covers all costs |
| `PARTIAL` | Covers part of costs |
| `TUITION_ONLY` | Covers tuition only |
| `STIPEND_ONLY` | Monthly allowance only |

## Degree Levels

- `BACHELOR`
- `MASTER`
- `PHD`
- `POSTDOC`
- `RESEARCH`

## Admin Capabilities

✅ View all scholarships (any status)
✅ Advanced filtering and searching
✅ Sort by multiple criteria
✅ Professional pagination
✅ View creator information
✅ See application statistics
✅ See save/bookmark counts
✅ Access aggregate statistics
✅ Filter by approval status
✅ View rejection reasons

## Related Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scholarships/admin/all` | GET | Get all scholarships (admin) |
| `/api/scholarships/admin/pending` | GET | Get pending scholarships only |
| `/api/scholarships/:id/approve` | PUT | Approve a scholarship |
| `/api/scholarships/:id/reject` | PUT | Reject a scholarship |
| `/api/scholarships/:id/feature` | PUT | Toggle featured status |

## Notes

- **Case-Insensitive Search**: Search, country, language, and studyMode filters are case-insensitive
- **Pagination**: Use `page` and `limit` to control results. Default page size is 20
- **Performance**: Indexes on `deadline`, `country`, and `status` for optimal queries
- **Sorting**: Default sort is by `createdAt` in descending order (newest first)
- **Statistics**: Stats are calculated from filtered results (respects all filters)
