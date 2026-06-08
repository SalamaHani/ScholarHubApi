import dotenv from "dotenv";

dotenv.config();

interface DatabaseConfig {
  // Write endpoint (primary database)
  writeUrl: string;
  
  // Read endpoint (replica database)
  readUrl: string;
  
  // Connection pool settings
  connectionLimit: number;
  connectionTimeout: number;
  idleTimeout: number;
  reapInterval: number;
  
  // SSL settings
  sslEnabled: boolean;
  sslRejectUnauthorized: boolean;
}

/**
 * Database configuration for AWS RDS with read replicas
 * Write operations go to primary endpoint
 * Read operations go to read replica endpoint
 */
const databaseConfig: DatabaseConfig = {
  // Primary database endpoint (for writes)
  writeUrl: process.env.DATABASE_URL || "",
  
  // Read replica endpoint (for reads)
  readUrl: process.env.DATABASE_READ_URL || process.env.DATABASE_URL || "",
  
  // Connection pool configuration
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10"),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || "10000"), // 10 seconds
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"), // 30 seconds
  reapInterval: parseInt(process.env.DB_REAP_INTERVAL || "5000"), // 5 seconds
  
  // SSL/TLS configuration for AWS RDS
  sslEnabled: process.env.DB_SSL_ENABLED !== "false",
  sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
};

/**
 * Validate database configuration
 */
function validateDatabaseConfig(): void {
  if (!databaseConfig.writeUrl || databaseConfig.writeUrl.trim() === "") {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set");
    console.error("   This is required for database connections");
    console.error("");
    console.error("📋 How to fix:");
    console.error("   1. Create a .env file in project root");
    console.error("   2. Add: DATABASE_URL=postgresql://username:password@host:5432/database?schema=public");
    console.error("   3. Replace credentials with your actual RDS credentials");
    console.error("");
    console.error("📚 See DATABASE_AUTH.md for detailed instructions");
    
    throw new Error(
      "DATABASE_URL environment variable is required. See DATABASE_AUTH.md for setup instructions."
    );
  }
  
  // Validate connection string format
  if (!databaseConfig.writeUrl.startsWith("postgresql://")) {
    console.error("❌ ERROR: DATABASE_URL must be a valid PostgreSQL connection string");
    console.error(`   Got: ${maskPassword(databaseConfig.writeUrl)}`);
    console.error("   Expected format: postgresql://username:password@host:5432/database?schema=public");
    
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection string");
  }
  
  // Check for common issues
  if (databaseConfig.writeUrl.includes("YOUR_PASSWORD")) {
    console.error("❌ ERROR: DATABASE_URL contains placeholder 'YOUR_PASSWORD'");
    console.error("   Replace with your actual RDS password");
    
    throw new Error("DATABASE_URL contains placeholder credentials");
  }
  
  if (!databaseConfig.readUrl || databaseConfig.readUrl.trim() === "") {
    console.warn("⚠️  WARNING: DATABASE_READ_URL not set");
    console.warn("   Using DATABASE_URL for both read and write operations");
    databaseConfig.readUrl = databaseConfig.writeUrl;
  }
  
  console.log("✓ Database configuration loaded successfully");
  console.log(`  Primary endpoint: ${extractHostname(databaseConfig.writeUrl)}`);
  console.log(`  Read replica endpoint: ${extractHostname(databaseConfig.readUrl)}`);
}

/**
 * Extract hostname from database URL for logging (without credentials)
 */
function extractHostname(url: string): string {
  try {
    const match = url.match(/@([^:/?]+)/);
    return match ? match[1] : "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Mask password in connection string for logging
 */
function maskPassword(url: string): string {
  try {
    return url.replace(/:([^@]+)@/, ":***@");
  } catch {
    return url;
  }
}

/**
 * Get appropriate database URL based on operation type
 * @param operationType - "read" or "write"
 * @returns Database URL for the operation
 */
export function getDatabaseUrl(operationType: "read" | "write" = "write"): string {
  return operationType === "read" ? databaseConfig.readUrl : databaseConfig.writeUrl;
}

/**
 * Check if using read replicas (separate endpoints)
 */
export function isUsingReadReplicas(): boolean {
  return databaseConfig.writeUrl !== databaseConfig.readUrl;
}

/**
 * Get full database configuration
 */
export function getConfig(): DatabaseConfig {
  return databaseConfig;
}

// Validate on module load
validateDatabaseConfig();

export default databaseConfig;
