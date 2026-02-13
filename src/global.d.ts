// Global type declarations for Express

declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: import("@prisma/client").UserRole;
      firstName: string;
      lastName: string;
    };
    oauthRole?: string;
  }
}
