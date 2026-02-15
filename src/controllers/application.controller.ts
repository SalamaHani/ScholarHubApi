import { Request, Response } from "express";
import { ApplicationStatus, UserRole, ScholarshipStatus } from "@prisma/client";
import prisma from "../lib/prisma.js";
import {
  ApiError,
  asyncHandler,
  updateUserCompleteness,
} from "../utils/index.js";
import { sendApplicationStatusEmail, sendNewApplicationEmail } from "../services/mail.service.js";
import { sendPushNotification } from "../services/pusher.service.js";
import { createNotification } from "../services/notification.helper.js";

/**
 * @route   POST /api/applications
 * @desc    Submit a scholarship application (Student only)
 * @access  Private/Student
 */
export const createApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      scholarshipId,
      coverLetter,
      documents,
      additionalInfo,
      status = ApplicationStatus.PENDING,
      answers, // [{ questionId: string, answer?: string, attachmentId?: string }]
    } = req.body;

    // Get student profile to validate completeness and prefill data
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        university: true,
        fieldOfStudy: true,
        currentDegree: true,
        documents: true,
        experience: true,
        age: true,
        gpa: true,
        skills: true,
        languages: true,
        phoneNumber: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!studentProfile) {
      throw ApiError.badRequest(
        "Student profile not found. Please complete your profile first.",
      );
    }

    // Calculate and update profile completeness
    const { current: profileCompleteness } = await updateUserCompleteness(
      userId,
      req.user!.role,
    );

    // Check if profile completeness is at least 80%
    if (profileCompleteness < 80) {
      throw ApiError.badRequest(
        `Your profile is only ${profileCompleteness}% complete. Please complete at least 80% of your profile before submitting an application.`,
        {
          profileCompleteness,
          requiredCompleteness: 80,
          redirectTo: "/profile",
          action: "COMPLETE_PROFILE",
        },
      );
    }

    // Check if scholarship exists and is open
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      include: { questions: true } as any,
    });

    if (!scholarship) {
      throw ApiError.notFound("Scholarship not found");
    }

    if (scholarship.status !== ScholarshipStatus.APPROVED) {
      throw ApiError.badRequest(
        "This scholarship is not accepting applications",
      );
    }

    if (scholarship.deadline < new Date()) {
      throw ApiError.badRequest("The application deadline has passed");
    }

    // Validate that all questions are answered
    const scholarshipWithQuestions = scholarship as any;
    if (
      scholarshipWithQuestions.questions &&
      scholarshipWithQuestions.questions.length > 0
    ) {
      if (!answers || !Array.isArray(answers)) {
        throw ApiError.badRequest(
          "Please provide answers to all scholarship questions",
        );
      }

      const answeredQuestionIds = answers.map((a: any) => a.questionId);
      const missingQuestionIds = scholarshipWithQuestions.questions
        .filter((q: any) => !answeredQuestionIds.includes(q.id))
        .map((q: any) => q.id);

      if (missingQuestionIds.length > 0) {
        throw ApiError.badRequest(
          "Some scholarship questions were not answered",
          {
            missingQuestionIds,
          },
        );
      }
    }

    // Check if already applied to prevent "A record with this value already exists" error
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_scholarshipId: { userId, scholarshipId },
      },
    });

    if (existingApplication) {
      // If application exists, we allow updating it if it's still in DRAFT or PENDING status
      if (
        existingApplication.status !== ApplicationStatus.DRAFT &&
        existingApplication.status !== ApplicationStatus.PENDING
      ) {
        throw ApiError.conflict(
          "You have already applied for this scholarship and the application is being processed.",
        );
      }
    }

    // Prepare application data with profile information
    let applicationData = {
      userId,
      scholarshipId,
      coverLetter: coverLetter || "",
      documents: documents && Array.isArray(documents) ? documents : [],
      additionalInfo: additionalInfo || "",
      status: status as ApplicationStatus,
      answers:
        Array.isArray(answers) && answers.length > 0
          ? {
              create: answers.map((a: any) => ({
                questionId: a.questionId,
                answer: a.answer,
                attachmentId: a.attachmentId,
              })),
            }
          : undefined,
    } as any;

    let application;

    if (existingApplication) {
      // If application exists but is editable, update it
      // First, handle answers separately for update to replace them
      if (Array.isArray(answers) && answers.length > 0) {
        await (prisma as any).applicationAnswer.deleteMany({
          where: { applicationId: existingApplication.id },
        });
      }

      application = await (prisma as any).application.update({
        where: { id: existingApplication.id },
        data: applicationData,
        include: {
          scholarship: {
            select: {
              id: true,
              title: true,
              organization: true,
              deadline: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              studentProfile: {
                select: {
                  id: true,
                  university: true,
                  fieldOfStudy: true,
                  currentDegree: true,
                  gpa: true,
                  profileCompleteness: true,
                },
              },
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
        },
      });
    } else {
      // Create new application
      application = await prisma.application.create({
        data: applicationData,
        include: {
          scholarship: {
            select: {
              id: true,
              title: true,
              organization: true,
              deadline: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              studentProfile: {
                select: {
                  id: true,
                  university: true,
                  fieldOfStudy: true,
                  currentDegree: true,
                  gpa: true,
                  profileCompleteness: true,
                },
              },
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
        } as any,
      });
    }

    // Notify professor and student about new application
    try {
      const scholarship = await prisma.scholarship.findUnique({
        where: { id: scholarshipId },
        include: {
          createdBy: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      });

      if (scholarship?.createdBy) {
        // Notify professor of new application
        await createNotification([scholarship.createdBy.id], {
          title: "New Application Received",
          message: `${studentProfile.user.firstName} ${studentProfile.user.lastName} applied for "${scholarship.title}"`,
          type: "new_application",
          link: `/dashboard/applications?scholarship=${scholarshipId}`,
        }, async () => {
          await sendNewApplicationEmail(
            scholarship.createdBy.email,
            `${scholarship.createdBy.firstName} ${scholarship.createdBy.lastName}`,
            `${studentProfile.user.firstName} ${studentProfile.user.lastName}`,
            scholarship.title,
            application.id
          );
        });

        // Confirm to student
        await createNotification([userId], {
          title: "Application Submitted",
          message: `Your application for "${scholarship.title}" has been submitted successfully`,
          type: "application_confirmation",
          link: `/applications/${application.id}`,
        });
      }
    } catch (error) {
      console.error("Failed to send application notifications:", error);
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      progress: {
        profileCompleteness,
        applicationStatus: "SUCCESS",
        step: "Application submitted",
      },
      data: {
        application,
        studentProfile: {
          university: studentProfile.university,
          fieldOfStudy: studentProfile.fieldOfStudy,
          currentDegree: studentProfile.currentDegree,
          gpa: studentProfile.gpa,
          skills: studentProfile.skills,
          languages: studentProfile.languages,
          phone: studentProfile.phoneNumber,
        },
      },
    });
  },
);

/**
 * @route   GET /api/applications
 * @desc    Get applications based on user role
 *          - Student: returns their own applications
 *          - Professor: returns applications for their scholarships
 *          - Admin: returns all applications
 * @access  Private
 */
export const getMyApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { page = 1, limit = 20, status, scholarshipId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let where: any = {};

    // Build query based on user role
    if (userRole === UserRole.STUDENT) {
      // Students get their own applications
      where.userId = userId;
      if (status) {
        where.status = status as ApplicationStatus;
      }
    } else if (userRole === UserRole.PROFESSOR) {
      // Professors get applications for their scholarships
      where.scholarship = { createdById: userId };
      where.status = { not: ApplicationStatus.DRAFT }; // Don't show drafts
      if (status) {
        where.status = status as ApplicationStatus;
      }
      if (scholarshipId) {
        where.scholarshipId = scholarshipId as string;
      }
    } else if (userRole === UserRole.ADMIN) {
      // Admins get all applications
      if (status) {
        where.status = status as ApplicationStatus;
      }
      if (scholarshipId) {
        where.scholarshipId = scholarshipId as string;
      }
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { submittedAt: "desc" },
        include: {
          scholarship: {
            select: {
              id: true,
              title: true,
              organization: true,
              country: true,
              deadline: true,
              fundingType: true,
            },
          },
          answers: {
            include: {
              question: true,
            },
          } as any,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
                  profileCompleteness: true,
                },
              },
            },
          },
        } as any,
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        applications,
        userRole, // Include role so frontend knows what type of data this is
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  },
);

/**
 * @route   GET /api/applications/:id
 * @desc    Get application by ID
 * @access  Private
 */
export const getApplicationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
                profileCompleteness: true,
              },
            },
          },
        },
        scholarship: {
          include: {
            createdBy: { select: { id: true } },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      } as any,
    });

    if (!application) {
      throw ApiError.notFound("Application not found");
    }

    // Check permission: own application, scholarship creator, or admin
    const isOwner = application.userId === userId;
    const isScholarshipCreator =
      (application as any).scholarship?.createdById === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isScholarshipCreator && !isAdmin) {
      throw ApiError.forbidden("Not authorized to view this application");
    }

    res.json({
      success: true,
      data: { application },
    });
  },
);

/**
 * @route   PUT /api/applications/:id/withdraw
 * @desc    Withdraw an application (Student only)
 * @access  Private/Student
 */
export const withdrawApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw ApiError.notFound("Application not found");
    }

    if (application.userId !== userId) {
      throw ApiError.forbidden("Not authorized to withdraw this application");
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw ApiError.badRequest("Application already withdrawn");
    }

    if (
      application.status === ApplicationStatus.ACCEPTED ||
      application.status === ApplicationStatus.REJECTED
    ) {
      throw ApiError.badRequest("Cannot withdraw a finalized application");
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status: ApplicationStatus.WITHDRAWN },
    });

    // Notify professor and student about withdrawal
    try {
      const fullApplication = await prisma.application.findUnique({
        where: { id },
        include: {
          scholarship: {
            include: {
              createdBy: { select: { id: true, firstName: true, lastName: true } }
            }
          },
          user: { select: { firstName: true, lastName: true } }
        },
      });

      if (fullApplication) {
        // Notify professor
        await createNotification([fullApplication.scholarship.createdBy.id], {
          title: "Application Withdrawn",
          message: `${fullApplication.user.firstName} ${fullApplication.user.lastName} withdrew their application for "${fullApplication.scholarship.title}"`,
          type: "application_withdrawn",
          link: `/dashboard/scholarships/${fullApplication.scholarship.id}/applications`,
        });

        // Confirm to student
        await createNotification([userId], {
          title: "Application Withdrawn",
          message: `Your application for "${fullApplication.scholarship.title}" has been withdrawn`,
          type: "application_withdrawn_confirmation",
          link: `/applications`,
        });
      }
    } catch (error) {
      console.error("Failed to send withdrawal notifications:", error);
    }

    res.json({
      success: true,
      message: "Application withdrawn successfully",
      data: { application: updatedApplication },
    });
  },
);

/**
 * @route   PUT /api/applications/:id
 * @desc    Update an application (especially from DRAFT to PENDING)
 * @access  Private/Student
 */
export const updateApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const {
      coverLetter,
      documents,
      additionalInfo,
      status,
      answers, // [{ questionId: string, answer?: string, attachmentId?: string }]
    } = req.body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        scholarship: {
          include: { questions: true } as any,
        },
      },
    });

    if (!application) {
      throw ApiError.notFound("Application not found");
    }

    const isAdmin = req.user!.role === UserRole.ADMIN;
    if (application.userId !== userId && !isAdmin) {
      throw ApiError.forbidden("Not authorized to update this application");
    }

    if (
      application.status !== ApplicationStatus.DRAFT &&
      application.status !== ApplicationStatus.PENDING
    ) {
      throw ApiError.badRequest("Cannot update a finalized application");
    }

    // Validate answers if provided and scholarship has questions
    const scholarshipWithQuestions = application.scholarship as any;
    if (
      scholarshipWithQuestions.questions &&
      scholarshipWithQuestions.questions.length > 0 &&
      answers &&
      Array.isArray(answers)
    ) {
      const answeredQuestionIds = answers.map((a: any) => a.questionId);
      const missingQuestionIds = scholarshipWithQuestions.questions
        .filter((q: any) => !answeredQuestionIds.includes(q.id))
        .map((q: any) => q.id);

      if (
        missingQuestionIds.length > 0 &&
        status === ApplicationStatus.PENDING
      ) {
        throw ApiError.badRequest(
          "Some scholarship questions were not answered",
          { missingQuestionIds },
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (coverLetter !== undefined) updateData.coverLetter = coverLetter;
    if (documents !== undefined) updateData.documents = documents;
    if (additionalInfo !== undefined)
      updateData.additionalInfo = additionalInfo;
    if (status !== undefined) updateData.status = status as ApplicationStatus;

    // Update answers if provided
    if (Array.isArray(answers) && answers.length > 0) {
      // Delete existing answers
      await (prisma as any).applicationAnswer.deleteMany({
        where: { applicationId: id },
      });

      // Add new answers
      updateData.answers = {
        create: answers.map((a: any) => ({
          questionId: a.questionId,
          answer: a.answer,
          attachmentId: a.attachmentId,
        })),
      };
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            studentProfile: {
              select: {
                id: true,
                university: true,
                fieldOfStudy: true,
                currentDegree: true,
                gpa: true,
              },
            },
          },
        },
        scholarship: { select: { id: true, title: true } },
        answers: {
          include: {
            question: true,
          },
        },
      } as any,
    });

    res.json({
      success: true,
      message:
        status === ApplicationStatus.PENDING
          ? "Application submitted successfully"
          : "Application updated",
      data: { application: updatedApplication },
    });
  },
);

// ==================== PROFESSOR APPLICATION MANAGEMENT ====================

/**
 * @route   GET /api/professor/applications
 * @desc    Get applications to professor's scholarships
 * @access  Private/Professor
 */
export const getProfessorApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page = 1, limit = 20, status, scholarshipId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      scholarship: { createdById: userId },
      status: { not: ApplicationStatus.DRAFT }, // Professors should not see drafts
    };

    if (status) {
      where.status = status as ApplicationStatus;
    }

    if (scholarshipId) {
      where.scholarshipId = scholarshipId as string;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { submittedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
                  profileCompleteness: true,
                },
              },
            },
          },
          scholarship: {
            select: { id: true, title: true },
          },
          answers: {
            include: {
              question: true,
            },
          },
        } as any,
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  },
);

/**
 * @route   PUT /api/professor/applications/:id/evaluate
 * @desc    Evaluate an application
 * @access  Private/Professor
 */
export const evaluateApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { status, evaluationNotes, evaluation } = req.body;
    const finalEvaluationNotes = evaluationNotes || evaluation;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        scholarship: { select: { id: true, createdById: true, title: true } },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!application) {
      throw ApiError.notFound("Application not found");
    }

    const isAdmin = req.user!.role === UserRole.ADMIN;
    if (application.scholarship.createdById !== userId && !isAdmin) {
      throw ApiError.forbidden("Not authorized to evaluate this application");
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw ApiError.badRequest("Cannot evaluate a withdrawn application");
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: status as ApplicationStatus,
        evaluationNotes: finalEvaluationNotes,
        evaluatedBy: userId,
        evaluatedAt: new Date(),
      },
    });

    // Notify student
    const studentName = `${application.user.firstName} ${application.user.lastName}`;
    const studentEmail = application.user.email;

    await sendApplicationStatusEmail(
      studentEmail,
      studentName,
      application.scholarship.title,
      status,
      finalEvaluationNotes,
    );

    let notificationTitle = "";
    let notificationMessage = "";

    if (status === ApplicationStatus.ACCEPTED) {
      notificationTitle = "Application Accepted! 🎉";
      notificationMessage = `Congratulations! Your application for "${application.scholarship.title}" has been accepted.`;
    } else if (status === ApplicationStatus.REJECTED) {
      notificationTitle = "Application Update";
      notificationMessage = `Your application for "${application.scholarship.title}" was not selected.`;
    } else if (status === ApplicationStatus.UNDER_REVIEW) {
      notificationTitle = "Application Under Review";
      notificationMessage = `Your application for "${application.scholarship.title}" is now under review.`;
    }

    if (notificationTitle) {
      const link = `/applications/${id}`;

      // Create database notification
      await prisma.notification.create({
        data: {
          userId: application.user.id,
          title: notificationTitle,
          message: notificationMessage,
          type: "application_update",
          link,
        },
      });

      // Send push notification
      await sendPushNotification(application.user.id, {
        title: notificationTitle,
        body: notificationMessage,
        url: link,
        data: {
          type: "application_update",
          applicationId: id,
          scholarshipId: application.scholarship.id,
          status,
        },
      });
    }

    res.json({
      success: true,
      message: "Application evaluated successfully",
      data: { application: updatedApplication },
    });
  },
);

// ==================== ADMIN APPLICATION MANAGEMENT ====================

/**
 * @route   GET /api/admin/applications
 * @desc    Get all applications (Admin only)
 * @access  Private/Admin
 */
export const getAllApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 20, status, scholarshipId, userId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status as ApplicationStatus;
    if (scholarshipId) where.scholarshipId = scholarshipId as string;
    if (userId) where.userId = userId as string;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: Number(limit),

        orderBy: { submittedAt: "desc" },
        include: {
          answers: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
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
                  profileCompleteness: true,
                },
              },
            },
          },
          scholarship: {
            select: {
              id: true,
              title: true,
              organization: true,
              questions: true,
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  },
);

/**
 * @route   GET /api/admin/applications/stats
 * @desc    Get application statistics
 * @access  Private/Admin
 */
export const getApplicationStats = asyncHandler(
  async (req: Request, res: Response) => {
    const [total, pending, underReview, accepted, rejected, withdrawn] =
      await Promise.all([
        prisma.application.count(),
        prisma.application.count({
          where: { status: ApplicationStatus.PENDING },
        }),
        prisma.application.count({
          where: { status: ApplicationStatus.UNDER_REVIEW },
        }),
        prisma.application.count({
          where: { status: ApplicationStatus.ACCEPTED },
        }),
        prisma.application.count({
          where: { status: ApplicationStatus.REJECTED },
        }),
        prisma.application.count({
          where: { status: ApplicationStatus.WITHDRAWN },
        }),
      ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: {
          pending,
          underReview,
          accepted,
          rejected,
          withdrawn,
        },
      },
    });
  },
);

/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete an application (Admin only or student's own)
 * @access  Private/Admin
 */
export const deleteApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw ApiError.notFound("Application not found");
    }

    // Only Admin can delete any application, students can only delete theirs if it's draft?
    // Usually admin panel needs a delete action.
    if (userRole !== UserRole.ADMIN && application.userId !== userId) {
      throw ApiError.forbidden("Not authorized to delete this application");
    }

    // Delete associated answers first if they exist
    await (prisma as any).applicationAnswer.deleteMany({
      where: { applicationId: id },
    });

    await prisma.application.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  },
);
