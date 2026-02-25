import {
  PrismaClient,
  UserRole,
  FundingType,
  DegreeLevel,
  ScholarshipStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");
  // ==================== CREATE ADMIN USER ====================
  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@scholarhub.com" },
    update: {},
    create: {
      email: "admin@scholarhub.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      isEmailVerified: true,
    },
  });
  console.log(`  ✅ Admin: ${admin.email}`);

  // ==================== CREATE PROFESSOR USER ====================
  console.log("Creating professor user...");
  const profPassword = await bcrypt.hash("Prof@123", 12);
  const professor = await prisma.user.upsert({
    where: { email: "professor@university.edu" },
    update: {},
    create: {
      email: "professor@university.edu",
      password: profPassword,
      firstName: "Dr. Ahmed",
      lastName: "Hassan",
      role: UserRole.PROFESSOR,
      isEmailVerified: true,
      professorProfile: {
        create: {
          institution: "Gaza University",
          department: "Computer Science",
          position: "Associate Professor",
          isVerified: true,
          verifiedAt: new Date(),
        },
      },
    },
  });
  console.log(`  ✅ Professor: ${professor.email}`);

  // ==================== CREATE STUDENT USER ====================
  console.log("Creating student user...");
  const studentPassword = await bcrypt.hash("Student@123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      password: studentPassword,
      firstName: "Sarah",
      lastName: "Mohammed",
      role: UserRole.STUDENT,
      isEmailVerified: true,
      studentProfile: {
        create: {
          university: "Gaza University",
          fieldOfStudy: "Computer Science",
          currentDegree: DegreeLevel.BACHELOR,
          gpa: 3.8,
          graduationYear: 2026,
          country: "Palestine",
        },
      },
    },
  });
  console.log(`  ✅ Student: ${student.email}`);

  // ==================== SEED DEFAULT SETTINGS ====================
  console.log("\nSeeding default platform settings...");
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {
      // Platform
      defaultLanguage: "en",
      timezone: "UTC",
      registrationEnabled: true,
      requireEmailVerification: true,
      maxFileSizeMB: 10,
      allowedFileTypes: [],
      // Site
      siteName: "ScholarHub",
      siteDescription: "Connecting students with scholarship opportunities worldwide.",
      contactEmail: "admin@scholarhub.com",
      maintenanceMode: false,
      maintenanceMessage: "We are currently under maintenance. Please check back soon.",
      // Branding
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF",
      accentColor: "#F59E0B",
      textColor: "#111827",
      bgColor: "#FFFFFF",
      darkPrimaryColor: "#60A5FA",
      darkBgColor: "#0F172A",
      // Links
      homeUrl: "/",
      privacyPolicyUrl: "/privacy-policy",
      termsUrl: "/terms-of-service",
      cookiePolicyUrl: "/cookies",
      // SEO
      metaTitle: "ScholarHub - Find Scholarships for Students Worldwide",
      metaDescription: "ScholarHub helps students worldwide discover and access scholarship opportunities for academic and professional growth.",
      ogTitle: "ScholarHub - Find Scholarships for Students Worldwide",
      ogDescription: "Empowering students worldwide to discover scholarship opportunities for academic and professional growth.",
      twitterCard: "summary_large_image",
      robotsMeta: "index, follow",
      // Footer
      footerText: "Connecting students with scholarship opportunities worldwide.",
      copyrightText: "© 2026 ScholarHub. All rights reserved.",
      // Scholarship
      autoApproveScholarships: false,
      maxScholarshipsPerProf: 10,
      featuredScholarshipLimit: 6,
      requireApprovalForEdit: true,
      // Application
      maxApplicationsPerStudent: 5,
      allowWithdrawal: true,
      deadlineBufferDays: 3,
      allowDraftApplications: true,
      // Notification
      emailNotificationsEnabled: true,
      pushNotificationsEnabled: true,
      deadlineReminderDays: 7,
      notifyAdminOnNewScholarship: true,
      notifyAdminOnNewApplication: true,
    },
    create: {
      defaultLanguage: "en",
      timezone: "UTC",
      registrationEnabled: true,
      requireEmailVerification: true,
      maxFileSizeMB: 10,
      allowedFileTypes: [],
      siteName: "ScholarHub",
      siteDescription: "Connecting students with scholarship opportunities worldwide.",
      contactEmail: "admin@scholarhub.com",
      maintenanceMode: false,
      maintenanceMessage: "We are currently under maintenance. Please check back soon.",
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF",
      accentColor: "#F59E0B",
      textColor: "#111827",
      bgColor: "#FFFFFF",
      darkPrimaryColor: "#60A5FA",
      darkBgColor: "#0F172A",
      homeUrl: "/",
      privacyPolicyUrl: "/privacy-policy",
      termsUrl: "/terms-of-service",
      cookiePolicyUrl: "/cookies",
      metaTitle: "ScholarHub - Find Scholarships for Students Worldwide",
      metaDescription: "ScholarHub helps students worldwide discover and access scholarship opportunities for academic and professional growth.",
      ogTitle: "ScholarHub - Find Scholarships for Students Worldwide",
      ogDescription: "Empowering students worldwide to discover scholarship opportunities for academic and professional growth.",
      twitterCard: "summary_large_image",
      robotsMeta: "index, follow",
      footerText: "Connecting students with scholarship opportunities worldwide.",
      copyrightText: "© 2026 ScholarHub. All rights reserved.",
      autoApproveScholarships: false,
      maxScholarshipsPerProf: 10,
      featuredScholarshipLimit: 6,
      requireApprovalForEdit: true,
      maxApplicationsPerStudent: 5,
      allowWithdrawal: true,
      deadlineBufferDays: 3,
      allowDraftApplications: true,
      emailNotificationsEnabled: true,
      pushNotificationsEnabled: true,
      deadlineReminderDays: 7,
      notifyAdminOnNewScholarship: true,
      notifyAdminOnNewApplication: true,
    },
  });
  console.log("  ✅ Default platform settings seeded");

  // ==================== CREATE CATEGORIES ====================
  console.log("\nCreating categories...");
  const categories = [
    {
      name: "STEM",
      slug: "stem",
      description: "Science, Technology, Engineering, Mathematics",
      icon: "🔬",
      color: "#3B82F6",
    },
    {
      name: "Arts & Humanities",
      slug: "arts-humanities",
      description: "Art, Literature, History, Philosophy",
      icon: "🎨",
      color: "#8B5CF6",
    },
    {
      name: "Business",
      slug: "business",
      description: "Business, Management, Economics",
      icon: "💼",
      color: "#10B981",
    },
    {
      name: "Medicine & Health",
      slug: "medicine-health",
      description: "Medical and Health Sciences",
      icon: "⚕️",
      color: "#EF4444",
    },
    {
      name: "Social Sciences",
      slug: "social-sciences",
      description: "Psychology, Sociology, Political Science",
      icon: "🌍",
      color: "#F59E0B",
    },
    {
      name: "Engineering",
      slug: "engineering",
      description: "All Engineering Fields",
      icon: "⚙️",
      color: "#6366F1",
    },
    {
      name: "Law",
      slug: "law",
      description: "Legal Studies",
      icon: "⚖️",
      color: "#78716C",
    },
    {
      name: "Education",
      slug: "education",
      description: "Teaching and Education",
      icon: "📚",
      color: "#EC4899",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    console.log(`  ✅ Category: ${cat.name}`);
  }

  // ==================== CREATE SCHOLARSHIPS ====================
  console.log("\nCreating scholarships...");
  const scholarships = [
    {
      title: "Fulbright Foreign Student Program",
      description:
        "The Fulbright Program is the flagship international educational exchange program sponsored by the U.S. government. It provides funding for graduate students, young professionals, and artists to study, conduct research, or teach English in the United States.",
      organization: "U.S. Department of State",
      country: "United States",
      fieldOfStudy: ["All Fields"],
      degreeLevel: [DegreeLevel.MASTER, DegreeLevel.PHD],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-05-15"),
      applicationLink: "https://foreign.fulbrightonline.org/",
      requirements:
        "Bachelor's degree, English proficiency, strong academic record",
      eligibility:
        "Open to all nationalities. Palestinian students are encouraged to apply.",
      benefits:
        "Tuition, living expenses, health insurance, round-trip airfare",
      isFeatured: true,
    },
    {
      title: "Chevening Scholarships",
      description:
        "Chevening Scholarships are the UK government's global scholarship programme, funded by the Foreign, Commonwealth and Development Office and partner organisations.",
      organization: "UK Government",
      country: "United Kingdom",
      fieldOfStudy: ["All Fields"],
      degreeLevel: [DegreeLevel.MASTER],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-11-01"),
      applicationLink: "https://www.chevening.org/",
      requirements:
        "2 years work experience, Bachelor's degree, English proficiency",
      eligibility:
        "Citizens of Chevening-eligible countries including Palestine",
      benefits:
        "University tuition fees, monthly stipend, travel costs, arrival allowance",
      isFeatured: true,
    },
    {
      title: "DAAD Scholarships",
      description:
        "The DAAD (German Academic Exchange Service) offers scholarships for international students to pursue master's or PhD studies at top German universities.",
      organization: "German Academic Exchange Service",
      country: "Germany",
      fieldOfStudy: ["All Fields"],
      degreeLevel: [DegreeLevel.MASTER, DegreeLevel.PHD],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-10-15"),
      applicationLink: "https://www.daad.de/",
      requirements:
        "Bachelor's degree, academic excellence, language proficiency",
      eligibility: "Open to graduates from all countries",
      benefits: "Monthly payments, travel allowance, health insurance",
      isFeatured: true,
    },
    {
      title: "Turkish Scholarships (Türkiye Burslari)",
      description:
        "A comprehensive scholarship program by the Republic of Turkey for international students.",
      organization: "Republic of Turkey",
      country: "Turkey",
      fieldOfStudy: ["All Fields"],
      degreeLevel: [DegreeLevel.BACHELOR, DegreeLevel.MASTER, DegreeLevel.PHD],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-02-20"),
      applicationLink: "https://turkiyeburslari.gov.tr/",
      requirements:
        "Academic excellence, age requirements vary by degree level",
      eligibility: "Non-Turkish citizens, including Palestinians",
      benefits:
        "Tuition, accommodation, monthly stipend, Turkish language course, health insurance",
      isFeatured: false,
    },
    {
      title: "Erasmus Mundus Joint Masters",
      description:
        "High-level integrated master's programmes delivered by consortia of higher education institutions across Europe and beyond.",
      organization: "European Union",
      country: "Europe",
      fieldOfStudy: ["Various Specializations"],
      degreeLevel: [DegreeLevel.MASTER],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-01-30"),
      applicationLink: "https://erasmus-plus.ec.europa.eu/",
      requirements:
        "Bachelor's degree, English proficiency, program-specific requirements",
      eligibility: "Open to students worldwide",
      benefits: "Tuition, travel, living costs, installation costs",
      isFeatured: false,
    },
    {
      title: "MEXT Scholarship (Japan)",
      description:
        "Japanese government scholarship for international students wishing to study at Japanese universities.",
      organization: "Japanese Government",
      country: "Japan",
      fieldOfStudy: ["All Fields"],
      degreeLevel: [DegreeLevel.BACHELOR, DegreeLevel.MASTER, DegreeLevel.PHD],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-04-15"),
      applicationLink: "https://www.studyinjapan.go.jp/",
      requirements:
        "Age requirements, academic excellence, health requirements",
      eligibility: "Citizens of countries with diplomatic relations with Japan",
      benefits: "Tuition exemption, monthly allowance, travel costs",
      isFeatured: false,
    },
  ];

  const stemCategory = await prisma.category.findUnique({
    where: { slug: "stem" },
  });

  for (const scholarship of scholarships) {
    const created = await prisma.scholarship.create({
      data: {
        ...scholarship,
        status: ScholarshipStatus.APPROVED,
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date(),
        categories: stemCategory
          ? {
              create: { categoryId: stemCategory.id },
            }
          : undefined,
      },
    });
    console.log(`  ✅ Scholarship: ${created.title}`);
  }

  // ==================== CREATE TESTIMONIALS ====================
  console.log("\nCreating testimonials...");
  const testimonials = [
    {
      quote:
        "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
      role: "Global Leader & Visionary",
      gradient: "from-emerald-400 to-blue-500",
    },
    {
      quote:
        "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King",
      role: "Legendary Artist",
      gradient: "from-amber-400 to-rose-500",
    },
    {
      quote:
        "Invest in yourself. Education pays the best interest for your future career.",
      author: "Benjamin Franklin",
      role: "Polymath & Statesman",
      gradient: "from-blue-400 to-indigo-600",
    },
    {
      quote:
        "Scholarship is the key that unlocks the doors of opportunity and excellence.",
      author: "Academic Board",
      role: "ScholarHub Philosophy",
      gradient: "from-emerald-600 to-blue-600",
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: {
        ...testimonial,
        createdBy: professor.id,
      },
    });
    console.log(`  ✅ Testimonial by ${testimonial.author}`);
  }

  console.log("\n✨ Database seeded successfully!\n");

  // ==================== CREATE APPLICATIONS ====================
  console.log("Creating professional applications...");

  const fulbrightScholarship = await prisma.scholarship.findFirst({
    where: { title: "Fulbright Foreign Student Program" },
  });

  const chevenigScholarship = await prisma.scholarship.findFirst({
    where: { title: "Chevening Scholarships" },
  });

  if (fulbrightScholarship) {
    const existingApp1 = await prisma.application.findUnique({
      where: { userId_scholarshipId: { userId: student.id, scholarshipId: fulbrightScholarship.id } },
    });
    if (!existingApp1) {
      await prisma.application.create({
        data: {
          userId: student.id,
          scholarshipId: fulbrightScholarship.id,
          status: "UNDER_REVIEW",
          coverLetter:
            "I am passionate about advancing my education in Computer Science to contribute to technological innovation in Palestine. The Fulbright Program will provide me with world-class educational opportunities and cultural exchange that will shape my career.",
          documents: [
            "Passport",
            "Transcripts",
            "Letter of Recommendation",
            "Statement of Purpose",
          ],
          submittedAt: new Date("2026-01-15"),
        },
      });
    }
    console.log(`  ✅ Application: ${student.firstName} → Fulbright`);
  }

  if (chevenigScholarship) {
    const existingApp2 = await prisma.application.findUnique({
      where: { userId_scholarshipId: { userId: student.id, scholarshipId: chevenigScholarship.id } },
    });
    if (!existingApp2) {
      await prisma.application.create({
        data: {
          userId: student.id,
          scholarshipId: chevenigScholarship.id,
          status: "DRAFT",
          coverLetter:
            "I aim to pursue a Master's degree in Computer Science at a prestigious UK university to develop advanced technical skills and contribute to innovation.",
          documents: [],
          submittedAt: new Date(),
        },
      });
    }
    console.log(`  ✅ Application: ${student.firstName} → Chevening (Draft)`);
  }

  // ==================== CREATE SAVED SCHOLARSHIPS ====================
  console.log("\nCreating saved scholarships...");

  const allScholarships = await prisma.scholarship.findMany({
    take: 3,
  });

  for (const scholarship of allScholarships) {
    await prisma.savedScholarship.upsert({
      where: { userId_scholarshipId: { userId: student.id, scholarshipId: scholarship.id } },
      update: {},
      create: { userId: student.id, scholarshipId: scholarship.id },
    });
    console.log(`  ✅ Saved: ${scholarship.title}`);
  }

  // ==================== CREATE NOTIFICATIONS ====================
  console.log("\nCreating notifications...");

  // Clear seed notifications before re-creating to avoid duplicates
  await prisma.notification.deleteMany({
    where: {
      userId: { in: [student.id, professor.id] },
      type: { in: ["application_update", "system"] },
    },
  });

  await prisma.notification.create({
    data: {
      userId: student.id,
      title: "Application Status Update",
      message:
        "Your Fulbright application has been moved to review stage. Check back soon for updates.",
      type: "application_update",
      link: `/applications/${student.id}`,
      isRead: false,
    },
  });
  console.log(`  ✅ Notification: Application Update`);

  await prisma.notification.create({
    data: {
      userId: professor.id,
      title: "Account Verified",
      message:
        "Your professor account has been verified. You can now post scholarships.",
      type: "system",
      isRead: false,
    },
  });
  console.log(`  ✅ Notification: Professor Verification`);

  // ==================== CREATE PAGE CONTENT ====================
  console.log("\nCreating page content...");

  const pageContents = [
    { pageKey: "browse-scholarships", section: "platform", title: "Browse Scholarships", subtitle: "Discover thousands of scholarships tailored for you", description: "Search and filter through our comprehensive database of scholarships from around the world.", heroText: "Find Your Perfect Scholarship", ctaLabel: "Start Browsing", ctaLink: "/scholarships" },
    { pageKey: "saved-scholarships", section: "platform", title: "Saved Scholarships", subtitle: "Your personal scholarship shortlist", description: "Keep track of scholarships you are interested in. Save and revisit them at any time before their deadlines.", heroText: "Your Scholarship Wishlist", ctaLabel: "View Saved", ctaLink: "/saved" },
    { pageKey: "categories", section: "platform", title: "Scholarship Categories", subtitle: "Browse by field of study", description: "Explore scholarships organized by academic discipline.", heroText: "Find Scholarships by Category", ctaLabel: "Explore Categories", ctaLink: "/categories" },
    { pageKey: "upcoming-deadlines", section: "platform", title: "Upcoming Deadlines", subtitle: "Never miss a scholarship deadline", description: "Stay on top of your applications with our deadline tracker.", heroText: "Act Before Time Runs Out", ctaLabel: "View Deadlines", ctaLink: "/scholarships?sort=deadline" },
    { pageKey: "application-guides", section: "resources", title: "Application Guides", subtitle: "Step-by-step guidance for successful applications", description: "Our comprehensive application guides walk you through every stage of the scholarship application process.", heroText: "Master the Application Process", ctaLabel: "Read Guides", ctaLink: "/resources/guides" },
    { pageKey: "tips-tricks", section: "resources", title: "Tips & Tricks", subtitle: "Expert advice to strengthen your applications", description: "Learn from scholarship winners and academic advisors.", heroText: "Get the Competitive Edge", ctaLabel: "Read Tips", ctaLink: "/resources/tips" },
    { pageKey: "faq", section: "resources", title: "Frequently Asked Questions", subtitle: "Answers to your most common questions", description: "Find answers to frequently asked questions about scholarships and the application process.", heroText: "We Have the Answers", ctaLabel: "View FAQ", ctaLink: "/faq" },
    { pageKey: "blog", section: "resources", title: "ScholarHub Blog", subtitle: "Insights, stories, and scholarship news", description: "Stay informed with our latest articles on scholarship opportunities, student success stories, and academic advice.", heroText: "Stories That Inspire", ctaLabel: "Read Blog", ctaLink: "/blog" },
    { pageKey: "about-us", section: "company", title: "About ScholarHub", subtitle: "Connecting students with life-changing opportunities", description: "ScholarHub was founded with the mission to make scholarship discovery accessible to every student.", heroText: "Our Mission, Your Future", ctaLabel: "Learn More", ctaLink: "/about" },
    { pageKey: "contact", section: "company", title: "Contact Us", subtitle: "We are here to help", description: "Have questions or feedback? Our support team is ready to assist you.", heroText: "Get in Touch", ctaLabel: "Send Message", ctaLink: "/contact" },
    { pageKey: "privacy-policy", section: "company", title: "Privacy Policy", subtitle: "How we protect your data", description: "ScholarHub is committed to protecting your personal information.", heroText: "Your Privacy Matters" },
    { pageKey: "terms-of-service", section: "company", title: "Terms of Service", subtitle: "The rules that govern our platform", description: "By using ScholarHub you agree to these terms.", heroText: "Fair Terms for Everyone" },
  ];

  for (const pc of pageContents) {
    await prisma.pageContent.upsert({
      where: { pageKey: pc.pageKey },
      update: {},
      create: pc,
    });
    console.log(`  ✅ Page Content: ${pc.pageKey}`);
  }

  // ==================== PRIVACY POLICY — FULL CONTENT (ARABIC) ====================
  console.log("\nSeeding full Privacy Policy content (Arabic)...");
  await prisma.pageContent.upsert({
    where: { pageKey: "privacy-policy" },
    update: {
      title: "سياسة الخصوصية",
      subtitle: "كيف نحمي بياناتك",
      description: "تلتزم ScholarHub بحماية معلوماتك الشخصية وحقك في الخصوصية.",
      heroText: "خصوصيتك تهمنا",
      metaData: {
        defaultLang: "ar",
        lastUpdated: "2026-02-22",
        effectiveDate: "2026-01-01",
        translations: {
          en: {
            lang: "en",
            direction: "ltr",
            sections: [
              { id: "introduction", title: "1. Introduction", content: "Welcome to ScholarHub. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, who we share it with, and your rights regarding it. By using ScholarHub, you agree to the collection and use of information in accordance with this policy. If you have questions or concerns, please contact us at privacy@scholarhub.com." },
              { id: "information-we-collect", title: "2. Information We Collect", content: "We collect several types of information to provide and improve our services.", items: [
                { heading: "Account Information", text: "When you register, we collect your first and last name, email address, and encrypted password. If you sign in via Google, we receive your Google profile ID, name, and email." },
                { heading: "Profile Information", text: "Students may optionally provide their university, field of study, GPA, graduation year, country, city, languages, skills, experience, and certifications. Professors may provide their institution, department, position, specialization, and verification documents." },
                { heading: "Usage Data", text: "We automatically collect information your browser sends when you visit our platform, including IP address, browser type and version, pages visited, date and time of visits, and time spent on pages." },
                { heading: "Application Data", text: "When you submit a scholarship application, we store your cover letter, uploaded documents, and any answers to scholarship-specific questions." },
                { heading: "Communications", text: "If you contact us through the contact form or email, we retain those messages to respond to your inquiries." },
              ]},
              { id: "how-we-use-your-information", title: "3. How We Use Your Information", content: "We use the information we collect for the following purposes:", items: [
                { text: "To create and manage your account." },
                { text: "To display scholarship opportunities that match your academic profile." },
                { text: "To process and track scholarship applications." },
                { text: "To send important notifications about your applications and account." },
                { text: "To improve and personalize your experience on ScholarHub." },
                { text: "To analyze usage trends and improve platform performance." },
                { text: "To prevent fraud, abuse, and other harmful activities." },
                { text: "To comply with our legal obligations." },
              ]},
              { id: "data-sharing", title: "4. How We Share Your Information", content: "We do not sell your personal information to third parties. We may share your data in the following cases:", items: [
                { heading: "With Scholarship Providers", text: "When you submit an application, your application information (name, academic profile, cover letter, supporting documents) is shared with the scholarship provider for evaluation purposes." },
                { heading: "Service Providers", text: "We work with trusted third-party service providers (such as cloud hosting, email delivery, and analytics) who help operate our platform. These providers are contractually bound to keep your data confidential." },
                { heading: "Legal Requirements", text: "We may disclose your information if required by law, regulation, or valid legal process, or to protect the rights, property, or safety of ScholarHub, our users, or the public." },
                { heading: "Business Transfers", text: "In the event of a merger, acquisition, or sale of assets, user data may transfer as part of that transaction. We will notify you before your data becomes subject to a different privacy policy." },
              ]},
              { id: "data-security", title: "5. Data Security", content: "We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These include encrypted password hashing (bcrypt), HTTPS-only communication, and role-based access controls. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security." },
              { id: "data-retention", title: "6. Data Retention", content: "We retain your personal information for as long as your account is active or as necessary to provide our services. You may request account deletion at any time (see Section 7). We may retain some information for a limited period after deletion to fulfill legal obligations or resolve disputes." },
              { id: "your-rights", title: "7. Your Rights", content: "Depending on your location, you may have the following rights regarding your personal data:", items: [
                { heading: "Right of Access", text: "Request a copy of the personal data we hold about you." },
                { heading: "Right of Rectification", text: "Request correction of inaccurate or incomplete personal data." },
                { heading: "Right of Erasure", text: "Request deletion of your personal data ('right to be forgotten')." },
                { heading: "Right to Restrict Processing", text: "Request that we limit how we use your data in certain circumstances." },
                { heading: "Right to Data Portability", text: "Request your data in a structured, machine-readable format." },
                { heading: "Right to Object", text: "Object to the processing of your data for direct marketing or other purposes." },
              ], footer: "To exercise any of these rights, please contact us at privacy@scholarhub.com. We will respond to your request within 30 days." },
              { id: "cookies", title: "8. Cookies and Tracking Technologies", content: "We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze how our platform is used. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some parts of our platform may not function properly. We use the following types:", items: [
                { heading: "Essential Cookies", text: "Required for the platform to function (e.g., authentication tokens)." },
                { heading: "Preference Cookies", text: "Remember your settings and preferences between visits." },
                { heading: "Analytics Cookies", text: "Help us understand how visitors interact with our platform (e.g., Google Analytics)." },
              ]},
              { id: "third-party-links", title: "9. Third-Party Links", content: "Our platform contains links to external scholarship websites not operated by ScholarHub. We have no control over the content, privacy policies, or practices of those sites and assume no responsibility for them. We encourage you to review the privacy policy of every site you visit." },
              { id: "childrens-privacy", title: "10. Children's Privacy", content: "ScholarHub is not intended for use by children under the age of 16. We do not knowingly collect personal information from children under 16. If you become aware that a child has provided us with personal information, please contact us at privacy@scholarhub.com and we will take steps to remove that information." },
              { id: "changes", title: "11. Changes to This Privacy Policy", content: "We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. When we make material changes, we will notify you by email or by posting a prominent notice on our platform before the changes take effect. Your continued use of ScholarHub after the effective date of the revised policy constitutes your acceptance of the changes." },
              { id: "contact", title: "12. Contact Us", content: "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:", contact: { email: "privacy@scholarhub.com", supportEmail: "support@scholarhub.com", website: "https://scholarhub.com/contact" } },
            ],
          },
          ar: {
            lang: "ar",
            direction: "rtl",
            sections: [
              {
                id: "introduction",
            title: "1. مقدمة",
            content:
              "مرحباً بكم في ScholarHub. نحن ملتزمون بحماية معلوماتك الشخصية وحقك في الخصوصية. توضح سياسة الخصوصية هذه المعلومات التي نجمعها، وكيف نستخدمها، ومع من نشاركها، وحقوقك فيما يتعلق بها. باستخدامك لـ ScholarHub، فإنك توافق على جمع المعلومات واستخدامها وفقاً لهذه السياسة. إذا كان لديك أي أسئلة أو مخاوف، يُرجى التواصل معنا على privacy@scholarhub.com.",
          },
          {
            id: "information-we-collect",
            title: "2. المعلومات التي نجمعها",
            content: "نجمع أنواعاً عدة من المعلومات لتوفير خدماتنا وتحسينها.",
            items: [
              {
                heading: "معلومات الحساب",
                text: "عند التسجيل، نجمع اسمك الأول والأخير، وعنوان البريد الإلكتروني، وكلمة المرور المشفّرة. إذا سجّلت الدخول عبر Google، نتلقى معرّف ملفك الشخصي على Google واسمك وبريدك الإلكتروني.",
              },
              {
                heading: "معلومات الملف الشخصي",
                text: "يمكن للطلاب اختيارياً تقديم جامعتهم، ومجال دراستهم، والمعدل التراكمي، وسنة التخرج، والبلد، والمدينة، واللغات، والمهارات، والخبرات، والشهادات. يمكن للأساتذة تقديم مؤسستهم، والقسم، والمنصب، والتخصص، ووثائق التحقق.",
              },
              {
                heading: "بيانات الاستخدام",
                text: "نجمع تلقائياً المعلومات التي يرسلها متصفحك عند زيارة منصتنا، بما في ذلك عنوان IP، ونوع المتصفح وإصداره، والصفحات التي تمت زيارتها، وتاريخ ووقت الزيارات، والوقت المستغرق في الصفحات.",
              },
              {
                heading: "بيانات الطلبات",
                text: "عند تقديم طلب للحصول على منحة دراسية، نخزّن خطاب التغطية الخاص بك، والوثائق المرفوعة، وأي إجابات على الأسئلة الخاصة بالمنحة.",
              },
              {
                heading: "التواصل",
                text: "إذا تواصلت معنا من خلال نموذج الاتصال أو البريد الإلكتروني، نحتفظ بتلك الرسائل للرد على استفساراتك.",
              },
            ],
          },
          {
            id: "how-we-use-your-information",
            title: "3. كيف نستخدم معلوماتك",
            content: "نستخدم المعلومات التي نجمعها للأغراض التالية:",
            items: [
              { text: "إنشاء حسابك وإدارته." },
              { text: "عرض فرص المنح الدراسية التي تتناسب مع ملفك الأكاديمي." },
              { text: "معالجة طلبات المنح الدراسية وتتبعها." },
              { text: "إرسال إشعارات مهمة بشأن طلباتك وحسابك." },
              { text: "تحسين تجربتك وتخصيصها على ScholarHub." },
              { text: "تحليل اتجاهات الاستخدام وتحسين أداء المنصة." },
              { text: "منع الاحتيال والإساءة والأنشطة الضارة الأخرى." },
              { text: "الامتثال لالتزاماتنا القانونية." },
            ],
          },
          {
            id: "data-sharing",
            title: "4. كيف نشارك معلوماتك",
            content:
              "لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك بياناتك في الحالات التالية:",
            items: [
              {
                heading: "مع مزودي المنح الدراسية",
                text: "عند تقديم طلب للحصول على منحة دراسية، تُشارَك معلومات طلبك (الاسم، والملف الأكاديمي، وخطاب التغطية، والوثائق الداعمة) مع مزود المنحة (أستاذ أو مؤسسة) لأغراض التقييم.",
              },
              {
                heading: "مزودو الخدمات",
                text: "نعمل مع مزودي خدمات خارجيين موثوقين (مثل الاستضافة السحابية، وتوصيل البريد الإلكتروني، والتحليلات) يساعدون في تشغيل منصتنا. يُلزَم هؤلاء المزودون تعاقدياً بالحفاظ على سرية بياناتك ولا يجوز لهم استخدامها لأي غرض آخر.",
              },
              {
                heading: "المتطلبات القانونية",
                text: "قد نكشف عن معلوماتك إذا كان ذلك مطلوباً بموجب القانون أو اللوائح أو الإجراءات القانونية الصحيحة، أو لحماية حقوق أو ممتلكات أو سلامة ScholarHub أو مستخدمينا أو الجمهور.",
              },
              {
                heading: "نقل الأعمال",
                text: "في حال حدوث اندماج أو استحواذ أو بيع لجميع أصولنا أو جزء منها، قد تنتقل بيانات المستخدم كجزء من تلك الصفقة. سنُخطرك قبل أن تخضع بياناتك لسياسة خصوصية مختلفة.",
              },
            ],
          },
          {
            id: "data-security",
            title: "5. أمان البيانات",
            content:
              "نطبّق معايير أمان تتوافق مع معايير الصناعة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف. تشمل هذه المعايير التشفير المشفّر لكلمات المرور (bcrypt)، والتواصل عبر HTTPS فقط، وضوابط الوصول القائمة على الأدوار. ومع ذلك، لا توجد طريقة إرسال عبر الإنترنت أو طريقة تخزين إلكتروني آمنة بنسبة 100%، ولا يمكننا ضمان الأمان المطلق.",
          },
          {
            id: "data-retention",
            title: "6. الاحتفاظ بالبيانات",
            content:
              "نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسبما هو ضروري لتقديم خدماتنا. يمكنك طلب حذف حسابك في أي وقت (انظر القسم 7). قد نحتفظ ببعض المعلومات لفترة محدودة بعد الحذف للوفاء بالالتزامات القانونية أو حل النزاعات.",
          },
          {
            id: "your-rights",
            title: "7. حقوقك",
            content:
              "اعتماداً على موقعك، قد تتمتع بالحقوق التالية فيما يتعلق ببياناتك الشخصية:",
            items: [
              { heading: "حق الوصول", text: "طلب نسخة من البيانات الشخصية التي نحتفظ بها عنك." },
              { heading: "حق التصحيح", text: "طلب تصحيح البيانات الشخصية غير الدقيقة أو غير المكتملة." },
              { heading: "حق المحو", text: "طلب حذف بياناتك الشخصية ('حق النسيان')." },
              { heading: "حق تقييد المعالجة", text: "طلب تقييد كيفية استخدامنا لبياناتك في ظروف معينة." },
              { heading: "حق نقل البيانات", text: "طلب بياناتك بتنسيق منظم وقابل للقراءة آلياً." },
              { heading: "حق الاعتراض", text: "الاعتراض على معالجة بياناتك للتسويق المباشر أو لأغراض أخرى." },
            ],
            footer:
              "لممارسة أي من هذه الحقوق، يُرجى التواصل معنا على privacy@scholarhub.com. سنرد على طلبك في غضون 30 يوماً.",
          },
          {
            id: "cookies",
            title: "8. ملفات تعريف الارتباط وتقنيات التتبع",
            content:
              "نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة للحفاظ على جلستك، وتذكّر تفضيلاتك، وتحليل كيفية استخدام منصتنا. يمكنك توجيه متصفحك لرفض جميع ملفات تعريف الارتباط أو للإشارة إلى وقت إرسال ملف تعريف الارتباط. ومع ذلك، إذا لم تقبل ملفات تعريف الارتباط، فقد لا تعمل بعض أجزاء منصتنا بشكل صحيح. نستخدم الأنواع التالية:",
            items: [
              { heading: "ملفات تعريف الارتباط الأساسية", text: "مطلوبة لعمل المنصة (مثل رموز المصادقة)." },
              { heading: "ملفات تعريف الارتباط للتفضيلات", text: "تتذكر إعداداتك وتفضيلاتك بين الزيارات." },
              { heading: "ملفات تعريف الارتباط للتحليلات", text: "تساعدنا على فهم كيفية تفاعل الزوار مع منصتنا (مثل Google Analytics)." },
            ],
          },
          {
            id: "third-party-links",
            title: "9. روابط الجهات الخارجية",
            content:
              "تحتوي منصتنا على روابط لمواقع منح دراسية خارجية لا تديرها ScholarHub. ليس لدينا أي سيطرة على محتوى تلك المواقع أو سياسات الخصوصية أو ممارساتها، ولا نتحمل أي مسؤولية عنها. نشجعك على مراجعة سياسة الخصوصية لكل موقع تزوره.",
          },
          {
            id: "childrens-privacy",
            title: "10. خصوصية الأطفال",
            content:
              "لا يُقصد استخدام ScholarHub من قِبَل الأطفال دون سن 16 عاماً. لا نجمع عمداً معلومات شخصية من الأطفال دون سن 16. إذا علمت أن طفلاً قد زوّدنا بمعلومات شخصية، يُرجى التواصل معنا على privacy@scholarhub.com وسنتخذ خطوات لإزالة تلك المعلومات.",
          },
          {
            id: "changes",
            title: "11. التغييرات على سياسة الخصوصية هذه",
            content:
              "قد نُحدّث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات في ممارساتنا أو لأسباب قانونية. عند إجراء تغييرات جوهرية، سنُخطرك عبر البريد الإلكتروني أو بإشعار بارز على منصتنا قبل دخول التغييرات حيز التنفيذ. استمرارك في استخدام ScholarHub بعد التاريخ الفعلي للسياسة المُنقّحة يُعدّ قبولاً منك للتغييرات.",
          },
          {
            id: "contact",
            title: "12. اتصل بنا",
            content:
              "إذا كان لديك أي أسئلة أو مخاوف أو طلبات تتعلق بسياسة الخصوصية هذه أو ممارساتنا المتعلقة بالبيانات، يُرجى التواصل معنا:",
            contact: {
              email: "privacy@scholarhub.com",
              supportEmail: "support@scholarhub.com",
              website: "https://scholarhub.com/contact",
            },
          },
            ],
          },
        },
      },
    },
    create: {
      pageKey: "privacy-policy",
      section: "company",
      title: "سياسة الخصوصية",
      subtitle: "كيف نحمي بياناتك",
      description: "تلتزم ScholarHub بحماية معلوماتك الشخصية وحقك في الخصوصية.",
      heroText: "خصوصيتك تهمنا",
      metaData: {
        lastUpdated: "2026-02-22",
        effectiveDate: "2026-01-01",
        lang: "ar",
        direction: "rtl",
        sections: [],
      },
    },
  });
  console.log("  ✅ Full Privacy Policy content seeded (Arabic)");

  // ==================== TERMS OF SERVICE — FULL CONTENT (ARABIC) ====================
  console.log("Seeding full Terms of Service content (Arabic)...");
  await prisma.pageContent.upsert({
    where: { pageKey: "terms-of-service" },
    update: {
      title: "شروط الخدمة",
      subtitle: "القواعد التي تحكم منصتنا",
      description: "باستخدامك لـ ScholarHub، فإنك توافق على هذه الشروط والأحكام.",
      heroText: "شروط عادلة للجميع",
      metaData: {
        defaultLang: "ar",
        lastUpdated: "2026-02-22",
        effectiveDate: "2026-01-01",
        translations: {
          en: {
            lang: "en",
            direction: "ltr",
            sections: [
              { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing or using the ScholarHub platform ('the Service'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, please do not use the Service. These Terms apply to all users of the Service, including students, professors, administrators, and visitors. We reserve the right to update these Terms at any time. Your continued use of the Service after changes are posted constitutes your acceptance of the revised Terms." },
              { id: "description", title: "2. Description of Service", content: "ScholarHub is an online platform that connects students with scholarship opportunities. The Service allows students to discover, save, and apply for scholarships, and allows qualified professors and institutions to post scholarship listings subject to administrative approval. ScholarHub operates as a platform for managing information and applications and is not itself a scholarship provider." },
              { id: "eligibility", title: "3. Eligibility", content: "To use ScholarHub, you must be at least 16 years old. By creating an account, you represent and warrant that:", items: [
                { text: "You are at least 16 years of age." },
                { text: "You have the legal capacity to enter into a binding agreement." },
                { text: "You will use the Service only for lawful purposes and in accordance with these Terms." },
                { text: "All information you provide is accurate, current, and complete." },
              ]},
              { id: "user-accounts", title: "4. User Accounts", content: "When you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur on your account. You must:", items: [
                { text: "Provide accurate and complete registration information." },
                { text: "Update your information whenever it changes." },
                { text: "Notify us immediately at support@scholarhub.com if you suspect unauthorized access to your account." },
                { text: "Not share your password with any third party." },
              ], footer: "We reserve the right to suspend or terminate accounts that contain false information, violate these Terms, or are used for fraudulent purposes." },
              { id: "user-roles", title: "5. User Roles and Responsibilities", items: [
                { heading: "Students", text: "Students may browse, apply for, save, and manage scholarship applications through ScholarHub. Students are responsible for the accuracy of their application information and uploaded documents. Submitting false or misleading information may result in permanent account suspension." },
                { heading: "Professors / Scholarship Providers", text: "Registered professors may submit scholarship listings for administrative review. Scholarship listings must be legitimate, accurately described, and kept up to date. Submitting fraudulent or misleading scholarships is strictly prohibited and will result in immediate account termination." },
                { heading: "Administrators", text: "Administrators manage the platform, review scholarship submissions, oversee content, and ensure compliance with these Terms." },
              ]},
              { id: "prohibited-conduct", title: "6. Prohibited Conduct", content: "You agree not to:", items: [
                { text: "Post or submit false, misleading, or fraudulent information." },
                { text: "Impersonate another person, institution, or scholarship provider." },
                { text: "Use the platform to harass, threaten, or discriminate against any person." },
                { text: "Upload malware, viruses, or any harmful code." },
                { text: "Attempt unauthorized access to any part of the Service or related systems." },
                { text: "Use automated bots or data scraping tools without prior written permission." },
                { text: "Use the Service for any unlawful purpose or in violation of applicable laws and regulations." },
                { text: "Circumvent, disable, or interfere with security features of the Service." },
              ]},
              { id: "scholarship-applications", title: "7. Scholarship Applications", content: "ScholarHub facilitates the discovery and application management process but does not guarantee admission, funding, or any outcome for any scholarship application. Final selection decisions are made solely by scholarship providers. ScholarHub is not responsible for errors in third-party scholarship listings or changes made by providers after publication." },
              { id: "intellectual-property", title: "8. Intellectual Property", content: "The ScholarHub name, logo, platform design, and its proprietary content are intellectual property of ScholarHub and protected by applicable copyright, trademark, and intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from any part of the Service without our express written permission. Content you submit to ScholarHub (such as your profile, cover letters, and application materials) remains yours. By submitting it, you grant ScholarHub a limited, non-exclusive license to use, display, and store it solely for the purpose of operating the Service." },
              { id: "privacy", title: "9. Privacy", content: "Your use of ScholarHub is also governed by our Privacy Policy, which is incorporated by reference into these Terms. Please review our Privacy Policy to understand our data practices." },
              { id: "disclaimers", title: "10. Disclaimers", content: "The Service is provided on an 'as is' and 'as available' basis without warranties of any kind, express or implied. ScholarHub does not warrant that:", items: [
                { text: "The Service will be uninterrupted, timely, secure, or error-free." },
                { text: "Scholarship listings are always accurate, complete, or current." },
                { text: "Results obtained from using the Service will meet your expectations." },
              ]},
              { id: "limitation-of-liability", title: "11. Limitation of Liability", content: "To the maximum extent permitted by applicable law, ScholarHub and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, opportunity, or any other damages arising from or related to your use of the Service. Our total liability to you in any case shall not exceed the greater of: (a) the amount you paid for use of the Service in the preceding twelve months, or (b) USD $50." },
              { id: "termination", title: "12. Termination", content: "We may suspend your account and access to the Service at any time, without notice, if we determine that your conduct violates these Terms, harms other users, ScholarHub, or third parties, or for any other reason at our sole discretion. You may terminate your account at any time by contacting us at support@scholarhub.com. Upon termination, your right to use the Service ceases immediately." },
              { id: "governing-law", title: "13. Governing Law and Dispute Resolution", content: "These Terms are governed by and construed in accordance with applicable law. Disputes arising from these Terms or the Service shall be resolved through good-faith negotiation. If negotiation fails, disputes shall be referred to binding arbitration in accordance with applicable arbitration rules. Nothing in this section prevents either party from seeking injunctive relief in a court of competent jurisdiction." },
              { id: "changes", title: "14. Changes to These Terms", content: "We reserve the right to modify these Terms at any time. When we make material changes, we will notify you by email or by posting a prominent notice on the platform at least 7 days before the changes take effect. Your continued use of the Service after the effective date constitutes your acceptance of the updated Terms." },
              { id: "contact", title: "15. Contact Us", content: "If you have any questions about these Terms of Service, please contact us:", contact: { email: "legal@scholarhub.com", supportEmail: "support@scholarhub.com", website: "https://scholarhub.com/contact" } },
            ],
          },
          ar: {
            lang: "ar",
            direction: "rtl",
            sections: [
              {
                id: "acceptance",
            title: "1. قبول الشروط",
            content:
              "بالدخول إلى منصة ScholarHub ('الخدمة') أو استخدامها، فإنك توافق على الالتزام بشروط الخدمة هذه ('الشروط'). إذا كنت لا توافق على هذه الشروط، يُرجى عدم استخدام الخدمة. تنطبق هذه الشروط على جميع مستخدمي الخدمة، بما في ذلك الطلاب والأساتذة والمشرفون والزوار. نحتفظ بحق تحديث هذه الشروط في أي وقت. استمرارك في استخدام الخدمة بعد نشر التغييرات يُعدّ قبولاً منك للشروط المُعدَّلة.",
          },
          {
            id: "description",
            title: "2. وصف الخدمة",
            content:
              "ScholarHub منصة إلكترونية تربط الطلاب بفرص المنح الدراسية. تتيح الخدمة للطلاب اكتشاف المنح الدراسية وحفظها والتقديم عليها، وتتيح للأساتذة والمؤسسات المؤهّلة نشر قوائم المنح الدراسية خاضعةً للموافقة الإدارية. تعمل ScholarHub كمنصة لإدارة المعلومات والطلبات وليست بذاتها مزوداً للمنح الدراسية.",
          },
          {
            id: "eligibility",
            title: "3. الأهلية",
            content:
              "لاستخدام ScholarHub، يجب أن يكون عمرك 16 عاماً على الأقل. بإنشاء حساب، فإنك تُقرّ وتضمن ما يلي:",
            items: [
              { text: "أن عمرك لا يقل عن 16 عاماً." },
              { text: "أن لديك الأهلية القانونية لإبرام اتفاقية ملزمة." },
              { text: "أنك ستستخدم الخدمة للأغراض القانونية فقط ووفقاً لهذه الشروط." },
              { text: "أن جميع المعلومات التي تقدمها دقيقة وحديثة وكاملة." },
            ],
          },
          {
            id: "user-accounts",
            title: "4. حسابات المستخدمين",
            content:
              "عند إنشاء حساب، تكون مسؤولاً عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك وعن جميع الأنشطة التي تتم على حسابك. يجب عليك:",
            items: [
              { text: "تقديم معلومات تسجيل دقيقة وكاملة." },
              { text: "تحديث معلوماتك فور تغييرها." },
              { text: "إخطارنا فوراً على support@scholarhub.com إذا اشتبهت في وصول غير مصرح به إلى حسابك." },
              { text: "عدم مشاركة كلمة مرورك مع أي طرف ثالث." },
            ],
            footer:
              "نحتفظ بحق تعليق الحسابات أو إنهائها التي تحتوي على معلومات كاذبة أو تنتهك هذه الشروط أو تُستخدم لأغراض احتيالية.",
          },
          {
            id: "user-roles",
            title: "5. أدوار المستخدمين ومسؤولياتهم",
            items: [
              {
                heading: "الطلاب",
                text: "يمكن للطلاب تصفح المنح الدراسية والتقديم عليها من خلال ScholarHub وحفظها وإدارة ملفهم الأكاديمي. يتحمل الطلاب مسؤولية دقة معلومات طلباتهم والوثائق المُرفوعة. تقديم معلومات كاذبة أو مضلّلة قد يؤدي إلى تعليق الحساب بشكل دائم.",
              },
              {
                heading: "الأساتذة / مزودو المنح الدراسية",
                text: "يمكن للأساتذة المسجّلين تقديم قوائم المنح الدراسية للمراجعة الإدارية. يجب أن تكون قوائم المنح الدراسية شرعية وموصوفة بدقة ومحدَّثة باستمرار. يُحظر تقديم منح دراسية احتيالية أو مضلّلة بشكل صارم وسيؤدي إلى إنهاء فوري للحساب.",
              },
              {
                heading: "المشرفون",
                text: "يدير المشرفون المنصة ويراجعون تقديمات المنح الدراسية ويشرفون على المحتوى ويضمنون الامتثال لهذه الشروط.",
              },
            ],
          },
          {
            id: "prohibited-conduct",
            title: "6. السلوك المحظور",
            content: "توافق على عدم القيام بما يلي:",
            items: [
              { text: "نشر أو تقديم معلومات كاذبة أو مضلّلة أو احتيالية." },
              { text: "انتحال شخصية شخص آخر أو مؤسسة أو مزود منح دراسية." },
              { text: "استخدام المنصة للتحرش أو التهديد أو التمييز ضد أي شخص." },
              { text: "رفع برامج ضارة أو فيروسات أو أي كود ضار." },
              { text: "محاولة الوصول غير المصرح به إلى أي جزء من الخدمة أو الأنظمة المرتبطة بها." },
              { text: "استخدام الروبوتات الآلية أو أدوات استخراج البيانات دون إذن كتابي مسبق." },
              { text: "استخدام الخدمة لأي غرض غير قانوني أو بما يخالف القوانين واللوائح المعمول بها." },
              { text: "التحايل على ميزات الأمان أو تعطيلها أو التدخل فيها." },
            ],
          },
          {
            id: "scholarship-applications",
            title: "7. طلبات المنح الدراسية",
            content:
              "تُيسّر ScholarHub عملية الاكتشاف وإدارة الطلبات لكنها لا تضمن القبول أو التمويل أو أي نتيجة لأي طلب منحة دراسية. تُتخذ قرارات الاختيار النهائية من قِبَل مزودي المنح الدراسية حصراً. لا تتحمل ScholarHub المسؤولية عن أي أخطاء في قوائم المنح الدراسية المقدمة من أطراف ثالثة أو عن التغييرات التي يجريها مزودو المنح الدراسية بعد النشر.",
          },
          {
            id: "intellectual-property",
            title: "8. الملكية الفكرية",
            content:
              "اسم ScholarHub وشعارها وتصميم المنصة والمحتوى الخاص بها هي ملكية فكرية لـ ScholarHub ومحمية بموجب قوانين حقوق النشر والعلامات التجارية وقوانين الملكية الفكرية المعمول بها. لا يجوز لك نسخ أو إعادة إنتاج أو توزيع أو إنشاء أعمال مشتقة من أي جزء من الخدمة دون إذن كتابي صريح منا. يظل المحتوى الذي تقدمه إلى ScholarHub (مثل ملفك الشخصي وخطابات التغطية ومواد الطلب) ملكاً لك. بتقديمه، فإنك تمنح ScholarHub ترخيصاً محدوداً وغير حصري لاستخدامه وعرضه وتخزينه فقط بغرض تشغيل الخدمة.",
          },
          {
            id: "privacy",
            title: "9. الخصوصية",
            content:
              "يخضع استخدامك لـ ScholarHub أيضاً لسياسة الخصوصية الخاصة بنا، التي يُدمج مرجعها في هذه الشروط. يُرجى مراجعة سياسة الخصوصية الخاصة بنا لفهم ممارساتنا المتعلقة بالبيانات.",
          },
          {
            id: "disclaimers",
            title: "10. إخلاء المسؤولية",
            content:
              "تُقدَّم الخدمة على أساس 'كما هي' و'حسب الإتاحة' دون أي ضمانات من أي نوع، صريحة كانت أم ضمنية. لا تضمن ScholarHub ما يلي:",
            items: [
              { text: "ستكون الخدمة متاحة دون انقطاع أو في الوقت المحدد أو آمنة أو خالية من الأخطاء." },
              { text: "قوائم المنح الدراسية دائماً دقيقة أو كاملة أو حديثة." },
              { text: "النتائج المحصّلة من استخدام الخدمة ستلبّي توقعاتك." },
            ],
          },
          {
            id: "limitation-of-liability",
            title: "11. تحديد المسؤولية",
            content:
              "إلى أقصى حد يسمح به القانون المعمول به، لن تكون ScholarHub ومسؤولوها ومديروها وموظفوها ووكلاؤها مسؤولين عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية، بما في ذلك فقدان الأرباح أو فقدان البيانات أو فقدان الفرصة أو أي أضرار أخرى ناشئة عن أو مرتبطة باستخدامك للخدمة. لن تتجاوز مسؤوليتنا الإجمالية تجاهك في أي حال الأكبر من: (أ) المبلغ الذي دفعته مقابل استخدام الخدمة في الاثني عشر شهراً السابقة، أو (ب) 50 دولاراً أمريكياً.",
          },
          {
            id: "termination",
            title: "12. الإنهاء",
            content:
              "قد نعلّق حسابك والوصول إلى الخدمة في أي وقت، دون إشعار، إذا رأينا أن سلوكك ينتهك هذه الشروط أو يضر بالمستخدمين الآخرين أو ScholarHub أو أطراف ثالثة، أو لأي سبب آخر وفق تقديرنا المطلق. يمكنك إنهاء حسابك في أي وقت بالتواصل معنا على support@scholarhub.com. عند الإنهاء، يتوقف حقك في استخدام الخدمة فوراً.",
          },
          {
            id: "governing-law",
            title: "13. القانون الحاكم وتسوية النزاعات",
            content:
              "تخضع هذه الشروط وتُفسَّر وفقاً للقانون المعمول به. تُحسم النزاعات الناشئة عن هذه الشروط أو الخدمة من خلال التفاوض بحسن نية. إذا فشل التفاوض، تُحال النزاعات إلى التحكيم الملزم وفقاً لقواعد التحكيم المعمول بها. لا يمنع أي شيء في هذا القسم أياً من الطرفين من السعي للحصول على إنصاف قضائي أمام محكمة مختصة.",
          },
          {
            id: "changes",
            title: "14. التغييرات على هذه الشروط",
            content:
              "نحتفظ بحق تعديل هذه الشروط في أي وقت. عند إجراء تغييرات جوهرية، سنُخطرك عبر البريد الإلكتروني أو بنشر إشعار بارز على المنصة قبل 7 أيام على الأقل من دخول التغييرات حيز التنفيذ. استمرارك في استخدام الخدمة بعد التاريخ الفعلي يُعدّ قبولاً منك للشروط المُحدَّثة.",
          },
          {
            id: "contact",
            title: "15. اتصل بنا",
            content:
              "إذا كان لديك أي أسئلة حول شروط الخدمة هذه، يُرجى التواصل معنا:",
            contact: {
              email: "legal@scholarhub.com",
              supportEmail: "support@scholarhub.com",
              website: "https://scholarhub.com/contact",
            },
          },
            ],
          },
        },
      },
    },
    create: {
      pageKey: "terms-of-service",
      section: "company",
      title: "شروط الخدمة",
      subtitle: "القواعد التي تحكم منصتنا",
      description: "باستخدامك لـ ScholarHub، فإنك توافق على هذه الشروط والأحكام.",
      heroText: "شروط عادلة للجميع",
      metaData: {
        lastUpdated: "2026-02-22",
        effectiveDate: "2026-01-01",
        lang: "ar",
        direction: "rtl",
        sections: [],
      },
    },
  });
  console.log("  ✅ Full Terms of Service content seeded (Arabic)");

  // ==================== CONTACT PAGE — FULL CONTENT (ARABIC) ====================
  console.log("Seeding full Contact page content (Arabic)...");
  await prisma.pageContent.upsert({
    where: { pageKey: "contact" },
    update: {
      title: "اتصل بنا",
      subtitle: "نحن هنا للمساعدة",
      description: "هل لديك سؤال أو اقتراح؟ فريق الدعم لدينا جاهز للإجابة على استفساراتك في أقرب وقت ممكن.",
      heroText: "تواصل معنا",
      ctaLabel: "أرسل رسالة",
      ctaLink: "/contact",
      metaData: {
        defaultLang: "ar",
        translations: {
          ar: {
            lang: "ar",
            direction: "rtl",
            intro: "يسعدنا التواصل معك. سواء كنت طالباً تبحث عن مساعدة في التقديم على منحة دراسية، أو أستاذاً تريد نشر فرصة، أو مجرد مستخدم لديه استفسار — فريقنا هنا دائماً.",
            contactMethods: [
              { id: "general-support", icon: "envelope", title: "الدعم العام", description: "للأسئلة العامة والمساعدة في استخدام المنصة", email: "support@scholarhub.com", responseTime: "خلال 24 ساعة" },
              { id: "scholarship-inquiries", icon: "academic-cap", title: "استفسارات المنح الدراسية", description: "للأسئلة المتعلقة بالمنح الدراسية المنشورة", email: "scholarships@scholarhub.com", responseTime: "خلال 48 ساعة" },
              { id: "professor-support", icon: "user-group", title: "دعم الأساتذة والمؤسسات", description: "للأساتذة والمؤسسات الراغبة في نشر المنح", email: "professors@scholarhub.com", responseTime: "خلال 24 ساعة" },
              { id: "technical-support", icon: "wrench", title: "الدعم التقني", description: "للإبلاغ عن مشاكل تقنية أو أخطاء في المنصة", email: "tech@scholarhub.com", responseTime: "خلال 12 ساعة" },
              { id: "privacy", icon: "shield-check", title: "الخصوصية والبيانات", description: "للطلبات المتعلقة بالبيانات الشخصية وسياسة الخصوصية", email: "privacy@scholarhub.com", responseTime: "خلال 30 يوماً" },
            ],
            officeInfo: {
              title: "مقر ScholarHub",
              address: "فلسطين — قطاع غزة",
              workingHours: [
                { days: "الأحد — الخميس", hours: "9:00 ص — 5:00 م" },
                { days: "الجمعة — السبت", hours: "مغلق" },
              ],
              note: "يعمل فريق الدعم عبر الإنترنت على مدار الأسبوع.",
            },
            socialMedia: [
              { platform: "Facebook", label: "ScholarHub", icon: "facebook", url: "https://facebook.com/scholarhub" },
              { platform: "Twitter / X", label: "@ScholarHub", icon: "twitter", url: "https://twitter.com/scholarhub" },
              { platform: "LinkedIn", label: "ScholarHub", icon: "linkedin", url: "https://linkedin.com/company/scholarhub" },
              { platform: "Instagram", label: "@scholarhub", icon: "instagram", url: "https://instagram.com/scholarhub" },
              { platform: "YouTube", label: "ScholarHub", icon: "youtube", url: "https://youtube.com/@scholarhub" },
            ],
            faq: [
              { question: "ما هو وقت الاستجابة المتوقع؟", answer: "نرد على معظم الاستفسارات خلال 24 ساعة في أيام العمل. الاستفسارات التقنية الطارئة تُعالج خلال 12 ساعة." },
              { question: "كيف يمكنني الإبلاغ عن منحة احتيالية؟", answer: "يُرجى مراسلتنا على support@scholarhub.com مع ذكر اسم المنحة ورابطها. نتعامل مع هذه البلاغات بأعلى أولوية." },
              { question: "هل يمكنني طلب شراكة مؤسسية مع ScholarHub؟", answer: "نعم، يُرجى مراسلتنا على professors@scholarhub.com مع وصف مختصر عن مؤسستك واهتمامك بالشراكة." },
              { question: "كيف أحذف حسابي؟", answer: "يمكنك طلب حذف حسابك بمراسلتنا على privacy@scholarhub.com. ستُعالَج طلبات الحذف خلال 30 يوماً." },
            ],
            contactFormNote: "يمكنك أيضاً ملء نموذج التواصل أدناه وسنرد عليك في أقرب وقت ممكن. تأكد من تقديم بريد إلكتروني صحيح لنتمكن من الرد عليك.",
          },
          en: {
            lang: "en",
            direction: "ltr",
            intro: "We're happy to hear from you. Whether you're a student looking for help with a scholarship application, a professor wanting to post an opportunity, or just a user with a question — our team is always here.",
            contactMethods: [
              { id: "general-support", icon: "envelope", title: "General Support", description: "For general questions and platform assistance", email: "support@scholarhub.com", responseTime: "Within 24 hours" },
              { id: "scholarship-inquiries", icon: "academic-cap", title: "Scholarship Inquiries", description: "For questions about listed scholarships", email: "scholarships@scholarhub.com", responseTime: "Within 48 hours" },
              { id: "professor-support", icon: "user-group", title: "Professor & Institution Support", description: "For professors and institutions wanting to post scholarships", email: "professors@scholarhub.com", responseTime: "Within 24 hours" },
              { id: "technical-support", icon: "wrench", title: "Technical Support", description: "To report technical issues or platform bugs", email: "tech@scholarhub.com", responseTime: "Within 12 hours" },
              { id: "privacy", icon: "shield-check", title: "Privacy & Data", description: "For personal data requests and privacy policy inquiries", email: "privacy@scholarhub.com", responseTime: "Within 30 days" },
            ],
            officeInfo: {
              title: "ScholarHub Office",
              address: "Palestine — Gaza Strip",
              workingHours: [
                { days: "Sunday — Thursday", hours: "9:00 AM — 5:00 PM" },
                { days: "Friday — Saturday", hours: "Closed" },
              ],
              note: "Our support team operates online throughout the week.",
            },
            socialMedia: [
              { platform: "Facebook", label: "ScholarHub on Facebook", icon: "facebook", url: "https://facebook.com/scholarhub" },
              { platform: "Twitter / X", label: "@ScholarHub on Twitter", icon: "twitter", url: "https://twitter.com/scholarhub" },
              { platform: "LinkedIn", label: "ScholarHub on LinkedIn", icon: "linkedin", url: "https://linkedin.com/company/scholarhub" },
              { platform: "Instagram", label: "@scholarhub on Instagram", icon: "instagram", url: "https://instagram.com/scholarhub" },
              { platform: "YouTube", label: "ScholarHub on YouTube", icon: "youtube", url: "https://youtube.com/@scholarhub" },
            ],
            faq: [
              { question: "What is the expected response time?", answer: "We respond to most inquiries within 24 hours on business days. Urgent technical issues are handled within 12 hours." },
              { question: "How can I report a fraudulent scholarship?", answer: "Please contact us at support@scholarhub.com with the scholarship name and link. We treat these reports with the highest priority." },
              { question: "Can I request an institutional partnership with ScholarHub?", answer: "Yes, please email professors@scholarhub.com with a brief description of your institution and your interest in partnering." },
              { question: "How do I delete my account?", answer: "You can request account deletion by emailing privacy@scholarhub.com. Deletion requests are processed within 30 days." },
            ],
            contactFormNote: "You can also fill out the contact form below and we will get back to you as soon as possible. Make sure to provide a valid email address so we can reply.",
          },
        },
      },
    },
    create: {
      pageKey: "contact",
      section: "company",
      title: "اتصل بنا",
      subtitle: "نحن هنا للمساعدة",
      description: "هل لديك سؤال أو اقتراح؟ فريق الدعم لدينا جاهز للإجابة على استفساراتك.",
      heroText: "تواصل معنا",
      ctaLabel: "أرسل رسالة",
      ctaLink: "/contact",
      metaData: {
        lang: "ar",
        direction: "rtl",
      },
    },
  });
  console.log("  ✅ Full Contact page content seeded (Arabic)");

  // ==================== ABOUT US PAGE — FULL CONTENT (ARABIC) ====================
  console.log("Seeding full About Us page content (Arabic)...");
  await prisma.pageContent.upsert({
    where: { pageKey: "about-us" },
    update: {
      title: "من نحن",
      subtitle: "نربط الطلاب بفرص تُغيّر مساراتهم",
      description: "تأسّست ScholarHub بهدف جعل البحث عن المنح الدراسية في متناول كل طالب.",
      heroText: "مهمتنا، مستقبلك",
      ctaLabel: "تعرّف علينا أكثر",
      ctaLink: "/about",
      metaData: {
        defaultLang: "ar",
        translations: {
          ar: {
            lang: "ar",
            direction: "rtl",
            intro: "نحن في ScholarHub نؤمن بأن كل طالب يستحق الفرصة للوصول إلى التعليم الجيد، بصرف النظر عن مكان نشأته أو إمكاناته المادية. لذلك بنينا هذه المنصة.",
            sections: [
              { id: "mission", title: "مهمتنا", content: "مهمة ScholarHub هي تبسيط رحلة اكتشاف المنح الدراسية للطلاب في كل مكان — خاصةً أولئك في البلدان النامية الذين يفتقرون إلى الوصول الفعّال إلى المعلومات. نسعى إلى أن تكون منصتنا الوجهة الأولى لكل طالب طموح يبحث عن تمويل لدراسته." },
              { id: "vision", title: "رؤيتنا", content: "نتخيّل عالماً لا تكون فيه الفرص التعليمية مقيّدة بالجغرافيا أو الثروة. رؤيتنا هي بناء أكبر وأدق منصة عربية وعالمية لاكتشاف المنح الدراسية، مع تقديم إرشاد شخصي لكل طالب بحسب ملفه الأكاديمي وأهدافه." },
              { id: "story", title: "قصتنا", content: "وُلدت ScholarHub من تجربة شخصية. حين حاول مؤسسوها التقدم لمنح دراسية للدراسة في الخارج، وجدوا أن المعلومات مبعثرة، والمواقع معقدة، والإرشاد غائب. قرروا أن يبنوا ما كانوا يتمنون وجوده — منصة واضحة، موثوقة، وسهلة الاستخدام." },
              { id: "what-we-offer", title: "ما نقدمه", items: [
                { icon: "search", heading: "قاعدة بيانات شاملة", text: "آلاف المنح الدراسية من جميع أنحاء العالم، مُحدَّثة باستمرار ومُصنَّفة بدقة." },
                { icon: "filter", heading: "بحث ذكي ومتقدم", text: "فلاتر متعددة تشمل الدولة، المجال، درجة الدراسة، نوع التمويل، واللغة." },
                { icon: "bookmark", heading: "حفظ وتتبع", text: "احفظ المنح التي تهمك وتابع مواعيد تقديمها من لوحة تحكم شخصية." },
                { icon: "document-text", heading: "أدلة وإرشادات", text: "مقالات ومرشدات من خبراء تساعدك في كتابة السيرة الذاتية والمقالة الشخصية وخطاب التوصية." },
                { icon: "bell", heading: "إشعارات المواعيد", text: "تنبيهات تلقائية قبل انتهاء مواعيد التقديم حتى لا تفوّتك أي فرصة." },
                { icon: "academic-cap", heading: "منح مُتحقّق منها", text: "جميع المنح المنشورة تمر بمراجعة إدارية للتأكد من صحتها وصلاحيتها." },
              ]},
              { id: "who-we-serve", title: "من نخدم", items: [
                { heading: "الطلاب", text: "من يبحثون عن منح للبكالوريوس أو الماجستير أو الدكتوراه أو البحث العلمي في أي دولة." },
                { heading: "الأساتذة والمؤسسات", text: "من يرغبون في نشر فرص منح دراسية مدعومة للوصول إلى أوسع شريحة من المرشحين المؤهلين." },
                { heading: "المرشدون الأكاديميون", text: "من يدعمون الطلاب في رحلتهم ويحتاجون إلى مصدر موثوق للمعلومات." },
              ]},
              { id: "values", title: "قيمنا", items: [
                { heading: "الشفافية", text: "نعرض المعلومات كاملةً وصادقةً دون إخفاء شروط أو تضليل." },
                { heading: "الوصول الشامل", text: "المنصة مجانية للطلاب دائماً. نؤمن بأن المعلومات حق وليست امتيازاً." },
                { heading: "الجودة", text: "نفضّل الجودة على الكمية — منحة واحدة دقيقة خير من عشرة غير موثوقة." },
                { heading: "المجتمع", text: "نبني مجتمعاً من الطلاب والأساتذة يدعم بعضه البعض في مسيرة التعلم." },
              ]},
              { id: "team", title: "فريقنا", content: "يتكون فريق ScholarHub من مطورين وأكاديميين ومتخصصين في التعليم يجمعهم شغف واحد: جعل التعليم العالي في متناول الجميع. فريقنا موزّع في أكثر من دولة، يعمل عن بُعد ويؤمن بالتنوع والشمول." },
              { id: "contact", title: "تواصل معنا", content: "هل لديك سؤال أو اقتراح؟ يسعدنا الاستماع إليك.", contact: { email: "hello@scholarhub.com", supportEmail: "support@scholarhub.com", website: "https://scholarhub.com/contact" } },
            ],
            stats: [
              { label: "منحة دراسية", value: "1,000+" },
              { label: "طالب مسجّل", value: "5,000+" },
              { label: "دولة مُغطّاة", value: "80+" },
              { label: "أستاذ وشريك مؤسسي", value: "200+" },
            ],
          },
          en: {
            lang: "en",
            direction: "ltr",
            intro: "At ScholarHub, we believe every student deserves the opportunity to access quality education, regardless of where they come from or their financial situation. That is why we built this platform.",
            sections: [
              { id: "mission", title: "Our Mission", content: "ScholarHub's mission is to simplify the scholarship discovery journey for students everywhere — especially those in developing countries who lack effective access to information. We aim to be the first destination for every ambitious student seeking funding for their studies." },
              { id: "vision", title: "Our Vision", content: "We envision a world where educational opportunities are not limited by geography or wealth. Our vision is to build the largest and most accurate global platform for scholarship discovery, with personalized guidance for every student based on their academic profile and goals." },
              { id: "story", title: "Our Story", content: "ScholarHub was born from a personal experience. When our founders tried to apply for scholarships to study abroad, they found information scattered, websites complex, and guidance absent. They decided to build what they wished had existed — a clear, reliable, and easy-to-use platform." },
              { id: "what-we-offer", title: "What We Offer", items: [
                { icon: "search", heading: "Comprehensive Database", text: "Thousands of scholarships from around the world, continuously updated and accurately categorized." },
                { icon: "filter", heading: "Smart Advanced Search", text: "Multiple filters including country, field of study, degree level, funding type, and language." },
                { icon: "bookmark", heading: "Save & Track", text: "Save scholarships you're interested in and track their deadlines from a personal dashboard." },
                { icon: "document-text", heading: "Guides & Resources", text: "Expert articles and guides helping you write your CV, personal statement, and recommendation letters." },
                { icon: "bell", heading: "Deadline Reminders", text: "Automatic alerts before application deadlines so you never miss an opportunity." },
                { icon: "academic-cap", heading: "Verified Scholarships", text: "All published scholarships go through administrative review to verify their authenticity and validity." },
              ]},
              { id: "who-we-serve", title: "Who We Serve", items: [
                { heading: "Students", text: "Those seeking scholarships for Bachelor's, Master's, PhD, or research programs in any country." },
                { heading: "Professors & Institutions", text: "Those wanting to post funded scholarship opportunities to reach the widest pool of qualified candidates." },
                { heading: "Academic Advisors", text: "Those supporting students on their journey who need a reliable source of information." },
              ]},
              { id: "values", title: "Our Values", items: [
                { heading: "Transparency", text: "We present information completely and honestly, without hiding terms or misleading users." },
                { heading: "Universal Access", text: "The platform is always free for students. We believe information is a right, not a privilege." },
                { heading: "Quality", text: "We prefer quality over quantity — one accurate scholarship is better than ten unreliable ones." },
                { heading: "Community", text: "We build a community of students and professors who support each other in their learning journey." },
              ]},
              { id: "team", title: "Our Team", content: "ScholarHub is made up of developers, academics, and education specialists united by a shared passion: making higher education accessible to everyone. Our team is spread across multiple countries, works remotely, and believes in diversity and inclusion." },
              { id: "contact", title: "Contact Us", content: "Have a question or suggestion? We'd love to hear from you.", contact: { email: "hello@scholarhub.com", supportEmail: "support@scholarhub.com", website: "https://scholarhub.com/contact" } },
            ],
            stats: [
              { label: "Scholarships", value: "1,000+" },
              { label: "Registered Students", value: "5,000+" },
              { label: "Countries Covered", value: "80+" },
              { label: "Professors & Partners", value: "200+" },
            ],
          },
        },
      },
    },
    create: {
      pageKey: "about-us",
      section: "company",
      title: "من نحن",
      subtitle: "نربط الطلاب بفرص تُغيّر مساراتهم",
      description: "تأسّست ScholarHub بهدف جعل البحث عن المنح الدراسية في متناول كل طالب.",
      heroText: "مهمتنا، مستقبلك",
      ctaLabel: "تعرّف علينا أكثر",
      ctaLink: "/about",
      metaData: { lang: "ar", direction: "rtl" },
    },
  });
  console.log("  ✅ Full About Us page content seeded (Arabic)");

  // ==================== FOOTER CONFIG ====================
  console.log("Seeding Footer configuration content...");
  await prisma.pageContent.upsert({
    where: { pageKey: "footer" },
    update: {
      title: "تذييل الصفحة",
      subtitle: "روابط التنقل والمعلومات التذييلية",
      description: "إعدادات وتكوين تذييل الصفحة الرئيسية.",
      heroText: "",
      metaData: {
        lang: "ar",
        direction: "rtl",
        logo: {
          src: "/images/logo.png",
          alt: "ScholarHub",
          width: 140,
          height: 40,
        },
        tagline: "منصتك لاكتشاف المنح الدراسية",
        description: "ScholarHub تربط الطلاب الطموحين بآلاف فرص المنح الدراسية حول العالم. ابحث، احفظ، وتقدم — كل ذلك في مكان واحد.",
        columns: [
          {
            id: "platform",
            title: "المنصة",
            links: [
              { label: "تصفّح المنح الدراسية", href: "/scholarships" },
              { label: "المنح المحفوظة",        href: "/saved" },
              { label: "التصنيفات",             href: "/categories" },
              { label: "المواعيد القادمة",       href: "/scholarships?sort=deadline" },
              { label: "المنح المميزة",          href: "/scholarships?featured=true" },
            ],
          },
          {
            id: "resources",
            title: "الموارد",
            links: [
              { label: "أدلة التقديم",    href: "/resources/guides" },
              { label: "نصائح وإرشادات", href: "/resources/tips" },
              { label: "الأسئلة الشائعة", href: "/faq" },
              { label: "المدوّنة",        href: "/blog" },
            ],
          },
          {
            id: "company",
            title: "الشركة",
            titleType: "image",
            logo: "/images/logo.png",
            links: [
              { label: "من نحن",           href: "/about" },
              { label: "اتصل بنا",         href: "/contact" },
              { label: "سياسة الخصوصية",   href: "/privacy-policy" },
              { label: "شروط الخدمة",      href: "/terms-of-service" },
            ],
          },
          {
            id: "account",
            title: "الحساب",
            links: [
              { label: "تسجيل الدخول",  href: "/login" },
              { label: "إنشاء حساب",    href: "/register" },
              { label: "لوحة التحكم",   href: "/dashboard" },
              { label: "ملفي الشخصي",   href: "/profile" },
            ],
          },
        ],
        socialMedia: [
          { platform: "Facebook",  icon: "facebook",  url: "https://facebook.com/scholarhub",          label: "ScholarHub على فيسبوك" },
          { platform: "Twitter",   icon: "twitter",   url: "https://twitter.com/scholarhub",           label: "@ScholarHub على تويتر" },
          { platform: "LinkedIn",  icon: "linkedin",  url: "https://linkedin.com/company/scholarhub",  label: "ScholarHub على لينكدإن" },
          { platform: "Instagram", icon: "instagram", url: "https://instagram.com/scholarhub",         label: "@scholarhub على إنستغرام" },
          { platform: "YouTube",   icon: "youtube",   url: "https://youtube.com/@scholarhub",          label: "ScholarHub على يوتيوب" },
        ],
        legalLinks: [
          { label: "سياسة الخصوصية",              href: "/privacy-policy" },
          { label: "شروط الخدمة",                  href: "/terms-of-service" },
          { label: "سياسة ملفات تعريف الارتباط",  href: "/cookies" },
        ],
        copyright: "© 2026 ScholarHub. جميع الحقوق محفوظة.",
        newsletter: {
          title: "اشترك في نشرتنا البريدية",
          description: "احصل على آخر فرص المنح الدراسية مباشرةً في بريدك الإلكتروني.",
          placeholder: "أدخل بريدك الإلكتروني",
          buttonLabel: "اشترك الآن",
        },
      },
    },
    create: {
      pageKey: "footer",
      section: "layout",
      title: "تذييل الصفحة",
      subtitle: "روابط التنقل والمعلومات التذييلية",
      description: "إعدادات وتكوين تذييل الصفحة الرئيسية.",
      heroText: "",
      metaData: { lang: "ar", direction: "rtl" },
    },
  });
  console.log("  ✅ Footer configuration content seeded");

  // ==================== CREATE FAQ ITEMS ====================
  console.log("\nCreating FAQ items...");

  // Clear existing FAQ items before re-seeding to avoid duplicates
  await prisma.faqItem.deleteMany({ where: { pageKey: "faq" } });

  const faqItems = [
    { pageKey: "faq", question: "How do I apply for a scholarship on ScholarHub?", answer: "Browse available scholarships, click on one that matches your profile, and follow the application link to the provider's official website. You can also save scholarships to apply later.", order: 1 },
    { pageKey: "faq", question: "Is ScholarHub free to use?", answer: "Yes, ScholarHub is completely free for students. We believe access to scholarship information should not cost anything.", order: 2 },
    { pageKey: "faq", question: "How are scholarships verified on ScholarHub?", answer: "All scholarships are reviewed by our team of professors and administrators before being published. We check for legitimacy, completeness, and accuracy of the information provided.", order: 3 },
    { pageKey: "faq", question: "Can I submit my own scholarship listing?", answer: "Yes, registered professors can submit scholarship listings. All submissions go through an approval process by our admin team before being made public.", order: 4 },
    { pageKey: "faq", question: "How do I save a scholarship for later?", answer: "Click the Save button on any scholarship card or detail page. Saved scholarships appear in your Saved Scholarships section in your dashboard.", order: 5 },
    { pageKey: "faq", question: "What documents do I typically need for scholarship applications?", answer: "Common documents include academic transcripts, passport or ID, letters of recommendation, a statement of purpose, proof of language proficiency, and a CV. Specific requirements vary by scholarship.", order: 6 },
  ];

  for (const item of faqItems) {
    await prisma.faqItem.create({ data: item });
    console.log(`  ✅ FAQ item #${item.order}`);
  }

  // ==================== CREATE BLOG POSTS ====================
  console.log("\nCreating blog posts...");

  const blogPosts = [
    // ── GUIDES ──────────────────────────────────────────────────────────────
    {
      slug: "complete-guide-to-scholarship-applications-2026",
      title: "The Complete Guide to Scholarship Applications in 2026",
      excerpt: "Everything you need to know to find, prepare, and submit a winning scholarship application — from start to finish.",
      content: `## Introduction

Applying for scholarships can feel overwhelming, but with the right strategy it becomes manageable. This guide walks you through every stage of the process.

## Step 1 — Find the Right Scholarships

Use ScholarHub's filters to narrow down opportunities by:
- **Degree level** (Bachelor, Master, PhD)
- **Field of study**
- **Country of destination**
- **Funding type** (Full, Partial, Tuition only)

Save scholarships that match your profile so you can track their deadlines.

## Step 2 — Check Eligibility Before Applying

Read the eligibility requirements carefully before investing time in an application. Key things to verify:
- Nationality and residency requirements
- Minimum GPA or academic standing
- Language proficiency requirements (IELTS, TOEFL, etc.)
- Age limits (some scholarships have maximum age requirements)

## Step 3 — Prepare Your Documents Early

Most scholarships require a standard set of documents. Prepare these in advance:
- **Academic transcripts** — certified and translated if required
- **Passport or national ID** — valid for the duration of study
- **CV / Resume** — academic and professional achievements
- **Letters of recommendation** — request these 4–6 weeks in advance
- **Language certificates** — IELTS, TOEFL, DELF, etc.
- **Statement of purpose / Motivation letter**

## Step 4 — Write a Compelling Personal Statement

Your personal statement is your opportunity to stand out. Be specific, tell a story, and connect your past experience to your future goals. Avoid generic statements.

## Step 5 — Submit Before the Deadline

Missing a deadline means starting over. Create calendar reminders 2 weeks and 3 days before each deadline. Submit early to allow time to fix any technical issues.

## Final Checklist

- [ ] All required documents attached
- [ ] Personal statement proofread by at least two people
- [ ] Correct scholarship program selected
- [ ] Application submitted before the deadline`,
      authorName: "Admin User",
      tags: ["guide", "application", "tips", "how-to"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-05"),
    },
    {
      slug: "how-to-write-a-winning-scholarship-essay",
      title: "How to Write a Winning Scholarship Essay",
      excerpt: "Practical tips from scholarship winners and academic advisors on crafting a compelling personal statement that stands out from thousands of applications.",
      content: `## Why the Essay Matters

For most scholarships, the personal statement or motivation letter is the single most important part of your application. Grades get you through the door — your essay determines if you win.

## Structure of a Strong Essay

### Opening — Hook the Reader
Start with a specific moment, challenge, or insight that shaped your academic journey. Avoid opening with "My name is..." or "I am applying for...".

**Weak:** "I am applying for this scholarship because I want to study engineering."

**Strong:** "The day our village lost power for three weeks was the day I decided to become an electrical engineer."

### Body — Show, Don't Tell
Use concrete examples from your life. Instead of saying "I am hardworking," describe a project where you stayed up three nights to meet a deadline and what you learned from it.

Cover three things:
1. **Where you come from** — your background and context
2. **Where you are** — your current academic achievements and goals
3. **Where you are going** — your vision and how this scholarship gets you there

### Closing — Connect to the Scholarship
End by clearly connecting your goals to what the scholarship specifically offers. Show you have researched the program and know why this one — not just any scholarship — is right for you.

## Common Mistakes to Avoid

- **Too generic** — could have been written by anyone
- **Repeating your CV** — the essay should add new information
- **Exceeding the word limit** — shows inability to follow instructions
- **Poor grammar** — use Grammarly and have a native speaker review it
- **Lack of structure** — paragraphs should flow logically

## Revision Process

1. Write a first draft without editing
2. Leave it for 24 hours
3. Revise for content and structure
4. Ask a professor or mentor to review
5. Do a final proofread for grammar and spelling`,
      authorName: "Admin User",
      tags: ["essay", "writing", "personal statement", "guide", "tips"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-12"),
    },
    {
      slug: "how-to-get-strong-letters-of-recommendation",
      title: "How to Get Strong Letters of Recommendation",
      excerpt: "A step-by-step guide to requesting, preparing for, and following up on letters of recommendation that genuinely strengthen your application.",
      content: `## Why Recommendation Letters Matter

Scholarship committees use recommendation letters to verify claims you make in your personal statement and to hear an independent voice about your character and ability.

## Who Should You Ask?

The best recommenders are people who:
- Know you well academically or professionally
- Have supervised your work directly
- Can speak to specific achievements and qualities
- Hold credible positions (professor, supervisor, mentor)

**Avoid** asking people simply because they have impressive titles but barely know you.

## How to Ask — Step by Step

### 1. Ask Early (at least 4–6 weeks before the deadline)
Give your recommenders plenty of time. Asking at the last minute puts them in a difficult position and results in weaker letters.

### 2. Ask in Person or via Email
For professors: visit during office hours or send a polite email. Explain which scholarship you are applying for and why you are asking them specifically.

### 3. Provide a "Recommender Package"
Make it easy for your recommender to write a strong letter by providing:
- Your CV
- Your personal statement draft
- The scholarship description and requirements
- Specific achievements you'd like them to mention
- Submission deadline and instructions

## Following Up

Send a polite reminder one week before the deadline. After the scholarship process, always thank your recommenders regardless of the outcome — they invested time in supporting you.

## What Makes a Strong Letter?

- Specific examples of your work and character
- Comparative language ("Among the top 5% of students I have taught...")
- Evidence of your potential for future success
- A clear endorsement from the recommender`,
      authorName: "Admin User",
      tags: ["recommendation letter", "guide", "application tips"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-18"),
    },

    // ── SCHOLARSHIP LISTS ────────────────────────────────────────────────────
    {
      slug: "top-scholarships-for-stem-students-2026",
      title: "Top 10 Scholarships for STEM Students in 2026",
      excerpt: "A curated list of the most prestigious and well-funded scholarships available to science, technology, engineering, and mathematics students this year.",
      content: `## Why STEM Scholarships Are Competitive

STEM scholarships attract thousands of applicants because they offer generous funding and strong career prospects. Standing out requires both academic excellence and a compelling story.

## The Top 10

### 1. Fulbright Foreign Student Program (USA)
One of the most prestigious scholarships in the world. Covers full tuition, living expenses, and health insurance for graduate study in the United States. Open to students from over 160 countries.

**Funding:** Full scholarship | **Level:** Master, PhD | **Deadline:** Varies by country

### 2. DAAD Scholarships (Germany)
Germany's premier scholarship for international students. STEM students particularly benefit from Germany's world-class engineering and natural sciences programs — many tuition-free.

**Funding:** Monthly stipend + travel allowance | **Level:** All levels | **Deadline:** Varies by program

### 3. Chevening Scholarships (UK)
The UK government's flagship scholarship. Highly competitive and highly regarded. Covers full tuition, living costs, and flights.

**Funding:** Full scholarship | **Level:** Master | **Deadline:** November each year

### 4. Erasmus Mundus Joint Masters (EU)
Study at two or three European universities and earn a joint degree. STEM programs are among the most popular.

**Funding:** Full scholarship + travel | **Level:** Master | **Deadline:** January–March

### 5. MEXT Scholarship (Japan)
Japan's government scholarship for undergraduate and graduate study. Excellent for engineering, robotics, and technology students.

**Funding:** Full scholarship | **Level:** Bachelor, Master, PhD | **Deadline:** May–June

### 6. Gates Cambridge Scholarship (UK)
Full funding for graduate study at the University of Cambridge. Extremely selective — only ~90 scholars per year worldwide.

**Funding:** Full scholarship | **Level:** Master, PhD | **Deadline:** October

### 7. Turkish Scholarships (Türkiye Burslari)
Full government scholarship covering tuition, accommodation, health insurance, and a monthly stipend. Strong STEM programs in engineering and computer science.

**Funding:** Full scholarship | **Level:** Bachelor, Master, PhD | **Deadline:** February

### 8. Chinese Government Scholarship (CSC)
One of the largest scholarship programs in the world. China has invested heavily in engineering and technology education.

**Funding:** Full scholarship | **Level:** All levels | **Deadline:** March–April

### 9. Korea Government Scholarship Program (KGSP)
Covers tuition, accommodation, living allowance, and Korean language training. Excellent for engineering and IT students.

**Funding:** Full scholarship | **Level:** Bachelor, Master, PhD | **Deadline:** February–March

### 10. Swedish Institute Scholarships
Full funding for master's study in Sweden — a global leader in innovation, sustainability, and technology.

**Funding:** Full scholarship | **Level:** Master | **Deadline:** February

## Application Tips

- Start researching 12–18 months before you want to begin studying
- Apply to 5–8 scholarships to increase your chances
- Tailor each application to the specific scholarship's values and priorities`,
      authorName: "Admin User",
      tags: ["STEM", "scholarship list", "2026", "engineering", "science", "technology"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-22"),
    },
    {
      slug: "top-scholarships-for-arts-humanities-students-2026",
      title: "Best Scholarships for Arts & Humanities Students in 2026",
      excerpt: "Comprehensive list of scholarships available for students studying literature, history, philosophy, fine arts, languages, and other humanities disciplines.",
      content: `## Arts & Humanities Scholarships: More Than You Think

Many students believe scholarship funding is concentrated in STEM fields. This is a myth. Arts and humanities students have access to a wide range of prestigious funding opportunities.

## Top Scholarships

### 1. Rhodes Scholarship (Oxford)
The oldest and most celebrated international scholarship. Open to all fields including arts, humanities, and social sciences. Covers full costs at Oxford University.

**Funding:** Full scholarship | **Level:** Graduate | **Deadline:** August–October

### 2. Fulbright Scholar Program
Fulbright actively supports humanities research and arts study. Many past Fulbright scholars are writers, historians, and cultural researchers.

**Funding:** Full scholarship | **Level:** Graduate, Research | **Deadline:** Varies by country

### 3. Chevening Scholarships
No field restrictions. History, literature, international relations, and journalism are popular among Chevening scholars.

**Funding:** Full scholarship | **Level:** Master | **Deadline:** November

### 4. DAAD Scholarships for Arts & Humanities
Germany has exceptional programs in history, philosophy, German studies, and fine arts. DAAD provides funding for all these areas.

**Funding:** Monthly stipend | **Level:** All levels | **Deadline:** Varies

### 5. French Government Scholarship (Eiffel Program)
France is the global heart of art, philosophy, and culture. The Eiffel scholarship supports top international students in humanities and social sciences.

**Funding:** Monthly stipend + allowances | **Level:** Master, PhD | **Deadline:** January

## How to Stand Out as a Humanities Applicant

- Demonstrate deep engagement with your subject through publications, projects, or community work
- Show how your research or creative work addresses real-world questions
- Connect your work to the values of the scholarship program (cultural exchange, global leadership, etc.)`,
      authorName: "Admin User",
      tags: ["arts", "humanities", "scholarship list", "2026", "literature", "history"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-28"),
    },
    {
      slug: "fully-funded-scholarships-no-gpa-requirement-2026",
      title: "Fully Funded Scholarships With No GPA Requirement in 2026",
      excerpt: "Not all scholarships require a perfect GPA. Here are legitimate, prestigious fully funded opportunities that focus on leadership, potential, and character.",
      content: `## Beyond GPA: Scholarships That See the Whole Person

A common misconception is that only students with 4.0 GPAs win scholarships. While academic performance matters, many prestigious scholarships place equal or greater emphasis on leadership, community impact, and potential.

## Scholarships That Don't Require a Minimum GPA

### 1. Chevening Scholarships (UK)
Chevening does not publish a minimum GPA. Selection is based on leadership potential, networking ability, and career plans. Many successful scholars had average academic records but exceptional life stories.

### 2. Erasmus Mundus
Selection criteria vary by program consortium. Many programs weight research experience and motivation more heavily than GPA.

### 3. Aga Khan Foundation International Scholarship
Designed for students from developing countries who demonstrate financial need and strong character. Academic performance is considered but not the only factor.

### 4. Joint Japan/World Bank Graduate Scholarship
Designed for mid-career professionals. Work experience and leadership potential are prioritized over academic grades.

### 5. Commonwealth Scholarships
Focus on development impact and potential contribution to home country. Leadership and community work can outweigh GPA.

## How to Compensate for a Lower GPA

1. **Strong personal statement** — explain any academic challenges honestly and show growth
2. **Exceptional recommendation letters** — a professor who knows you well can vouch for your potential
3. **Relevant work or research experience** — shows practical capability beyond grades
4. **Community involvement** — leadership roles, volunteering, social impact projects
5. **Upward trajectory** — if your later grades are better than early ones, highlight that trend

## Be Honest

Never fabricate or exaggerate your GPA. Scholarship committees verify academic records and any dishonesty results in permanent disqualification.`,
      authorName: "Admin User",
      tags: ["fully funded", "no GPA", "scholarship list", "leadership", "guide"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-02-03"),
    },

    // ── EXPERT ADVICE ────────────────────────────────────────────────────────
    {
      slug: "understanding-scholarship-eligibility-requirements",
      title: "Understanding Scholarship Eligibility Requirements",
      excerpt: "A practical guide to decoding eligibility criteria and quickly identifying which scholarships you actually qualify for — saving hours of wasted effort.",
      content: `## Why Eligibility Matters First

Many students spend weeks on applications only to discover they were never eligible. Always check eligibility before writing a single word of your personal statement.

## The Main Eligibility Categories

### 1. Nationality and Residency
This is usually the first filter. Most government scholarships require you to be a citizen or permanent resident of a specific country. Some scholarships exclude citizens of certain countries. Read this section first.

### 2. Academic Level
Scholarships specify whether they fund Bachelor, Master, PhD, Postdoc, or Research study. Applying for the wrong level wastes your time and theirs.

### 3. Field of Study
Some scholarships are open to any field. Others restrict applications to specific disciplines (e.g., STEM only, public policy only, agriculture only). Check if your planned major is eligible.

### 4. GPA and Academic Standing
Many scholarships require a minimum GPA or class standing. Some specify "upper third of graduating class" or equivalent. Understand how your GPA converts to the required scale.

### 5. Age Limits
Government scholarships often have maximum age requirements (e.g., under 35 for graduate study). Check this before investing time in an application.

### 6. Language Proficiency
Most English-medium programs require IELTS (typically 6.0–7.0) or TOEFL. Some accept Duolingo English Test. Check the specific score requirement and whether your existing certificate is still valid (most expire after 2 years).

### 7. Employment Status
Some scholarships (especially those for mid-career professionals) require a minimum number of years of work experience. Others prohibit applicants who are already enrolled in a degree program.

## Build Your Eligibility Checklist

Before starting any application, create a checklist:

| Criterion | Requirement | Do I Qualify? |
|-----------|-------------|---------------|
| Nationality | Jordanian / Palestinian | ✅ |
| Degree level | Master | ✅ |
| Field | Computer Science | ✅ |
| GPA | Min 3.0 / 4.0 | ✅ 3.4 |
| Age | Max 35 | ✅ |
| Language | IELTS 6.5 | ✅ 7.0 |

## When You're "Almost" Eligible

If you meet 5 out of 6 criteria, do not apply. Scholarship committees are strict. Focus your energy on scholarships where you meet all requirements.`,
      authorName: "Admin User",
      tags: ["eligibility", "guide", "tips", "requirements"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-02-08"),
    },
    {
      slug: "scholarship-interview-preparation-guide",
      title: "How to Prepare for a Scholarship Interview",
      excerpt: "Once shortlisted, the interview is your final hurdle. Learn how to prepare, what questions to expect, and how to present yourself with confidence.",
      content: `## Congratulations — You Have Been Shortlisted

Being invited to a scholarship interview means your application impressed the committee. Now you need to convert that shortlist into a win.

## Common Interview Formats

- **Panel interview** — 3–5 committee members asking questions (most common)
- **One-on-one interview** — single interviewer, more conversational
- **Group assessment** — you and other candidates discuss a topic together
- **Online video interview** — via Zoom or Teams, increasingly common since 2020

## Questions You Will Almost Certainly Be Asked

### About You
- "Tell us about yourself."
- "Why did you choose this field of study?"
- "What is your greatest academic achievement?"

### About the Scholarship
- "Why did you apply for this scholarship specifically?"
- "What do you know about our program?"
- "How does this scholarship align with your career goals?"

### About Your Future
- "What do you plan to do after completing your studies?"
- "How will you contribute to your home country?"
- "Where do you see yourself in 10 years?"

### Challenging Questions
- "What is your greatest weakness?"
- "Tell us about a failure and what you learned from it."
- "Why should we choose you over other candidates?"

## How to Prepare

### 1. Research the Scholarship Deeply
Know the program's history, values, notable alumni, and mission. Show you have done your homework.

### 2. Practice Out Loud
Thinking your answers is not the same as saying them. Practice with a friend, record yourself, or use a mirror. Focus on clarity and conciseness.

### 3. Prepare STAR Stories
For behavioral questions, use the STAR method:
- **S**ituation — describe the context
- **T**ask — what you needed to do
- **A**ction — what you did
- **R**esult — what happened as a result

### 4. Prepare Questions to Ask
Asking thoughtful questions shows genuine interest. Try:
- "What do the most successful scholars in your program have in common?"
- "What opportunities exist for scholars to connect with alumni?"

## Interview Day Tips

- Dress professionally (even for online interviews)
- Arrive or log in 10 minutes early
- Maintain eye contact and speak at a measured pace
- Listen carefully before answering — it is okay to take a moment to think
- Send a thank-you email within 24 hours of the interview`,
      authorName: "Admin User",
      tags: ["interview", "preparation", "tips", "expert advice"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-02-12"),
    },
    {
      slug: "how-to-build-a-strong-cv-for-scholarship-applications",
      title: "How to Build a Strong CV for Scholarship Applications",
      excerpt: "Your CV is often the first document reviewers look at. Learn what to include, how to format it, and what scholarship committees actually look for.",
      content: `## Scholarship CVs vs Job CVs

A scholarship CV is different from a job application CV. Scholarship committees want to see academic achievements, research experience, publications, language skills, and community involvement — not just work history.

## Essential Sections

### 1. Personal Information
Name, email, nationality, and date of birth. Keep it simple. No photo unless specifically requested.

### 2. Education
List your degrees in reverse chronological order. Include:
- Institution name and location
- Degree and field of study
- Dates (start – end or expected)
- GPA (if strong — above 3.0/4.0 or equivalent)
- Thesis title if relevant

### 3. Academic Achievements and Awards
List scholarships, honors, prizes, and distinctions. This section is often what differentiates competitive applicants.

### 4. Research Experience
If you have conducted research (undergraduate thesis, lab work, research assistantship), describe it briefly with outcomes and supervisor name.

### 5. Publications and Presentations
Even a conference presentation or co-authored paper strengthens your application significantly.

### 6. Work Experience
Focus on positions that show leadership, teaching, or research skills. A research assistant or teaching assistant role is more relevant than unrelated part-time work.

### 7. Volunteer and Community Work
Scholarship committees — especially for programs like Chevening and Fulbright — value social impact and leadership. Include meaningful volunteer roles.

### 8. Language Skills
List all languages with your proficiency level (Native, Fluent, Intermediate, Basic) and any certifications (IELTS, TOEFL, DELF, Goethe).

### 9. Technical Skills
Relevant software, programming languages, laboratory techniques, or tools.

### 10. References
"References available upon request" or list 2 references with their name, title, institution, and email.

## Formatting Rules

- **Length:** 2 pages maximum for most scholarships
- **Font:** Clean, readable font (Calibri, Garamond, or similar), 11–12pt
- **Margins:** Standard (2.5cm / 1 inch)
- **File format:** PDF unless specified otherwise
- **Consistency:** Same formatting throughout — no mixing of bullet styles

## What to Avoid

- Photographs (unless specifically requested)
- Personal information like marital status or religion (unless required)
- Unrelated work history that doesn't add value
- Spelling or grammar errors — always proofread`,
      authorName: "Admin User",
      tags: ["CV", "resume", "guide", "expert advice", "application tips"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-02-15"),
    },
    {
      slug: "scholarship-application-timeline-12-month-plan",
      title: "The 12-Month Scholarship Application Timeline",
      excerpt: "A month-by-month plan to help you prepare, research, and submit scholarship applications well ahead of deadlines — with nothing left to chance.",
      content: `## Why Planning Ahead Wins Scholarships

The students who win competitive scholarships rarely start preparing two weeks before the deadline. The best applications are built over months of research, drafting, and refinement.

## Your 12-Month Plan

### Months 12–10 Before Deadline: Research Phase
- Identify 10–15 scholarships that match your profile
- Create a spreadsheet tracking: name, deadline, eligibility, required documents, status
- Research each scholarship's values, past scholars, and selection criteria
- Begin improving areas of weakness (language scores, GPA, extracurriculars)

### Months 9–8: Document Preparation
- Request official transcripts from your institution
- Begin studying for language tests (IELTS, TOEFL) if needed
- Update your CV with all recent achievements
- Identify potential recommenders and inform them of your plans

### Months 7–6: First Drafts
- Write first drafts of your personal statement / motivation letter
- Ask recommenders formally — provide them with your CV and scholarship info
- Have transcripts certified and translated if required

### Months 5–4: Revision and Feedback
- Revise personal statements based on feedback from professors and mentors
- Confirm recommenders are on track with their letters
- Complete any outstanding documents (language certificates, etc.)

### Months 3–2: Final Preparation
- Final proofreading of all written materials
- Ensure all documents are in the correct format and within page/word limits
- Prepare for potential interviews — practice common questions

### Month 1: Submission
- Submit applications at least one week before the deadline
- Confirm receipt of all submitted materials
- Follow up with recommenders if their letters have not been submitted

### After Submission
- Track application status
- Prepare for interviews if shortlisted
- Continue applying to other scholarships — do not wait for one result

## Key Principles

1. **Apply to multiple scholarships** — 5–10 is ideal
2. **Tailor each application** — never submit the same essay twice
3. **Meet every deadline** — late applications are never accepted
4. **Keep records** — save copies of everything you submit`,
      authorName: "Admin User",
      tags: ["timeline", "planning", "guide", "application tips", "expert advice"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-02-18"),
    },

    // ── DRAFT (coming soon) ──────────────────────────────────────────────────
    {
      slug: "scholarships-for-refugees-and-displaced-students-2026",
      title: "Scholarships for Refugees and Displaced Students in 2026",
      excerpt: "A dedicated resource listing scholarships specifically designed for refugees, asylum seekers, and students affected by conflict or displacement.",
      content: `## Education as a Path to Stability

For students affected by conflict or displacement, scholarships are not just about career advancement — they can be life-changing. Many organizations have created dedicated funding streams for this group.

## Key Scholarships

### UNHCR / Albert Einstein German Academic Refugee Initiative (DAFI)
Provides funding for refugees registered with UNHCR to pursue undergraduate education in their country of asylum.

### Scholars at Risk Network
Connects threatened scholars with host institutions worldwide that can provide safety and support.

### Institute of International Education — Scholar Rescue Fund
Emergency fellowships for academics whose lives or work are threatened.

### Chevening — Conflict, Stability and Security Fund
Specific Chevening tracks for citizens of conflict-affected countries.

### MPOWER Financing
Loans and scholarships for international students including refugees studying in the US and Canada.

## How to Apply as a Displaced Student

- UNHCR registration document is often required as proof of refugee status
- Explain your situation clearly and factually in your personal statement
- Seek support from NGOs in your area who can assist with applications

*This article is being expanded with more programs and application guidance. Check back soon for the complete version.*`,
      authorName: "Admin User",
      tags: ["refugees", "displaced students", "scholarship list", "2026", "humanitarian"],
      status: "DRAFT" as const,
      publishedAt: null,
    },
  ];

  // ── Cover images (Picsum.photos — consistent per seed keyword) ──────────────
  const coverImages: Record<string, string> = {
    "complete-guide-to-scholarship-applications-2026":
      "https://picsum.photos/seed/scholarship-guide/800/450",
    "how-to-write-a-winning-scholarship-essay":
      "https://picsum.photos/seed/essay-writing/800/450",
    "how-to-get-strong-letters-of-recommendation":
      "https://picsum.photos/seed/recommendation-letter/800/450",
    "top-scholarships-for-stem-students-2026":
      "https://picsum.photos/seed/stem-science/800/450",
    "top-scholarships-for-arts-humanities-students-2026":
      "https://picsum.photos/seed/arts-humanities/800/450",
    "fully-funded-scholarships-no-gpa-requirement-2026":
      "https://picsum.photos/seed/funded-scholarship/800/450",
    "understanding-scholarship-eligibility-requirements":
      "https://picsum.photos/seed/eligibility-study/800/450",
    "scholarship-interview-preparation-guide":
      "https://picsum.photos/seed/interview-prep/800/450",
    "how-to-build-a-strong-cv-for-scholarship-applications":
      "https://picsum.photos/seed/resume-cv/800/450",
    "scholarship-application-timeline-12-month-plan":
      "https://picsum.photos/seed/timeline-plan/800/450",
    "scholarships-for-refugees-and-displaced-students-2026":
      "https://picsum.photos/seed/refugees-students/800/450",
  };

  for (const post of blogPosts) {
    const coverImage = coverImages[post.slug] ?? null;
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { coverImage },
      create: { ...post, authorId: admin.id, coverImage },
    });
    console.log(`  ✅ Blog Post: ${post.title}`);
  }

  console.log("\n✨ All data seeded successfully!\n");

  console.log("📋 TEST CREDENTIALS:");
  console.log("   🔑 Admin:     admin@scholarhub.com / Admin@123");
  console.log("   👨‍🏫 Professor: professor@university.edu / Prof@123");
  console.log("   👩‍🎓 Student:   student@example.com / Student@123\n");

  console.log("📊 SEEDED DATA:");
  console.log("   ✅ 3 Users (Admin, Professor, Student)");
  console.log("   ✅ 8 Categories");
  console.log("   ✅ 6 Scholarships");
  console.log("   ✅ 4 Testimonials");
  console.log("   ✅ 2 Applications");
  console.log("   ✅ 3 Saved Scholarships");
  console.log("   ✅ 2 Notifications");
  console.log("   ✅ 14 Page Content entries (incl. full Privacy Policy, Terms of Service, About Us & Footer config)");
  console.log("   ✅ 6 FAQ Items");
  console.log("   ✅ 10 Blog Posts (9 published, 1 draft)\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
