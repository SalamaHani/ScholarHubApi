import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface Config {
  env: string;
  port: number;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  frontendUrl: string;
  resend: {
    apiKey: string;
    from: string;
  };
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
    };
    stateSecret: string;
  };
  pusher: {
    appId: string;
    key: string;
    secret: string;
    cluster: string;
  };
  storage: {
    key: string;
    secret: string;
    bucket: string;
    region: string;
    cdnUrl: string;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8080", 10),
  jwtSecret: process.env.JWT_SECRET || "default-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  resend: {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.FROM_EMAIL || "ScholarHub <noreply@scholarhub.com>",
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:8080/api/auth/google/callback",
    },
    stateSecret:
      process.env.OAUTH_STATE_SECRET || "default-oauth-state-secret-change-me",
  },
  pusher: {
    appId: process.env.PUSHER_APP_ID || "",
    key: process.env.PUSHER_KEY || "",
    secret: process.env.PUSHER_SECRET || "",
    cluster: process.env.PUSHER_CLUSTER || "mt1",
  },
  storage: {
    key: process.env.AWS_ACCESS_KEY_ID || "",
    secret: process.env.AWS_SECRET_ACCESS_KEY || "",
    bucket: process.env.AWS_S3_BUCKET || "",
    region: process.env.AWS_S3_REGION || "us-east-1",
    cdnUrl: process.env.AWS_S3_CDN_URL || "",
  },
};

export default config;
