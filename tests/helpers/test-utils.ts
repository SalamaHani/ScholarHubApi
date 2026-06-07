// Test setup file for API integration tests
import request from "supertest";
import http from "http";

// Helper function to create a test server
export function createTestServer(app: any): http.Server {
  return http.createServer(app);
}

// Helper function for API requests
export function createTestRequest(app: any) {
  return request(app);
}

// Helper function to test endpoints
export async function testEndpoint(
  app: any,
  method: "get" | "post" | "put" | "delete" | "patch",
  path: string,
  data?: any,
) {
  const req = request(app)[method](path);

  if (data) {
    return req.send(data);
  }

  return req;
}
