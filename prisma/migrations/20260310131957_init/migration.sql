/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "InterviewPlatform" AS ENUM ('ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'SKYPE', 'IN_PERSON', 'PHONE', 'OTHER');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW_SCHEDULED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "provider" TEXT DEFAULT 'local',
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "platform" "InterviewPlatform" NOT NULL DEFAULT 'OTHER',
    "meetingLink" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "cancelReason" TEXT,
    "scheduledBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'ar',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Gaza',
    "registrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "requireEmailVerification" BOOLEAN NOT NULL DEFAULT true,
    "maxFileSizeMB" INTEGER NOT NULL DEFAULT 10,
    "allowedFileTypes" TEXT[],
    "siteName" TEXT NOT NULL DEFAULT 'ScholarHub',
    "siteDescription" TEXT NOT NULL DEFAULT 'Your scholarship discovery platform',
    "siteLogoUrl" TEXT,
    "siteFaviconUrl" TEXT,
    "contactEmail" TEXT NOT NULL DEFAULT 'admin@scholarhub.com',
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT NOT NULL DEFAULT 'We are currently under maintenance. Please check back soon.',
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "linkedinUrl" TEXT,
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1E40AF',
    "accentColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "textColor" TEXT NOT NULL DEFAULT '#111827',
    "bgColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "darkPrimaryColor" TEXT NOT NULL DEFAULT '#60A5FA',
    "darkBgColor" TEXT NOT NULL DEFAULT '#0F172A',
    "homeUrl" TEXT NOT NULL DEFAULT '/',
    "privacyPolicyUrl" TEXT NOT NULL DEFAULT '/privacy-policy',
    "termsUrl" TEXT NOT NULL DEFAULT '/terms-of-service',
    "cookiePolicyUrl" TEXT NOT NULL DEFAULT '/cookies',
    "appStoreUrl" TEXT,
    "playStoreUrl" TEXT,
    "docsUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "googleAnalyticsId" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImageUrl" TEXT,
    "twitterCard" TEXT NOT NULL DEFAULT 'summary_large_image',
    "robotsMeta" TEXT NOT NULL DEFAULT 'index, follow',
    "canonicalUrl" TEXT,
    "footerText" TEXT,
    "copyrightText" TEXT NOT NULL DEFAULT '© 2026 ScholarHub. All rights reserved.',
    "autoApproveScholarships" BOOLEAN NOT NULL DEFAULT false,
    "maxScholarshipsPerProf" INTEGER NOT NULL DEFAULT 10,
    "featuredScholarshipLimit" INTEGER NOT NULL DEFAULT 6,
    "requireApprovalForEdit" BOOLEAN NOT NULL DEFAULT true,
    "maxApplicationsPerStudent" INTEGER NOT NULL DEFAULT 5,
    "allowWithdrawal" BOOLEAN NOT NULL DEFAULT true,
    "deadlineBufferDays" INTEGER NOT NULL DEFAULT 3,
    "allowDraftApplications" BOOLEAN NOT NULL DEFAULT true,
    "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "deadlineReminderDays" INTEGER NOT NULL DEFAULT 7,
    "notifyAdminOnNewScholarship" BOOLEAN NOT NULL DEFAULT true,
    "notifyAdminOnNewApplication" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "heroText" TEXT,
    "ctaLabel" TEXT,
    "ctaLink" TEXT,
    "metaData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "authorName" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interview_applicationId_key" ON "Interview"("applicationId");

-- CreateIndex
CREATE INDEX "Interview_scheduledAt_idx" ON "Interview"("scheduledAt");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_pageKey_key" ON "PageContent"("pageKey");

-- CreateIndex
CREATE INDEX "PageContent_pageKey_idx" ON "PageContent"("pageKey");

-- CreateIndex
CREATE INDEX "PageContent_section_idx" ON "PageContent"("section");

-- CreateIndex
CREATE INDEX "FaqItem_pageKey_idx" ON "FaqItem"("pageKey");

-- CreateIndex
CREATE INDEX "FaqItem_order_idx" ON "FaqItem"("order");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
