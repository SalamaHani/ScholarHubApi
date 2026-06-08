import { Request, Response, NextFunction } from "express";
import { getDatabaseUrl, isUsingReadReplicas } from "../config/database.js";

/**
 * Query operation types
 */
export type QueryType = "read" | "write";

/**
 * Middleware to mark requests as read-only or write operations
 * Automatically detects based on HTTP method
 */
export function requestTypeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Determine operation type based on HTTP method
  const readMethods = ["GET", "HEAD", "OPTIONS"];
  const writeMethods = ["POST", "PUT", "PATCH", "DELETE"];

  if (readMethods.includes(req.method)) {
    (req as any).queryType = "read";
  } else if (writeMethods.includes(req.method)) {
    (req as any).queryType = "write";
  } else {
    (req as any).queryType = "write"; // Default to write for safety
  }

  next();
}

/**
 * Get the appropriate database endpoint for a request
 */
export function getRequestDatabaseUrl(req: Request): string {
  const queryType = (req as any).queryType || "write";
  return getDatabaseUrl(queryType);
}

/**
 * Utility class for managing database connections with read replicas
 */
export class DatabaseRouter {
  /**
   * Determine if a query is read-only based on SQL
   */
  static isReadQuery(sql: string): boolean {
    const readPatterns = [
      /^\s*SELECT/i,
      /^\s*EXPLAIN/i,
      /^\s*WITH.*SELECT/i,
      /^\s*\(/i, // Subquery
    ];

    const writePatterns = [
      /INSERT/i,
      /UPDATE/i,
      /DELETE/i,
      /TRUNCATE/i,
      /DROP/i,
      /ALTER/i,
      /CREATE/i,
    ];

    // Check for write operations first (they take precedence)
    if (writePatterns.some((pattern) => pattern.test(sql))) {
      return false;
    }

    // Check for read operations
    if (readPatterns.some((pattern) => pattern.test(sql))) {
      return true;
    }

    // Default to write for safety (transactions, stored procedures, etc.)
    return false;
  }

  /**
   * Get database endpoint based on query type
   */
  static getEndpoint(queryType: "read" | "write"): string {
    return getDatabaseUrl(queryType);
  }

  /**
   * Get endpoint for SQL query (auto-detect)
   */
  static getEndpointForQuery(sql: string): string {
    const isRead = this.isReadQuery(sql);
    return this.getEndpoint(isRead ? "read" : "write");
  }

  /**
   * Log query routing information
   */
  static logQueryRouting(sql: string, endpoint: string): void {
    const isRead = this.isReadQuery(sql);
    const operation = isRead ? "READ" : "WRITE";
    const shortSql = sql.substring(0, 60).replace(/\n/g, " ");

    console.log(
      `[DB-${operation}] ${endpoint.split("@")[1]?.split(":")[0]} - ${shortSql}...`,
    );
  }
}

/**
 * Health check for database endpoints
 */
export async function checkDatabaseHealth(): Promise<{
  primary: boolean;
  replica: boolean;
  using_replicas: boolean;
}> {
  const using_replicas = isUsingReadReplicas();

  // In a real scenario, you would make actual database connections
  // This is a placeholder implementation
  return {
    primary: true,
    replica: using_replicas,
    using_replicas,
  };
}

/**
 * Get database connection statistics
 */
export function getDatabaseStats() {
  return {
    writeEndpoint: getDatabaseUrl("write"),
    readEndpoint: getDatabaseUrl("read"),
    usingReadReplicas: isUsingReadReplicas(),
    timestamp: new Date().toISOString(),
  };
}
