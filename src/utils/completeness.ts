import { UserRole } from "@prisma/client";
import prisma from "../lib/prisma.js";

/**
 * Helper function to calculate student profile completeness using weighted scoring
 * Total: 100 points distributed across categories
 */
export const calculateStudentProfileCompleteness = (
    profile: any,
    user: any,
): number => {
    let score = 0;

    // Core Identity (20 points)
    const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null;
    if (fullName) score += 8;
    if (user?.avatar) score += 7;
    if (profile?.bio) score += 5;

    // Contact & Location (15 points)
    if (profile?.phoneNumber || user?.phone) score += 5;
    if (profile?.country) score += 3;
    if (profile?.city) score += 2;
    if (profile?.zipCode) score += 2;
    if (profile?.age) score += 2;
    if (profile?.gender) score += 1;

    // Academic Profile (25 points)
    if (profile?.university) score += 8;
    if (profile?.fieldOfStudy) score += 7;
    if (profile?.gpa) score += 5;
    if (profile?.graduationYear) score += 3;
    if (profile?.currentDegree) score += 2;

    // Professional Development (25 points)
    if (profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0) score += 10;
    if (profile?.languages && Array.isArray(profile.languages) && profile.languages.length > 0) score += 7;
    if (profile?.certifications && Array.isArray(profile.certifications) && profile.certifications.length > 0) score += 5;
    if (profile?.experience && Array.isArray(profile.experience) && profile.experience.length > 0) score += 3;

    // Documentation (15 points)
    if (profile?.documents && Array.isArray(profile.documents) && profile.documents.length > 0) score += 15;

    return Math.min(score, 100);
};

/**
 * Helper function to calculate professor profile completeness using weighted scoring
 * Total: 100 points distributed across categories
 */
export const calculateProfessorProfileCompleteness = (
    profile: any,
    user: any,
): number => {
    let score = 0;

    // Core Identity (20 points)
    const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null;
    if (fullName) score += 8;
    if (user?.avatar) score += 7;
    if (profile?.bio) score += 5;

    // Contact & Location (15 points)
    if (profile?.phoneNumber || user?.phone) score += 5;
    if (profile?.country) score += 3;
    if (profile?.city) score += 2;
    if (profile?.zipCode) score += 2;
    if (profile?.age) score += 2;
    if (profile?.gender) score += 1;

    // Institutional Profile (25 points)
    if (profile?.institution && profile.institution !== "Not specified") score += 8;
    if (profile?.department) score += 7;
    if (profile?.position) score += 5;
    if (profile?.specialization) score += 3;
    if (profile?.website) score += 2;

    // Professional Development (25 points)
    if (profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0) score += 10;
    if (profile?.languages && Array.isArray(profile.languages) && profile.languages.length > 0) score += 7;
    if (profile?.certifications && Array.isArray(profile.certifications) && profile.certifications.length > 0) score += 5;
    if (profile?.experience && Array.isArray(profile.experience) && profile.experience.length > 0) score += 3;

    // Documentation (15 points)
    if (profile?.documents && Array.isArray(profile.documents) && profile.documents.length > 0) score += 15;

    return Math.min(score, 100);
};

/**
 * Helper function to calculate average language level (0-100)
 */
export const calculateAverageLanguageLevel = (languages: any[]): number => {
    if (!languages || languages.length === 0) return 0;

    const languageLevels = languages.map((lang) => {
        if (typeof lang === "object" && typeof lang.proficiency === "number") {
            return lang.proficiency;
        }
        return 60;
    });

    const average =
        languageLevels.reduce((a, b) => a + b, 0) / languageLevels.length;
    return Math.round(average);
};

/**
 * Updates the profile completeness for a user and returns previous and current values
 */
export const updateUserCompleteness = async (
    userId: string,
    role: string
): Promise<{ previous: number; current: number }> => {
    let previousCompleteness = 0;
    let currentCompleteness = 0;

    if (role === UserRole.STUDENT) {
        const profile = await prisma.studentProfile.findUnique({
            where: { userId },
            include: { user: true },
        });

        if (profile) {
            previousCompleteness = profile.profileCompleteness || 0;
            currentCompleteness = calculateStudentProfileCompleteness(profile, profile.user);
            const averageLanguageLevel = calculateAverageLanguageLevel(
                (profile.languages as Array<{ name: string; proficiency: number }>) || [],
            );

            await prisma.studentProfile.update({
                where: { userId },
                data: {
                    profileCompleteness: currentCompleteness,
                    averageLanguageLevel
                },
            });
        }
    } else if (role === UserRole.PROFESSOR) {
        const profile = await (prisma.professorProfile as any).findUnique({
            where: { userId },
            include: { user: true },
        });

        if (profile) {
            previousCompleteness = profile.profileCompleteness || 0;
            currentCompleteness = calculateProfessorProfileCompleteness(profile, profile.user);
            const averageLanguageLevel = calculateAverageLanguageLevel(
                (profile.languages as Array<{ name: string; proficiency: number }>) || [],
            );

            await (prisma.professorProfile as any).update({
                where: { userId },
                data: {
                    profileCompleteness: currentCompleteness,
                    averageLanguageLevel
                },
            });
        }
    }

    return { previous: previousCompleteness, current: currentCompleteness };
};
