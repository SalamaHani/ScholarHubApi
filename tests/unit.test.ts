/**
 * Unit Tests - Utilities
 * Tests for helper functions and utilities
 */

describe('Utility Functions Tests', () => {
  describe('String Utilities', () => {
    test('Should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('valid@email.com')).toBe(true);
      expect(emailRegex.test('invalid.email')).toBe(false);
      expect(emailRegex.test('user@domain.co.uk')).toBe(true);
      expect(emailRegex.test('')).toBe(false);
    });

    test('Should validate URL format', () => {
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      
      expect(urlRegex.test('https://example.com')).toBe(true);
      expect(urlRegex.test('example.com')).toBe(true);
      expect(urlRegex.test('not a url')).toBe(false);
    });

    test('Should trim whitespace correctly', () => {
      const input = '  hello world  ';
      const result = input.trim();
      
      expect(result).toBe('hello world');
      expect(result.length).toBe(11);
      expect(result.startsWith(' ')).toBe(false);
      expect(result.endsWith(' ')).toBe(false);
    });

    test('Should convert strings to uppercase', () => {
      const input = 'lowercase text';
      const result = input.toUpperCase();
      
      expect(result).toBe('LOWERCASE TEXT');
      expect(result).not.toBe('lowercase text');
      expect(typeof result).toBe('string');
    });
  });

  describe('Number Utilities', () => {
    test('Should round numbers correctly', () => {
      expect(Math.round(4.5)).toBe(5);
      expect(Math.round(4.4)).toBe(4);
      expect(Math.round(0.5)).toBe(1);
      expect(Math.round(-1.5)).toBe(-1);
    });

    test('Should validate number ranges', () => {
      const isInRange = (num: number, min: number, max: number) => 
        num >= min && num <= max;
      
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(10, 1, 10)).toBe(true);
      expect(isInRange(11, 1, 10)).toBe(false);
    });

    test('Should perform calculations accurately', () => {
      const result = 0.1 + 0.2;
      // Note: JavaScript floating point precision
      expect(Math.abs(result - 0.3) < 0.0001).toBe(true);
      expect(10 * 5).toBe(50);
      expect(100 / 4).toBe(25);
    });
  });

  describe('Array Utilities', () => {
    test('Should filter array correctly', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = arr.filter(n => n > 2);
      
      expect(result).toEqual([3, 4, 5]);
      expect(result.length).toBe(3);
      expect(result).not.toContain(1);
      expect(result).not.toContain(2);
    });

    test('Should map array values', () => {
      const arr = [1, 2, 3];
      const result = arr.map(n => n * 2);
      
      expect(result).toEqual([2, 4, 6]);
      expect(result.length).toBe(3);
      expect(result[0]).toBe(2);
    });

    test('Should find element in array', () => {
      const arr = ['apple', 'banana', 'cherry'];
      const result = arr.find(item => item === 'banana');
      
      expect(result).toBe('banana');
      expect(result).toBeDefined();
      expect(arr).toContain('banana');
    });

    test('Should check if array includes element', () => {
      const arr = [10, 20, 30, 40];
      
      expect(arr.includes(20)).toBe(true);
      expect(arr.includes(50)).toBe(false);
      expect(arr.indexOf(30)).not.toBe(-1);
    });
  });

  describe('Object Utilities', () => {
    test('Should merge objects correctly', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const result = { ...obj1, ...obj2 };
      
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
      expect(result.a).toBe(1);
      expect(result.b).toBe(3);
      expect(result.c).toBe(4);
    });

    test('Should check object properties', () => {
      const obj = { name: 'John', age: 30 };
      
      expect('name' in obj).toBe(true);
      expect('email' in obj).toBe(false);
      expect(obj.hasOwnProperty('age')).toBe(true);
      expect(obj.hasOwnProperty('address')).toBe(false);
    });

    test('Should get object keys and values', () => {
      const obj = { id: 1, name: 'Test', active: true };
      const keys = Object.keys(obj);
      const values = Object.values(obj);
      
      expect(keys).toEqual(['id', 'name', 'active']);
      expect(keys.length).toBe(3);
      expect(values).toContain(1);
      expect(values).toContain('Test');
      expect(values).toContain(true);
    });
  });

  describe('Date Utilities', () => {
    test('Should validate date objects', () => {
      const validDate = new Date('2026-06-07');
      const invalidDate = new Date('invalid');
      
      expect(validDate instanceof Date).toBe(true);
      expect(invalidDate instanceof Date).toBe(true);
      expect(isNaN(validDate.getTime())).toBe(false);
      expect(isNaN(invalidDate.getTime())).toBe(true);
    });

    test('Should format dates correctly', () => {
      const date = new Date('2026-06-07');
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      expect(year).toBe(2026);
      expect(month).toBe(6);
      expect(day).toBe(7);
    });

    test('Should compare dates', () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-12-31');
      
      expect(date1 < date2).toBe(true);
      expect(date1 > date2).toBe(false);
      expect(date1.getTime() < date2.getTime()).toBe(true);
    });
  });
});
