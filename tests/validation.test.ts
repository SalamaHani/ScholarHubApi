/**
 * Validation Tests
 * Tests for data validation scenarios
 */

describe('Data Validation Tests', () => {
  describe('Input Validation', () => {
    test('Should validate user registration input', () => {
      const validateRegistration = (data: any) => {
        const errors = [];
        
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.push('Valid email is required');
        }
        if (!data.password || data.password.length < 8) {
          errors.push('Password must be at least 8 characters');
        }
        if (!data.name || data.name.trim().length === 0) {
          errors.push('Name is required');
        }
        
        return { valid: errors.length === 0, errors };
      };
      
      const invalid1 = validateRegistration({ email: 'invalid', password: 'short', name: '' });
      expect(invalid1.valid).toBe(false);
      expect(invalid1.errors.length).toBeGreaterThan(0);
      
      const valid = validateRegistration({ 
        email: 'user@test.com', 
        password: 'SecurePass123', 
        name: 'John Doe' 
      });
      expect(valid.valid).toBe(true);
      expect(valid.errors.length).toBe(0);
    });

    test('Should validate scholarship application input', () => {
      const validateScholarshipApp = (data: any) => {
        if (!data.scholarshipId || typeof data.scholarshipId !== 'number') {
          throw new Error('Valid scholarship ID required');
        }
        if (!data.applicantId || typeof data.applicantId !== 'number') {
          throw new Error('Valid applicant ID required');
        }
        if (!data.essayText || data.essayText.length < 100) {
          throw new Error('Essay must be at least 100 characters');
        }
        return true;
      };
      
      expect(() => validateScholarshipApp({})).toThrow();
      expect(() => validateScholarshipApp({ scholarshipId: 1, applicantId: 1, essayText: 'short' })).toThrow('Essay must be at least 100 characters');
      
      const validApp = {
        scholarshipId: 1,
        applicantId: 1,
        essayText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.'
      };
      expect(validateScholarshipApp(validApp)).toBe(true);
    });

    test('Should validate document upload input', () => {
      const validateDocumentUpload = (data: any) => {
        const allowedFormats = ['pdf', 'doc', 'docx', 'txt'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!data.fileName) throw new Error('File name is required');
        
        const extension = data.fileName.split('.').pop()?.toLowerCase();
        if (!allowedFormats.includes(extension)) {
          throw new Error(`File format must be one of: ${allowedFormats.join(', ')}`);
        }
        
        if (!data.fileSize || data.fileSize > maxSize) {
          throw new Error('File size must not exceed 5MB');
        }
        
        return true;
      };
      
      expect(() => validateDocumentUpload({})).toThrow('File name is required');
      expect(() => validateDocumentUpload({ fileName: 'doc.exe', fileSize: 1000 })).toThrow('File format must be one of');
      expect(() => validateDocumentUpload({ fileName: 'doc.pdf', fileSize: 10 * 1024 * 1024 })).toThrow('File size must not exceed 5MB');
      
      expect(validateDocumentUpload({ 
        fileName: 'document.pdf', 
        fileSize: 2 * 1024 * 1024 
      })).toBe(true);
    });
  });

  describe('Business Logic Validation', () => {
    test('Should validate scholarship requirements', () => {
      const validateScholarship = (data: any) => {
        if (!data.title || data.title.trim().length === 0) {
          throw new Error('Scholarship title is required');
        }
        if (typeof data.amount !== 'number' || data.amount <= 0) {
          throw new Error('Scholarship amount must be greater than 0');
        }
        if (data.maxGPA && (data.maxGPA < 0 || data.maxGPA > 4.0)) {
          throw new Error('GPA must be between 0 and 4.0');
        }
        if (data.minGPA && data.maxGPA && data.minGPA > data.maxGPA) {
          throw new Error('Minimum GPA cannot be greater than maximum GPA');
        }
        return true;
      };
      
      expect(() => validateScholarship({})).toThrow('Scholarship title is required');
      expect(() => validateScholarship({ title: 'Test', amount: -100 })).toThrow('Scholarship amount must be greater than 0');
      expect(() => validateScholarship({ title: 'Test', amount: 1000, maxGPA: 5.0 })).toThrow('GPA must be between 0 and 4.0');
      expect(() => validateScholarship({ title: 'Test', amount: 1000, minGPA: 3.5, maxGPA: 3.0 })).toThrow('Minimum GPA cannot be greater than maximum GPA');
      
      expect(validateScholarship({ 
        title: 'Merit Scholarship', 
        amount: 5000, 
        minGPA: 3.0, 
        maxGPA: 4.0 
      })).toBe(true);
    });

    test('Should validate interview scheduling', () => {
      const validateInterviewSchedule = (data: any) => {
        const now = new Date();
        const interviewDate = new Date(data.scheduledTime);
        
        if (interviewDate < now) {
          throw new Error('Interview date must be in the future');
        }
        
        const daysDiff = (interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 1) {
          throw new Error('Interview must be scheduled at least 1 day in advance');
        }
        
        if (data.duration <= 0 || data.duration > 480) {
          throw new Error('Interview duration must be between 1 and 480 minutes');
        }
        
        return true;
      };
      
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      expect(() => validateInterviewSchedule({ 
        scheduledTime: pastDate.toISOString(), 
        duration: 30 
      })).toThrow('Interview date must be in the future');
      
      const futureDate = new Date(Date.now() + 12 * 60 * 60 * 1000); // In 12 hours
      expect(() => validateInterviewSchedule({ 
        scheduledTime: futureDate.toISOString(), 
        duration: 30 
      })).toThrow('Interview must be scheduled at least 1 day in advance');
      
      const validDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // In 2 days
      expect(validateInterviewSchedule({ 
        scheduledTime: validDate.toISOString(), 
        duration: 60 
      })).toBe(true);
    });
  });

  describe('Format Validation', () => {
    test('Should validate phone numbers', () => {
      const validatePhone = (phone: string) => {
        const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
        return phoneRegex.test(phone);
      };
      
      expect(validatePhone('+1-555-123-4567')).toBe(true);
      expect(validatePhone('555-123-4567')).toBe(true);
      expect(validatePhone('5551234567')).toBe(true);
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
    });

    test('Should validate URLs', () => {
      const validateUrl = (url: string) => {
        try {
          const urlObj = new URL(url);
          // Only allow http and https protocols
          return ['http:', 'https:'].includes(urlObj.protocol);
        } catch {
          return false;
        }
      };
      
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://www.example.com')).toBe(true);
      expect(validateUrl('not a url')).toBe(false);
      expect(validateUrl('ftp://wrong.com')).toBe(false);
    });

    test('Should validate JSON strings', () => {
      const validateJson = (str: string) => {
        try {
          JSON.parse(str);
          return true;
        } catch {
          return false;
        }
      };
      
      expect(validateJson('{"key": "value"}')).toBe(true);
      expect(validateJson('[1, 2, 3]')).toBe(true);
      expect(validateJson('not json')).toBe(false);
      expect(validateJson('{incomplete')).toBe(false);
    });

    test('Should validate ISO date strings', () => {
      const validateIsoDate = (dateStr: string) => {
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        if (!isoRegex.test(dateStr)) return false;
        
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      };
      
      expect(validateIsoDate('2026-06-07T12:00:00Z')).toBe(true);
      expect(validateIsoDate('2026-06-07T12:00:00')).toBe(true);
      expect(validateIsoDate('2026-06-07')).toBe(false);
      expect(validateIsoDate('not-a-date')).toBe(false);
    });
  });

  describe('Range Validation', () => {
    test('Should validate numeric ranges', () => {
      const validateAge = (age: number) => {
        if (age < 0 || age > 150) {
          throw new Error('Age must be between 0 and 150');
        }
        return true;
      };
      
      expect(() => validateAge(-5)).toThrow();
      expect(() => validateAge(200)).toThrow();
      expect(validateAge(25)).toBe(true);
      expect(validateAge(0)).toBe(true);
      expect(validateAge(150)).toBe(true);
    });

    test('Should validate string length', () => {
      const validateUsername = (username: string) => {
        if (username.length < 3 || username.length > 20) {
          throw new Error('Username must be between 3 and 20 characters');
        }
        return true;
      };
      
      expect(() => validateUsername('ab')).toThrow();
      expect(() => validateUsername('a'.repeat(21))).toThrow();
      expect(validateUsername('user123')).toBe(true);
    });

    test('Should validate array length', () => {
      const validateTags = (tags: string[]) => {
        if (!Array.isArray(tags) || tags.length === 0) {
          throw new Error('At least one tag is required');
        }
        if (tags.length > 5) {
          throw new Error('Maximum 5 tags allowed');
        }
        return true;
      };
      
      expect(() => validateTags([])).toThrow('At least one tag is required');
      expect(() => validateTags(['a', 'b', 'c', 'd', 'e', 'f'])).toThrow('Maximum 5 tags allowed');
      expect(validateTags(['tag1', 'tag2'])).toBe(true);
    });
  });
});
