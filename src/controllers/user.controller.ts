import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import prisma from "../lib/prisma.js";
import {
  ApiError,
  asyncHandler,
  hashPassword,
  updateUserCompleteness,
  calculateAverageLanguageLevel,
} from "../utils/index.js";
import {
  createNotification,
  notifyProfileMilestones,
} from "../services/notification.helper.js";
import { sendProfileMilestoneEmail } from "../services/mail.service.js";

// Helper function to parse array fields that might come as strings or objects
const parseArrayField = (value: any): string[] | undefined => {
  if (!value) return undefined;

  // If it's already an array
  if (Array.isArray(value)) {
    // Check if it contains objects (like language objects)
    if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
      // Extract the name property from objects
      return value
        .map((item) => item.name || item.toString())
        .filter((item) => item);
    }
    // It's already an array of strings
    return value.filter((item) => item && typeof item === "string");
  }

  // If it's a string, try to parse it as JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        // Check if parsed array contains objects
        if (parsed.length > 0 && typeof parsed[0] === "object") {
          return parsed
            .map((item) => item.name || item.toString())
            .filter((item) => item);
        }
        return parsed.filter((item) => item && typeof item === "string");
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

// Helper function to parse language objects with proficiency levels
const parseLanguagesField = (
  value: any,
): Array<{ name: string; proficiency: number }> | undefined => {
  if (!value) return undefined;

  // If it's already an array
  if (Array.isArray(value)) {
    return value
      .filter((lang) => lang && typeof lang === "object" && lang.name)
      .map((lang) => ({
        name: lang.name,
        proficiency:
          typeof lang.proficiency === "number"
            ? Math.min(100, Math.max(0, lang.proficiency))
            : 60,
      }));
  }

  // If it's a string, try to parse it as JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((lang) => lang && typeof lang === "object" && lang.name)
          .map((lang) => ({
            name: lang.name,
            proficiency:
              typeof lang.proficiency === "number"
                ? Math.min(100, Math.max(0, lang.proficiency))
                : 60,
          }));
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

// Helper function to parse experience objects
const parseExperienceField = (value: any): any[] | undefined => {
  if (!value) return undefined;

  // If it's already an array
  if (Array.isArray(value)) {
    return value.filter((exp) => exp && typeof exp === "object");
  }

  // If it's a string, try to parse it as JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((exp) => exp && typeof exp === "object");
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

// Helper function to parse certifications objects
const parseCertificationsField = (value: any): any[] | undefined => {
  if (!value) return undefined;

  // If it's already an array
  if (Array.isArray(value)) {
    return value.filter((cert) => cert && typeof cert === "object");
  }

  // If it's a string, try to parse it as JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((cert) => cert && typeof cert === "object");
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      phone: true,
      isEmailVerified: true,
      createdAt: true,
      studentProfile: {
        select: {
          id: true,
          university: true,
          fieldOfStudy: true,
          currentDegree: true,
          gpa: true,
          graduationYear: true,
          country: true,
          city: true,
          zipCode: true,
          bio: true,
          languages: true,
          skills: true,
          experience: true,
          age: true,
          gender: true,
          phoneNumber: true,
          profileCompleteness: true,
          documents: true,
          certifications: true,
        },
      },
      professorProfile: {
        select: {
          id: true,
          institution: true,
          department: true,
          position: true,
          specialization: true,
          website: true,
          bio: true,
          languages: true,
          skills: true,
          experience: true,
          country: true,
          city: true,
          zipCode: true,
          phoneNumber: true,
          age: true,
          gender: true,
          isVerified: true,
          profileCompleteness: true,
          documents: true,
          certifications: true,
        },
      },
    },
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Get profile completeness
  let profileCompleteness = 0;
  if (user.role === "STUDENT" && user.studentProfile) {
    profileCompleteness = user.studentProfile.profileCompleteness;
  } else if (user.role === "PROFESSOR" && user.professorProfile) {
    profileCompleteness = user.professorProfile.profileCompleteness;
  }

  res.json({
    success: true,
    data: {
      user,
      avatar: user.avatar,
      documents:
        user.role === "STUDENT"
          ? user.studentProfile?.documents || []
          : user.professorProfile?.documents || [],
      profileCompleteness,
      progressMessage: `Profile is ${profileCompleteness}% complete`,
      progressStatus:
        profileCompleteness === 100
          ? "COMPLETE"
          : profileCompleteness >= 70
            ? "GOOD"
            : profileCompleteness >= 40
              ? "PARTIAL"
              : "INCOMPLETE",
    },
  });
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile data (name, phone, student/professor info)
 * @access  Private
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { firstName, lastName, phone, avatar, ...profileData } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Parse array fields
    if (profileData.languages) {
      profileData.languages = parseLanguagesField(profileData.languages);
    }
    if (profileData.skills) {
      profileData.skills = parseArrayField(profileData.skills);
    }
    if (profileData.experience) {
      profileData.experience = parseExperienceField(profileData.experience);
    }
    if (profileData.certifications) {
      profileData.certifications = parseCertificationsField(
        profileData.certifications,
      );
    }

    // Parse age if it's a string
    if (profileData.age !== undefined && profileData.age !== null) {
      profileData.age =
        typeof profileData.age === "string"
          ? parseInt(profileData.age)
          : profileData.age;
    }

    // Update base user fields
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
      },
    });

    // Update role-specific profile
    if (userRole === UserRole.STUDENT && Object.keys(profileData).length > 0) {
      await prisma.studentProfile.upsert({
        where: { userId },
        update: {
          university: profileData.university,
          fieldOfStudy: profileData.fieldOfStudy,
          currentDegree: profileData.currentDegree,
          gpa: profileData.gpa,
          graduationYear: profileData.graduationYear,
          country: profileData.country,
          city: profileData.city,
          zipCode: profileData.zipCode,
          bio: profileData.bio,
          languages: profileData.languages,
          skills: profileData.skills,
          age: profileData.age,
          gender: profileData.gender,
          phoneNumber: profileData.phoneNumber,
          certifications: profileData.certifications,
          experience: profileData.experience,
        },
        create: {
          userId,
          university: profileData.university,
          fieldOfStudy: profileData.fieldOfStudy,
          currentDegree: profileData.currentDegree,
          gpa: profileData.gpa,
          graduationYear: profileData.graduationYear,
          country: profileData.country,
          city: profileData.city,
          zipCode: profileData.zipCode,
          bio: profileData.bio,
          languages: profileData.languages,
          skills: profileData.skills,
          age: profileData.age,
          gender: profileData.gender,
          phoneNumber: profileData.phoneNumber,
          experience: profileData.experience,
          certifications: profileData.certifications,
        },
      });
    }

    if (
      userRole === UserRole.PROFESSOR &&
      Object.keys(profileData).length > 0
    ) {
      await (prisma.professorProfile as any).upsert({
        where: { userId },
        update: {
          institution: profileData.institution,
          department: profileData.department,
          position: profileData.position,
          specialization: profileData.specialization,
          website: profileData.website,
          bio: profileData.bio,
          skills: profileData.skills,
          languages: profileData.languages,
          country: profileData.country,
          city: profileData.city,
          zipCode: profileData.zipCode,
          phoneNumber: profileData.phoneNumber,
          experience: profileData.experience,
          certifications: profileData.certifications,
          age: profileData.age,
          gender: profileData.gender,
        },
        create: {
          userId,
          institution: profileData.institution || "Not specified",
          department: profileData.department,
          position: profileData.position,
          specialization: profileData.specialization,
          website: profileData.website,
          bio: profileData.bio,
          skills: profileData.skills,
          languages: profileData.languages,
          country: profileData.country,
          city: profileData.city,
          zipCode: profileData.zipCode,
          phoneNumber: profileData.phoneNumber,
          experience: profileData.experience,
          certifications: profileData.certifications,
          age: profileData.age,
          gender: profileData.gender,
        },
      });
    }

    // Always update completeness if anything changed
    const { previous, current } = await updateUserCompleteness(userId, userRole);

    // Notify user of profile update
    try {
      await createNotification([userId], {
        title: "Profile Updated",
        message: "Your profile has been updated successfully.",
        type: "profile_update",
        link: "/profile",
      });

      // Check for milestone achievements
      await notifyProfileMilestones(userId, previous, current, userRole, async (uid, milestone) => {
        const user = await prisma.user.findUnique({ where: { id: uid } });
        if (user) {
          await sendProfileMilestoneEmail(
            user.email,
            `${user.firstName} ${user.lastName}`,
            milestone,
            userRole
          );
        }
      });
    } catch (error) {
      console.error("Failed to send profile update notifications:", error);
    }

    // Fetch updated profile
    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        studentProfile: {
          select: {
            id: true,
            university: true,
            fieldOfStudy: true,
            currentDegree: true,
            gpa: true,
            graduationYear: true,
            country: true,
            city: true,
            zipCode: true,
            bio: true,
            languages: true,
            skills: true,
            experience: true,
            age: true,
            gender: true,
            phoneNumber: true,
            profileCompleteness: true,
            documents: true,
            certifications: true,
          },
        },
        professorProfile: {
          select: {
            id: true,
            institution: true,
            department: true,
            position: true,
            specialization: true,
            website: true,
            bio: true,
            languages: true,
            skills: true,
            experience: true,
            country: true,
            city: true,
            zipCode: true,
            phoneNumber: true,
            age: true,
            gender: true,
            isVerified: true,
            profileCompleteness: true,
            documents: true,
            certifications: true,
          },
        },
      },
    });

    // Get profile completeness
    let profileCompleteness = 0;
    if (userRole === UserRole.STUDENT && fullUser?.studentProfile) {
      profileCompleteness = fullUser.studentProfile.profileCompleteness;
    } else if (userRole === UserRole.PROFESSOR && fullUser?.professorProfile) {
      profileCompleteness = fullUser.professorProfile.profileCompleteness;
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: fullUser,
        avatar: fullUser?.avatar,
        documents:
          userRole === UserRole.STUDENT
            ? fullUser?.studentProfile?.documents || []
            : fullUser?.professorProfile?.documents || [],
        profileCompleteness,
        progressMessage: `Profile is ${profileCompleteness}% complete`,
        progressStatus:
          profileCompleteness === 100
            ? "COMPLETE"
            : profileCompleteness >= 70
              ? "GOOD"
              : profileCompleteness >= 40
                ? "PARTIAL"
                : "INCOMPLETE",
      },
    });
  },
);

/**
 * @route   PUT /api/users/avatar
 * @desc    Upload user avatar image
 * @access  Private
 */
export const uploadProfileAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check if file was uploaded or if avatar URL was provided in body
    let avatarPath = req.body.avatar;

    if (req.file) {
      avatarPath = `/uploads/avatars/${req.file.filename}`;
    }

    if (!avatarPath) {
      throw ApiError.badRequest(
        "No image file or avatar URL provided. Please upload an image with the key 'avatar' or provide an 'avatar' URL string in the request body.",
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
      },
    });

    // Update profile completeness after avatar upload
    const { previous, current } = await updateUserCompleteness(userId, userRole);

    // Notify user and check milestones
    try {
      await createNotification([userId], {
        title: "Avatar Updated",
        message: "Your profile avatar has been updated successfully.",
        type: "profile_update",
        link: "/profile",
      });

      await notifyProfileMilestones(userId, previous, current, userRole, async (uid, milestone) => {
        const user = await prisma.user.findUnique({ where: { id: uid } });
        if (user) {
          await sendProfileMilestoneEmail(
            user.email,
            `${user.firstName} ${user.lastName}`,
            milestone,
            userRole
          );
        }
      });
    } catch (error) {
      console.error("Failed to send avatar update notifications:", error);
    }

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        user,
        avatar: user.avatar,
      },
    });
  },
);

/**
 * @route   POST /api/users/profile/documents
 * @desc    Upload profile document
 * @access  Private
 */
export const uploadProfileDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!req.file) {
      throw ApiError.badRequest("No document file provided");
    }

    const documentPath = `/uploads/documents/${req.file.filename}`;

    if (userRole === "STUDENT") {
      let studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
      });

      // Create empty profile if it doesn't exist
      if (!studentProfile) {
        studentProfile = await prisma.studentProfile.create({
          data: {
            userId,
            documents: [documentPath],
          },
        });
      } else {
        studentProfile = await prisma.studentProfile.update({
          where: { userId },
          data: {
            documents: [...(studentProfile.documents || []), documentPath],
          },
        });
      }

      // Update profile completeness
      const { current: profileCompleteness } = await updateUserCompleteness(
        userId,
        userRole,
      );

      return res.json({
        success: true,
        message: "Document uploaded successfully",
        data: {
          profile: studentProfile,
          documents: studentProfile.documents,
          profileCompleteness,
          progressMessage: `Profile is ${profileCompleteness}% complete`,
          progressStatus:
            profileCompleteness === 100
              ? "COMPLETE"
              : profileCompleteness >= 70
                ? "GOOD"
                : profileCompleteness >= 40
                  ? "PARTIAL"
                  : "INCOMPLETE",
          documentUrl: documentPath,
        },
      });
    } else if (userRole === "PROFESSOR") {
      let professorProfile = await prisma.professorProfile.findUnique({
        where: { userId },
      });

      // Create empty profile if it doesn't exist
      if (!professorProfile) {
        professorProfile = await prisma.professorProfile.create({
          data: {
            userId,
            institution: "",
            documents: [documentPath],
          },
        });
      } else {
        professorProfile = await prisma.professorProfile.update({
          where: { userId },
          data: {
            documents: [...(professorProfile.documents || []), documentPath],
          },
        });
      }

      // Update profile completeness
      const { current: profileCompleteness } = await updateUserCompleteness(
        userId,
        userRole,
      );

      return res.json({
        success: true,
        message: "Document uploaded successfully",
        data: {
          profile: professorProfile,
          documents: professorProfile.documents,
          profileCompleteness,
          progressMessage: `Profile is ${profileCompleteness}% complete`,
          progressStatus:
            profileCompleteness === 100
              ? "COMPLETE"
              : profileCompleteness >= 70
                ? "GOOD"
                : profileCompleteness >= 40
                  ? "PARTIAL"
                  : "INCOMPLETE",
          documentUrl: documentPath,
        },
      });
    }

    throw ApiError.badRequest("Invalid user role");
  },
);

/**
 * @route   DELETE /api/users/profile/documents/:documentUrl
 * @desc    Delete profile document
 * @access  Private
 */
export const deleteProfileDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { documentUrl } = req.body;

    if (!documentUrl) {
      throw ApiError.badRequest("Document URL is required");
    }

    if (userRole === "STUDENT") {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      if (!studentProfile) {
        throw ApiError.notFound("Student profile not found");
      }

      const updatedProfile = await prisma.studentProfile.update({
        where: { userId },
        data: {
          documents: studentProfile.documents.filter(
            (doc) => doc !== documentUrl,
          ),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      const profileCompleteness = await updateUserCompleteness(
        userId,
        userRole,
      );

      return res.json({
        success: true,
        message: "Document deleted successfully",
        data: {
          profile: updatedProfile,
          documents: updatedProfile.documents,
          profileCompleteness,
          progressMessage: `Profile is ${profileCompleteness}% complete`,
          progressStatus:
            profileCompleteness === 100
              ? "COMPLETE"
              : profileCompleteness >= 70
                ? "GOOD"
                : profileCompleteness >= 40
                  ? "PARTIAL"
                  : "INCOMPLETE",
        },
      });
    } else if (userRole === "PROFESSOR") {
      const professorProfile = await prisma.professorProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      if (!professorProfile) {
        throw ApiError.notFound("Professor profile not found");
      }

      const updatedProfile = await prisma.professorProfile.update({
        where: { userId },
        data: {
          documents: professorProfile.documents.filter(
            (doc) => doc !== documentUrl,
          ),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      const profileCompleteness = await updateUserCompleteness(
        userId,
        userRole,
      );

      return res.json({
        success: true,
        message: "Document deleted successfully",
        data: {
          profile: updatedProfile,
          documents: updatedProfile.documents,
          profileCompleteness,
          progressMessage: `Profile is ${profileCompleteness}% complete`,
          progressStatus:
            profileCompleteness === 100
              ? "COMPLETE"
              : profileCompleteness >= 70
                ? "GOOD"
                : profileCompleteness >= 40
                  ? "PARTIAL"
                  : "INCOMPLETE",
        },
      });
    }

    throw ApiError.badRequest("Invalid user role");
  },
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      throw ApiError.badRequest(
        "This account was created using OAuth. Please set a password first."
      );
    }

    // Verify current password
    const bcrypt = await import("bcryptjs");
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      throw ApiError.badRequest("Current password is incorrect");
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  },
);

// ==================== ADMIN USER MANAGEMENT ====================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, role, search, isBlocked } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (role) {
    where.role = role as UserRole;
  }

  if (isBlocked !== undefined) {
    where.isBlocked = isBlocked === "true";
  }

  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: "insensitive" } },
      { firstName: { contains: search as string, mode: "insensitive" } },
      { lastName: { contains: search as string, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        lastLoginAt: true,
        professorProfile: {
          select: {
            id: true,
            institution: true,
            department: true,
            position: true,
            specialization: true,
            bio: true,
            languages: true,
            skills: true,
            experience: true,
            certifications: true,
            country: true,
            city: true,
            age: true,
            gender: true,
            phoneNumber: true,
            isVerified: true,
            documents: true,
          },
        },
        studentProfile: {
          select: {
            id: true,
            university: true,
            fieldOfStudy: true,
            currentDegree: true,
            gpa: true,
            graduationYear: true,
            country: true,
            city: true,
            bio: true,
            languages: true,
            skills: true,
            experience: true,
            certifications: true,
            age: true,
            gender: true,
            phoneNumber: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      phone: true,
      isEmailVerified: true,
      isBlocked: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
      studentProfile: true,
      professorProfile: true,
      _count: {
        select: {
          applications: true,
          scholarships: true,
          savedScholarships: true,
        },
      },
    },
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * @route   PUT /api/admin/users/:id/block
 * @desc    Block/Unblock a user (Admin only)
 * @access  Private/Admin
 */
export const toggleBlockUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { blocked } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.role === UserRole.ADMIN) {
      throw ApiError.forbidden("Cannot block admin users");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked: blocked },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isBlocked: true,
      },
    });

    // If blocking, invalidate all refresh tokens
    if (blocked) {
      await prisma.refreshToken.deleteMany({
        where: { userId: id },
      });
    }

    res.json({
      success: true,
      message: blocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      data: { user: updatedUser },
    });
  },
);

/**
 * @route   PUT /api/admin/users/:id/verify-professor
 * @desc    Verify professor account (Admin only) and auto-approve pending scholarships
 * @access  Private/Admin
 */
export const verifyProfessor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { professorProfile: true },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.role !== UserRole.PROFESSOR) {
      throw ApiError.badRequest("User is not a professor");
    }

    if (!user.professorProfile) {
      throw ApiError.badRequest("Professor profile not found");
    }

    // Verify professor account
    await prisma.professorProfile.update({
      where: { userId: id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: req.user!.id,
      },
    });

    // Auto-approve all pending scholarships from this professor
    const updatedScholarships = await prisma.scholarship.updateMany({
      where: {
        createdById: id,
        status: "PENDING_APPROVAL",
      },
      data: {
        status: "APPROVED",
        approvedById: req.user!.id,
        approvedAt: new Date(),
      },
    });

    // Create notification for professor
    await prisma.notification.create({
      data: {
        userId: id,
        title: "Account Verified",
        message: `Your professor account has been verified. ${updatedScholarships.count} pending scholarship(s) have been auto-approved.`,
        type: "system",
      },
    });

    res.json({
      success: true,
      message: "Professor verified successfully",
      data: {
        verifiedAt: new Date(),
        scholarshipsAutoApproved: updatedScholarships.count,
      },
    });
  },
);

/**
 * @route   PUT /api/users/:id/change-role
 * @desc    Change user role (Admin only) with profile migration
 * @access  Private/Admin
 */
export const changeUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !Object.values(UserRole).includes(role)) {
      throw ApiError.badRequest("Invalid role provided");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true, professorProfile: true },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Prevent changing admin role to other roles
    if (user.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
      throw ApiError.forbidden(
        "Cannot change role of an admin user to a different role",
      );
    }

    // Prevent changing to admin role
    if (role === UserRole.ADMIN) {
      throw ApiError.forbidden("Cannot change user role to admin");
    }

    // Handle profile migration when changing from STUDENT to PROFESSOR
    if (user.role === UserRole.STUDENT && role === UserRole.PROFESSOR) {
      const sp = user.studentProfile as any;
      await (prisma.professorProfile as any).upsert({
        where: { userId: id },
        update: {
          institution: sp?.university || "Not specified",
          department: sp?.fieldOfStudy,
          bio: sp?.bio,
          skills: sp?.skills,
          languages: sp?.languages,
          country: sp?.country,
          city: sp?.city,
          zipCode: sp?.zipCode,
          phoneNumber: sp?.phoneNumber,
          experience: sp?.experience,
          age: sp?.age,
          gender: sp?.gender,
        },
        create: {
          userId: id,
          institution: sp?.university || "Not specified",
          department: sp?.fieldOfStudy,
          bio: sp?.bio,
          skills: sp?.skills || [],
          languages: sp?.languages || [],
          country: sp?.country,
          city: sp?.city,
          zipCode: sp?.zipCode,
          phoneNumber: sp?.phoneNumber,
          experience: sp?.experience || [],
          age: sp?.age,
          gender: sp?.gender,
        },
      });
    }

    // Handle profile migration when changing from PROFESSOR to STUDENT
    if (user.role === UserRole.PROFESSOR && role === UserRole.STUDENT) {
      const pp = user.professorProfile as any;
      await (prisma.studentProfile as any).upsert({
        where: { userId: id },
        update: {
          university: pp?.institution,
          fieldOfStudy: pp?.department,
          bio: pp?.bio,
          skills: pp?.skills,
          languages: pp?.languages,
          country: pp?.country,
          city: pp?.city,
          zipCode: pp?.zipCode,
          phoneNumber: pp?.phoneNumber,
          experience: pp?.experience,
          age: pp?.age,
          gender: pp?.gender,
        },
        create: {
          userId: id,
          university: pp?.institution,
          fieldOfStudy: pp?.department,
          bio: pp?.bio,
          skills: pp?.skills || [],
          languages: pp?.languages || [],
          country: pp?.country,
          city: pp?.city,
          zipCode: pp?.zipCode,
          phoneNumber: pp?.phoneNumber,
          experience: pp?.experience || [],
          age: pp?.age,
          gender: pp?.gender,
        },
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Create notification for user about role change
    await prisma.notification.create({
      data: {
        userId: id,
        title: "Role Changed",
        message: `Your role has been changed to ${role}`,
        type: "system",
      },
    });

    res.json({
      success: true,
      message: "User role changed successfully",
      data: { user: updatedUser },
    });
  },
);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update any user data and profile (Admin only)
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    phone,
    role,
    avatar,
    isBlocked,
    isEmailVerified,
    ...profileData
  } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { id },
    include: { studentProfile: true, professorProfile: true },
  });

  if (!existingUser) {
    throw ApiError.notFound("User not found");
  }

  // Update base user fields
  const updateData: any = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (isBlocked !== undefined) updateData.isBlocked = isBlocked;
  if (isEmailVerified !== undefined)
    updateData.isEmailVerified = isEmailVerified;

  // Handle role change if requested
  if (role !== undefined && role !== existingUser.role) {
    // Reuse change logic if needed, but for simplicity we'll just update here
    // or we could throw an error asking to use the dedicated change-role endpoint
    // but usually admin update can do everything
    updateData.role = role;
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      phone: true,
      isBlocked: true,
      isEmailVerified: true,
    },
  });

  // Handle role-specific profile updates
  const userRole = role || user.role;

  // Parse array fields if they exist in profileData
  if (profileData.languages)
    profileData.languages = parseLanguagesField(profileData.languages);
  if (profileData.skills)
    profileData.skills = parseArrayField(profileData.skills);
  if (profileData.experience)
    profileData.experience = parseExperienceField(profileData.experience);
  if (profileData.age !== undefined && profileData.age !== null) {
    profileData.age =
      typeof profileData.age === "string"
        ? parseInt(profileData.age)
        : profileData.age;
  }

  if (userRole === UserRole.STUDENT) {
    await (prisma.studentProfile as any).upsert({
      where: { userId: id },
      update: {
        university: profileData.university,
        fieldOfStudy: profileData.fieldOfStudy,
        currentDegree: profileData.currentDegree,
        gpa: profileData.gpa,
        graduationYear: profileData.graduationYear,
        country: profileData.country,
        city: profileData.city,
        zipCode: profileData.zipCode,
        bio: profileData.bio,
        languages: profileData.languages,
        skills: profileData.skills,
        age: profileData.age,
        gender: profileData.gender,
        phoneNumber: profileData.phoneNumber,
        experience: profileData.experience,
      },
      create: {
        userId: id,
        university: profileData.university || "Not specified",
        fieldOfStudy: profileData.fieldOfStudy,
        currentDegree: profileData.currentDegree,
        gpa: profileData.gpa,
        graduationYear: profileData.graduationYear,
        country: profileData.country,
        city: profileData.city,
        zipCode: profileData.zipCode,
        bio: profileData.bio,
        languages: profileData.languages || [],
        skills: profileData.skills || [],
        age: profileData.age,
        gender: profileData.gender,
        phoneNumber: profileData.phoneNumber,
        experience: profileData.experience || [],
      },
    });
  } else if (userRole === UserRole.PROFESSOR) {
    await (prisma.professorProfile as any).upsert({
      where: { userId: id },
      update: {
        institution: profileData.institution,
        department: profileData.department,
        position: profileData.position,
        specialization: profileData.specialization,
        website: profileData.website,
        bio: profileData.bio,
        skills: profileData.skills,
        languages: profileData.languages,
        country: profileData.country,
        city: profileData.city,
        zipCode: profileData.zipCode,
        phoneNumber: profileData.phoneNumber,
        experience: profileData.experience,
        age: profileData.age,
        gender: profileData.gender,
      },
      create: {
        userId: id,
        institution: profileData.institution || "Not specified",
        department: profileData.department,
        position: profileData.position,
        specialization: profileData.specialization,
        website: profileData.website,
        bio: profileData.bio,
        skills: profileData.skills || [],
        languages: profileData.languages || [],
        country: profileData.country,
        city: profileData.city,
        zipCode: profileData.zipCode,
        phoneNumber: profileData.phoneNumber,
        experience: profileData.experience || [],
        age: profileData.age,
        gender: profileData.gender,
      },
    });
  }

  // Update profile completeness
  await updateUserCompleteness(id, userRole); // Returns {previous, current} but not used here

  res.json({
    success: true,
    message: "User updated successfully",
    data: { user },
  });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (Admin only)
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (user.role === UserRole.ADMIN) {
    throw ApiError.forbidden("Cannot delete admin users");
  }

  // Delete the user (cascade will handle profiles)
  await prisma.user.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: "User and associated profile deleted successfully",
  });
});

/**
 * @route   PUT /api/users/profile/student
 * @desc    Update student profile information
 * @access  Private (Students only)
 */
export const updateStudentProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== UserRole.STUDENT) {
      throw ApiError.forbidden("Only students can update student profile");
    }

    const {
      university,
      fieldOfStudy,
      currentDegree,
      gpa,
      graduationYear,
      country,
      city,
      zipCode,
      bio,
      languages,
      skills,
      age,
      gender,
      phoneNumber,
      experience,
    } = req.body;

    // Validate graduation year
    if (graduationYear && (graduationYear < 2026 || graduationYear > 2035)) {
      throw ApiError.badRequest("Invalid graduation year");
    }

    // Validate GPA
    if (gpa && (gpa < 0 || gpa > 4.0)) {
      throw ApiError.badRequest("GPA must be between 0 and 4.0");
    }

    // Validate age
    if (age && (age < 16 || age > 100)) {
      throw ApiError.badRequest("Age must be between 16 and 100");
    }

    // Parse array fields
    const parsedLanguages = parseLanguagesField(languages);
    const parsedSkills = parseArrayField(skills);
    const parsedExperience = parseExperienceField(experience);

    const studentProfile = await prisma.studentProfile.update({
      where: { userId },
      data: {
        university: university || undefined,
        fieldOfStudy: fieldOfStudy || undefined,
        currentDegree: currentDegree || undefined,
        gpa: gpa || undefined,
        graduationYear: graduationYear || undefined,
        country: country || undefined,
        city: city || undefined,
        zipCode: zipCode || undefined,
        bio: bio || undefined,
        languages: parsedLanguages || undefined,
        skills: parsedSkills || undefined,
        age: age || undefined,
        gender: gender || undefined,
        phoneNumber: phoneNumber || undefined,
        experience: parsedExperience || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Calculate and update profile completeness and language level
    const profileCompleteness = await updateUserCompleteness(userId, userRole);

    // Fetch final updated profile for response
    const finalProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            phone: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Student profile updated successfully",
      data: {
        ...finalProfile,
        progressMessage: `Profile is ${profileCompleteness}% complete`,
      },
    });
  },
);

/**
 * @route   PUT /api/users/profile/professor
 * @desc    Update professor profile information
 * @access  Private (Professors only)
 */
export const updateProfessorProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== UserRole.PROFESSOR) {
      throw ApiError.forbidden("Only professors can update professor profile");
    }

    const {
      institution,
      department,
      position,
      specialization,
      website,
      bio,
      skills,
      languages,
      country,
      city,
      zipCode,
      phoneNumber,
      experience,
      age,
      gender,
    } = req.body;

    // Parse array fields
    const parsedSkills = parseArrayField(skills);
    const parsedLanguages = parseLanguagesField(languages);
    const parsedExperience = parseExperienceField(experience);

    const professorProfile = await (prisma.professorProfile as any).update({
      where: { userId },
      data: {
        institution: institution || undefined,
        department: department || undefined,
        position: position || undefined,
        specialization: specialization || undefined,
        website: website || undefined,
        bio: bio || undefined,
        skills: parsedSkills || undefined,
        languages: parsedLanguages || undefined,
        country: country || undefined,
        city: city || undefined,
        zipCode: zipCode || undefined,
        phoneNumber: phoneNumber || undefined,
        experience: parsedExperience || undefined,
        age: age ? (typeof age === "string" ? parseInt(age) : age) : undefined,
        gender: gender || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Calculate and update profile completeness and language level
    const profileCompleteness = await updateUserCompleteness(userId, userRole);

    // Fetch final updated profile for response
    const finalProfile = await prisma.professorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            phone: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Professor profile updated successfully",
      data: {
        ...finalProfile,
        progressMessage: `Profile is ${profileCompleteness}% complete`,
      },
    });
  },
);

/**
 * @route   GET /api/users/profile/student
 * @desc    Get complete student profile with documents
 * @access  Private (Students)
 */
export const getStudentProfileDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    let studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    if (!studentProfile) {
      // Create empty profile if it doesn't exist
      studentProfile = await prisma.studentProfile.create({
        data: {
          userId,
          documents: [],
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              phone: true,
              avatar: true,
              createdAt: true,
            },
          },
        },
      });
    }

    // Recalculate completeness to ensure it's always up to date
    const profileCompleteness = await updateUserCompleteness(userId, "STUDENT");

    // Re-fetch to get updated state
    const updatedStudentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...updatedStudentProfile,
        profileCompleteness,
        progressMessage: `Profile is ${profileCompleteness}% complete`,
        progressStatus:
          profileCompleteness === 100
            ? "COMPLETE"
            : profileCompleteness >= 70
              ? "GOOD"
              : profileCompleteness >= 40
                ? "PARTIAL"
                : "INCOMPLETE",
      },
    });
  },
);

/**
 * @route   GET /api/users/profile/professor
 * @desc    Get complete professor profile with documents
 * @access  Private (Professors)
 */
export const getProfessorProfileDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    let professorProfile = await prisma.professorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    if (!professorProfile) {
      // Create empty profile if it doesn't exist
      professorProfile = await prisma.professorProfile.create({
        data: {
          userId,
          institution: "",
          documents: [],
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              phone: true,
              avatar: true,
              createdAt: true,
            },
          },
        },
      });
    }

    // Recalculate completeness to ensure it's always up to date
    const profileCompleteness = await updateUserCompleteness(
      userId,
      "PROFESSOR",
    );

    // Re-fetch to get updated state
    const updatedProfessorProfile = await prisma.professorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...updatedProfessorProfile,
        profileCompleteness,
        progressMessage: `Profile is ${profileCompleteness}% complete`,
        progressStatus:
          profileCompleteness === 100
            ? "COMPLETE"
            : profileCompleteness >= 70
              ? "GOOD"
              : profileCompleteness >= 40
                ? "PARTIAL"
                : "INCOMPLETE",
      },
    });
  },
);
