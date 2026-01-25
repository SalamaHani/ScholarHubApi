import { UserRole } from "@prisma/client";
import prisma from "../lib/prisma.js";

/**
 * Helper function to calculate student profile completeness
 */
export const calculateStudentProfileCompleteness = (
    profile: any,
    user: any,
): number => {
    const fields = [
        // User fields
        user?.firstName,
        user?.lastName,
        user?.email,
        user?.avatar,
        user?.phone,
        // Profile fields
        profile?.university,
        profile?.fieldOfStudy,
        profile?.currentDegree,
        profile?.gpa,
        profile?.graduationYear,
        profile?.country,
        profile?.city,
        profile?.zipCode,
        profile?.bio,
        profile?.age,
        profile?.gender,
        profile?.phoneNumber,
        // Collections
        profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0,
        profile?.languages && Array.isArray(profile.languages) && profile.languages.length > 0,
        profile?.documents && Array.isArray(profile.documents) && profile.documents.length > 0,
    ];

    const filledFields = fields.filter((f) => {
        if (f === null || f === undefined || f === "") return false;
        if (typeof f === "boolean") return f;
        return true;
    }).length;

    return Math.round((filledFields / fields.length) * 100);
};

/**
 * Helper function to calculate professor profile completeness
 */
export const calculateProfessorProfileCompleteness = (
    profile: any,
    user: any,
): number => {
    const fields = [
        // User fields
        user?.firstName,
        user?.lastName,
        user?.email,
        user?.avatar,
        user?.phone,
        // Profile fields
        profile?.institution && profile.institution !== "Not specified",
        profile?.department,
        profile?.position,
        profile?.specialization,
        profile?.website,
        profile?.bio,
        profile?.country,
        profile?.city,
        profile?.zipCode,
        profile?.phoneNumber,
        profile?.experience,
        // Collections
        profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0,
        profile?.languages && Array.isArray(profile.languages) && profile.languages.length > 0,
        profile?.documents && Array.isArray(profile.documents) && profile.documents.length > 0,
    ];

    const filledFields = fields.filter((f) => {
        if (f === null || f === undefined || f === "") return false;
        if (typeof f === "boolean") return f;
        return true;
    }).length;

    return Math.round((filledFields / fields.length) * 100);
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
 * Updates the profile completeness for a user and returns the new value
 */
export const updateUserCompleteness = async (userId: string, role: string): Promise<number> => {
    let completeness = 0;

    if (role === UserRole.STUDENT) {
        const profile = await prisma.studentProfile.findUnique({
            where: { userId },
            include: { user: true },
        });

        if (profile) {
            completeness = calculateStudentProfileCompleteness(profile, profile.user);
            const averageLanguageLevel = calculateAverageLanguageLevel(
                (profile.languages as Array<{ name: string; proficiency: number }>) || [],
            );

            await prisma.studentProfile.update({
                where: { userId },
                data: {
                    profileCompleteness: completeness,
                    averageLanguageLevel
                },
            });
        }
    } else if (role === UserRole.PROFESSOR) {
        const profile = await prisma.professorProfile.findUnique({
            where: { userId },
            include: { user: true },
        });

        if (profile) {
            completeness = calculateProfessorProfileCompleteness(profile, profile.user);
            const averageLanguageLevel = calculateAverageLanguageLevel(
                (profile.languages as Array<{ name: string; proficiency: number }>) || [],
            );

            await prisma.professorProfile.update({
                where: { userId },
                data: {
                    profileCompleteness: completeness,
                    averageLanguageLevel
                },
            });
        }
    }

    return completeness;
};
