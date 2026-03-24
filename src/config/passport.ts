import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "./index.js";
import prisma from "../lib/prisma.js";
import { UserRole } from "@prisma/client";

/**
 * Configure Google OAuth Strategy (only if credentials are provided)
 */
if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: config.oauth.google.callbackUrl,
      scope: ["profile", "email"],
      passReqToCallback: true, // Allow access to req in callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";
        const avatar = profile.photos?.[0]?.value || null;

        // Validate required fields
        if (!email || !googleId) {
          return done(null, false, {
            message: "Missing required Google profile fields",
          });
        }

        // Get role from state (decoded in controller)
        const role = (req as any).oauthRole || UserRole.STUDENT;

        // Find existing user by Google ID
        let user = await prisma.user.findUnique({
          where: { googleId },
          include: {
            studentProfile: true,
            professorProfile: true,
          },
        });

        if (user) {
          // User exists with Google ID - update last login
          user = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
            include: {
              studentProfile: true,
              professorProfile: true,
            },
          });
          return done(null, user);
        }

        // Check if user exists with same email (account linking)
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: {
            studentProfile: true,
            professorProfile: true,
          },
        });

        if (existingUser) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              googleId,
              provider: "google",
              isEmailVerified: true, // Google emails are verified
              avatar: avatar || existingUser.avatar,
              lastLoginAt: new Date(),
            },
            include: {
              studentProfile: true,
              professorProfile: true,
            },
          });
          return done(null, user);
        }

        // Create new user
        const userData: any = {
          email,
          googleId,
          provider: "google",
          firstName,
          lastName,
          role,
          avatar,
          isEmailVerified: true, // Google emails are verified
          password: null, // OAuth users don't have password initially
          lastLoginAt: new Date(),
        };

        // Add profile based on role
        if (role === UserRole.STUDENT) {
          userData.studentProfile = { create: {} };
        } else if (role === UserRole.PROFESSOR) {
          userData.professorProfile = {
            create: {
              institution: "Not specified",
            },
          };
        }

        user = await prisma.user.create({
          data: userData,
          include: {
            studentProfile: true,
            professorProfile: true,
          },
        });

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error as Error, false);
      }
    }
  )
);
} // end if Google OAuth configured

/**
 * Serialize user for session (not used in JWT auth, but required by Passport)
 */
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session (not used in JWT auth, but required by Passport)
 */
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
