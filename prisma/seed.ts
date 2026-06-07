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
      firstName: "المسؤول",
      lastName: "العام",
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
      firstName: "د. أحمد",
      lastName: "حسن",
      role: UserRole.PROFESSOR,
      isEmailVerified: true,
      professorProfile: {
        create: {
          institution: "جامعة غزة",
          department: "علوم الحاسوب",
          position: "أستاذ مشارك",
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
      firstName: "سارة",
      lastName: "محمد",
      role: UserRole.STUDENT,
      isEmailVerified: true,
      studentProfile: {
        create: {
          university: "جامعة غزة",
          fieldOfStudy: "علوم الحاسوب",
          currentDegree: DegreeLevel.BACHELOR,
          gpa: 3.8,
          graduationYear: 2026,
          country: "فلسطين",
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
      defaultLanguage: "ar",
      timezone: "UTC",
      registrationEnabled: true,
      requireEmailVerification: true,
      maxFileSizeMB: 10,
      allowedFileTypes: [],
      // Site
      siteName: "ScholarHub",
      siteDescription: "نربط الطلاب بفرص المنح الدراسية حول العالم.",
      contactEmail: "admin@scholarhub.com",
      maintenanceMode: false,
      maintenanceMessage: "نحن حالياً في وضع الصيانة. يُرجى العودة قريباً.",
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
      metaTitle: "ScholarHub - ابحث عن المنح الدراسية للطلاب حول العالم",
      metaDescription: "تساعد ScholarHub الطلاب حول العالم على اكتشاف فرص المنح الدراسية والوصول إليها لتحقيق النمو الأكاديمي والمهني.",
      ogTitle: "ScholarHub - ابحث عن المنح الدراسية للطلاب حول العالم",
      ogDescription: "نُمكّن الطلاب حول العالم من اكتشاف فرص المنح الدراسية للنمو الأكاديمي والمهني.",
      twitterCard: "summary_large_image",
      robotsMeta: "index, follow",
      // Footer
      footerText: "نربط الطلاب بفرص المنح الدراسية حول العالم.",
      copyrightText: "© 2026 ScholarHub. جميع الحقوق محفوظة.",
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
      defaultLanguage: "ar",
      timezone: "UTC",
      registrationEnabled: true,
      requireEmailVerification: true,
      maxFileSizeMB: 10,
      allowedFileTypes: [],
      siteName: "ScholarHub",
      siteDescription: "نربط الطلاب بفرص المنح الدراسية حول العالم.",
      contactEmail: "admin@scholarhub.com",
      maintenanceMode: false,
      maintenanceMessage: "نحن حالياً في وضع الصيانة. يُرجى العودة قريباً.",
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
      metaTitle: "ScholarHub - ابحث عن المنح الدراسية للطلاب حول العالم",
      metaDescription: "تساعد ScholarHub الطلاب حول العالم على اكتشاف فرص المنح الدراسية والوصول إليها لتحقيق النمو الأكاديمي والمهني.",
      ogTitle: "ScholarHub - ابحث عن المنح الدراسية للطلاب حول العالم",
      ogDescription: "نُمكّن الطلاب حول العالم من اكتشاف فرص المنح الدراسية للنمو الأكاديمي والمهني.",
      twitterCard: "summary_large_image",
      robotsMeta: "index, follow",
      footerText: "نربط الطلاب بفرص المنح الدراسية حول العالم.",
      copyrightText: "© 2026 ScholarHub. جميع الحقوق محفوظة.",
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
      name: "العلوم والتكنولوجيا",
      slug: "stem",
      description: "العلوم والتكنولوجيا والهندسة والرياضيات",
      icon: "🔬",
      color: "#3B82F6",
    },
    {
      name: "الفنون والعلوم الإنسانية",
      slug: "arts-humanities",
      description: "الفنون والأدب والتاريخ والفلسفة",
      icon: "🎨",
      color: "#8B5CF6",
    },
    {
      name: "إدارة الأعمال",
      slug: "business",
      description: "إدارة الأعمال والإدارة والاقتصاد",
      icon: "💼",
      color: "#10B981",
    },
    {
      name: "الطب والصحة",
      slug: "medicine-health",
      description: "العلوم الطبية والصحية",
      icon: "⚕️",
      color: "#EF4444",
    },
    {
      name: "العلوم الاجتماعية",
      slug: "social-sciences",
      description: "علم النفس وعلم الاجتماع والعلوم السياسية",
      icon: "🌍",
      color: "#F59E0B",
    },
    {
      name: "الهندسة",
      slug: "engineering",
      description: "جميع التخصصات الهندسية",
      icon: "⚙️",
      color: "#6366F1",
    },
    {
      name: "القانون",
      slug: "law",
      description: "الدراسات القانونية",
      icon: "⚖️",
      color: "#78716C",
    },
    {
      name: "التربية والتعليم",
      slug: "education",
      description: "التدريس والتعليم",
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
      title: "برنامج فولبرايت للطلاب الأجانب",
      description:
        "برنامج فولبرايت هو البرنامج الدولي الرائد للتبادل التعليمي الذي ترعاه الحكومة الأمريكية. يوفر تمويلاً لطلاب الدراسات العليا والمهنيين الشباب والفنانين للدراسة أو إجراء البحوث أو تدريس اللغة الإنجليزية في الولايات المتحدة.",
      organization: "وزارة الخارجية الأمريكية",
      country: "الولايات المتحدة",
      fieldOfStudy: ["جميع التخصصات"],
      degreeLevel: [DegreeLevel.MASTER, DegreeLevel.PHD],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-05-15"),
      applicationLink: "https://foreign.fulbrightonline.org/",
      requirements:
        "درجة البكالوريوس، إتقان اللغة الإنجليزية، سجل أكاديمي قوي",
      eligibility:
        "متاحة لجميع الجنسيات. يُشجَّع الطلاب الفلسطينيون على التقديم.",
      benefits:
        "الرسوم الدراسية، نفقات المعيشة، التأمين الصحي، تذاكر السفر ذهاباً وإياباً",
      isFeatured: true,
    },
    {
      title: "منح تشيفنينغ",
      description:
        "منح تشيفنينغ هي البرنامج العالمي للمنح الدراسية للحكومة البريطانية، الممول من وزارة الخارجية والكومنولث والتنمية والمنظمات الشريكة.",
      organization: "الحكومة البريطانية",
      country: "المملكة المتحدة",
      fieldOfStudy: ["جميع التخصصات"],
      degreeLevel: [DegreeLevel.MASTER],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-11-01"),
      applicationLink: "https://www.chevening.org/",
      requirements:
        "خبرة عمل سنتين، درجة البكالوريوس، إتقان اللغة الإنجليزية",
      eligibility:
        "مواطنو الدول المؤهلة لتشيفنينغ بما في ذلك فلسطين",
      benefits:
        "الرسوم الجامعية، راتب شهري، تكاليف السفر، بدل الوصول",
      isFeatured: true,
    },
    {
      title: "منح DAAD الألمانية",
      description:
        "تقدم DAAD (الهيئة الألمانية للتبادل الأكاديمي) منحاً دراسية للطلاب الدوليين لمتابعة دراسات الماجستير أو الدكتوراه في أفضل الجامعات الألمانية.",
      organization: "الهيئة الألمانية للتبادل الأكاديمي",
      country: "ألمانيا",
      fieldOfStudy: ["جميع التخصصات"],
      degreeLevel: [DegreeLevel.MASTER, DegreeLevel.PHD],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-10-15"),
      applicationLink: "https://www.daad.de/",
      requirements:
        "درجة البكالوريوس، التميز الأكاديمي، إتقان اللغة",
      eligibility: "متاحة للخريجين من جميع الدول",
      benefits: "مدفوعات شهرية، بدل سفر، تأمين صحي",
      isFeatured: true,
    },
    {
      title: "المنح التركية (Türkiye Burslari)",
      description:
        "برنامج منح دراسية شامل من جمهورية تركيا للطلاب الدوليين.",
      organization: "جمهورية تركيا",
      country: "تركيا",
      fieldOfStudy: ["جميع التخصصات"],
      degreeLevel: [DegreeLevel.BACHELOR, DegreeLevel.MASTER, DegreeLevel.PHD],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-02-20"),
      applicationLink: "https://turkiyeburslari.gov.tr/",
      requirements:
        "التميز الأكاديمي، شروط العمر تختلف حسب الدرجة الدراسية",
      eligibility: "غير المواطنين الأتراك، بما فيهم الفلسطينيون",
      benefits:
        "الرسوم الدراسية، السكن، راتب شهري، دورة لغة تركية، تأمين صحي",
      isFeatured: false,
    },
    {
      title: "ماجستير إيراسموس موندوس المشترك",
      description:
        "برامج ماجستير متكاملة عالية المستوى تقدمها تحالفات من مؤسسات التعليم العالي في جميع أنحاء أوروبا وما وراءها.",
      organization: "الاتحاد الأوروبي",
      country: "أوروبا",
      fieldOfStudy: ["تخصصات متنوعة"],
      degreeLevel: [DegreeLevel.MASTER],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-01-30"),
      applicationLink: "https://erasmus-plus.ec.europa.eu/",
      requirements:
        "درجة البكالوريوس، إتقان اللغة الإنجليزية، شروط خاصة بالبرنامج",
      eligibility: "متاحة للطلاب حول العالم",
      benefits: "الرسوم الدراسية، السفر، نفقات المعيشة، تكاليف الإقامة",
      isFeatured: false,
    },
    {
      title: "منحة MEXT اليابانية",
      description:
        "منحة من الحكومة اليابانية للطلاب الدوليين الراغبين في الدراسة بالجامعات اليابانية.",
      organization: "الحكومة اليابانية",
      country: "اليابان",
      fieldOfStudy: ["جميع التخصصات"],
      degreeLevel: [DegreeLevel.BACHELOR, DegreeLevel.MASTER, DegreeLevel.PHD],
      fundingType: FundingType.FULL,
      deadline: new Date("2026-04-15"),
      applicationLink: "https://www.studyinjapan.go.jp/",
      requirements:
        "شروط العمر، التميز الأكاديمي، الشروط الصحية",
      eligibility: "مواطنو الدول التي لها علاقات دبلوماسية مع اليابان",
      benefits: "إعفاء من الرسوم الدراسية، بدل شهري، تكاليف السفر",
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
        "التعليم هو أقوى سلاح يمكنك استخدامه لتغيير العالم.",
      author: "نيلسون مانديلا",
      role: "قائد عالمي وصاحب رؤية",
      gradient: "from-emerald-400 to-blue-500",
    },
    {
      quote:
        "الشيء الجميل في التعلم أن لا أحد يستطيع أن ينتزعه منك.",
      author: "بي. بي. كينغ",
      role: "فنان أسطوري",
      gradient: "from-amber-400 to-rose-500",
    },
    {
      quote:
        "استثمر في نفسك. التعليم يدفع أفضل عائد لمسيرتك المهنية المستقبلية.",
      author: "بنجامين فرانكلين",
      role: "موسوعي ورجل دولة",
      gradient: "from-blue-400 to-indigo-600",
    },
    {
      quote:
        "المنحة الدراسية هي المفتاح الذي يفتح أبواب الفرصة والتميز.",
      author: "المجلس الأكاديمي",
      role: "فلسفة ScholarHub",
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
    where: { title: "برنامج فولبرايت للطلاب الأجانب" },
  });

  const chevenigScholarship = await prisma.scholarship.findFirst({
    where: { title: "منح تشيفنينغ" },
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
            "أنا شغوفة بمواصلة دراستي في علوم الحاسوب للمساهمة في الابتكار التكنولوجي في فلسطين. سيوفر لي برنامج فولبرايت فرصاً تعليمية عالمية المستوى وتبادلاً ثقافياً سيشكّل مسيرتي المهنية.",
          documents: [
            "جواز السفر",
            "كشف الدرجات",
            "خطاب توصية",
            "بيان الغرض",
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
            "أهدف إلى متابعة درجة الماجستير في علوم الحاسوب في جامعة بريطانية مرموقة لتطوير مهارات تقنية متقدمة والمساهمة في الابتكار.",
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
      title: "تحديث حالة الطلب",
      message:
        "تم نقل طلب فولبرايت الخاص بك إلى مرحلة المراجعة. تحقق قريباً لمعرفة آخر التحديثات.",
      type: "application_update",
      link: `/applications/${student.id}`,
      isRead: false,
    },
  });
  console.log(`  ✅ Notification: Application Update`);

  await prisma.notification.create({
    data: {
      userId: professor.id,
      title: "تم التحقق من الحساب",
      message:
        "تم التحقق من حساب الأستاذ الخاص بك. يمكنك الآن نشر المنح الدراسية.",
      type: "system",
      isRead: false,
    },
  });
  console.log(`  ✅ Notification: Professor Verification`);

  // ==================== CREATE PAGE CONTENT ====================
  console.log("\nCreating page content...");

  const pageContents = [
    { pageKey: "browse-scholarships", section: "platform", title: "تصفّح المنح الدراسية", subtitle: "اكتشف آلاف المنح الدراسية المُصمَّمة خصيصاً لك", description: "ابحث وفلتر قاعدة بياناتنا الشاملة للمنح الدراسية من حول العالم.", heroText: "ابحث عن منحتك الدراسية المثالية", ctaLabel: "ابدأ التصفّح", ctaLink: "/scholarships" },
    { pageKey: "saved-scholarships", section: "platform", title: "المنح المحفوظة", subtitle: "قائمتك الشخصية المختصرة للمنح الدراسية", description: "تابع المنح الدراسية التي تهمك. احفظها وارجع إليها في أي وقت قبل مواعيد التقديم.", heroText: "قائمة أمنياتك من المنح", ctaLabel: "عرض المحفوظات", ctaLink: "/saved" },
    { pageKey: "categories", section: "platform", title: "تصنيفات المنح الدراسية", subtitle: "تصفّح حسب مجال الدراسة", description: "استكشف المنح الدراسية مُصنَّفةً حسب التخصص الأكاديمي.", heroText: "ابحث عن المنح حسب التصنيف", ctaLabel: "استكشف التصنيفات", ctaLink: "/categories" },
    { pageKey: "upcoming-deadlines", section: "platform", title: "المواعيد القادمة", subtitle: "لا تفوّت أي موعد تقديم لمنحة دراسية", description: "كن على اطلاع دائم بطلباتك مع متتبع المواعيد لدينا.", heroText: "تصرّف قبل نفاد الوقت", ctaLabel: "عرض المواعيد", ctaLink: "/scholarships?sort=deadline" },
    { pageKey: "application-guides", section: "resources", title: "أدلة التقديم", subtitle: "إرشاد خطوة بخطوة لتقديم ناجح", description: "تأخذك أدلتنا الشاملة في كل مرحلة من مراحل عملية التقديم على المنح الدراسية.", heroText: "أتقن عملية التقديم", ctaLabel: "اقرأ الأدلة", ctaLink: "/resources/guides" },
    { pageKey: "tips-tricks", section: "resources", title: "نصائح وحيل", subtitle: "نصائح الخبراء لتعزيز طلباتك", description: "تعلّم من الفائزين بالمنح الدراسية والمستشارين الأكاديميين.", heroText: "احصل على الميزة التنافسية", ctaLabel: "اقرأ النصائح", ctaLink: "/resources/tips" },
    { pageKey: "faq", section: "resources", title: "الأسئلة الشائعة", subtitle: "إجابات لأكثر أسئلتك شيوعاً", description: "اعثر على إجابات للأسئلة الشائعة حول المنح الدراسية وعملية التقديم.", heroText: "لدينا الإجابات", ctaLabel: "عرض الأسئلة الشائعة", ctaLink: "/faq" },
    { pageKey: "blog", section: "resources", title: "مدوّنة ScholarHub", subtitle: "رؤى وقصص وأخبار المنح الدراسية", description: "ابقَ على اطلاع بأحدث مقالاتنا حول فرص المنح الدراسية، وقصص نجاح الطلاب، والنصائح الأكاديمية.", heroText: "قصص تُلهم", ctaLabel: "اقرأ المدوّنة", ctaLink: "/blog" },
    { pageKey: "about-us", section: "company", title: "عن ScholarHub", subtitle: "نربط الطلاب بفرص تُغيّر مساراتهم", description: "تأسست ScholarHub بمهمة جعل البحث عن المنح الدراسية في متناول كل طالب.", heroText: "مهمتنا، مستقبلك", ctaLabel: "تعرّف علينا أكثر", ctaLink: "/about" },
    { pageKey: "contact", section: "company", title: "اتصل بنا", subtitle: "نحن هنا للمساعدة", description: "هل لديك أسئلة أو ملاحظات؟ فريق الدعم لدينا جاهز لمساعدتك.", heroText: "تواصل معنا", ctaLabel: "أرسل رسالة", ctaLink: "/contact" },
    { pageKey: "privacy-policy", section: "company", title: "سياسة الخصوصية", subtitle: "كيف نحمي بياناتك", description: "تلتزم ScholarHub بحماية معلوماتك الشخصية.", heroText: "خصوصيتك تهمنا" },
    { pageKey: "terms-of-service", section: "company", title: "شروط الخدمة", subtitle: "القواعد التي تحكم منصتنا", description: "باستخدامك لـ ScholarHub فإنك توافق على هذه الشروط.", heroText: "شروط عادلة للجميع" },
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
    { pageKey: "faq", question: "كيف أتقدّم لمنحة دراسية على ScholarHub؟", answer: "تصفّح المنح الدراسية المتاحة، واضغط على المنحة التي تناسب ملفك، واتبع رابط التقديم إلى الموقع الرسمي للجهة المانحة. يمكنك أيضاً حفظ المنح للتقديم عليها لاحقاً.", order: 1 },
    { pageKey: "faq", question: "هل استخدام ScholarHub مجاني؟", answer: "نعم، ScholarHub مجانية تماماً للطلاب. نؤمن بأن الوصول إلى معلومات المنح الدراسية يجب ألا يكلف شيئاً.", order: 2 },
    { pageKey: "faq", question: "كيف يتم التحقق من المنح الدراسية على ScholarHub؟", answer: "تتم مراجعة جميع المنح الدراسية من قِبَل فريقنا من الأساتذة والمشرفين قبل نشرها. نتحقق من الشرعية والاكتمال ودقة المعلومات المقدّمة.", order: 3 },
    { pageKey: "faq", question: "هل يمكنني تقديم منحة دراسية خاصة بي؟", answer: "نعم، يمكن للأساتذة المسجّلين تقديم قوائم منح دراسية. تمر جميع التقديمات بعملية موافقة من قِبَل فريق الإدارة قبل نشرها للعامة.", order: 4 },
    { pageKey: "faq", question: "كيف أحفظ منحة دراسية لوقت لاحق؟", answer: "اضغط على زر الحفظ على أي بطاقة منحة دراسية أو صفحة تفاصيل. تظهر المنح المحفوظة في قسم 'المنح المحفوظة' في لوحة التحكم الخاصة بك.", order: 5 },
    { pageKey: "faq", question: "ما الوثائق التي أحتاجها عادةً للتقديم على المنح الدراسية؟", answer: "تشمل الوثائق الشائعة كشوف الدرجات الأكاديمية، جواز السفر أو الهوية، خطابات التوصية، بيان الغرض، إثبات إتقان اللغة، والسيرة الذاتية. تختلف المتطلبات المحددة حسب المنحة.", order: 6 },
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
      title: "الدليل الشامل للتقديم على المنح الدراسية في 2026",
      excerpt: "كل ما تحتاج معرفته للبحث عن منحة دراسية، والتحضير لها، وتقديم طلب فائز — من البداية إلى النهاية.",
      content: `## مقدمة

قد يبدو التقديم على المنح الدراسية مرهقاً، ولكن باستراتيجية صحيحة يصبح أمراً يمكن التحكم فيه. يأخذك هذا الدليل خلال كل مرحلة من مراحل العملية.

## الخطوة 1 — ابحث عن المنح الدراسية المناسبة

استخدم فلاتر ScholarHub لتضييق نطاق الفرص حسب:
- **المرحلة الدراسية** (بكالوريوس، ماجستير، دكتوراه)
- **مجال الدراسة**
- **دولة الوجهة**
- **نوع التمويل** (كامل، جزئي، رسوم دراسية فقط)

احفظ المنح الدراسية التي تتناسب مع ملفك حتى تتمكن من تتبع مواعيدها النهائية.

## الخطوة 2 — تحقق من الأهلية قبل التقديم

اقرأ شروط الأهلية بعناية قبل استثمار الوقت في طلب. الأشياء الرئيسية التي يجب التحقق منها:
- متطلبات الجنسية والإقامة
- الحد الأدنى للمعدل التراكمي أو المستوى الأكاديمي
- متطلبات إتقان اللغة (IELTS، TOEFL، إلخ.)
- حدود السن (بعض المنح لها حد أقصى للسن)

## الخطوة 3 — جهّز وثائقك مبكراً

تتطلب معظم المنح الدراسية مجموعة قياسية من الوثائق. جهّز هذه مسبقاً:
- **كشوف الدرجات الأكاديمية** — موثّقة ومترجمة إذا لزم الأمر
- **جواز السفر أو الهوية الوطنية** — صالحة طوال مدة الدراسة
- **السيرة الذاتية** — الإنجازات الأكاديمية والمهنية
- **خطابات التوصية** — اطلبها قبل 4 إلى 6 أسابيع
- **شهادات اللغة** — IELTS، TOEFL، DELF، إلخ.
- **بيان الغرض / خطاب الدافع**

## الخطوة 4 — اكتب بياناً شخصياً مقنعاً

بيانك الشخصي هو فرصتك لتبرز. كن محدداً، احكِ قصة، واربط تجربتك السابقة بأهدافك المستقبلية. تجنّب البيانات العامة.

## الخطوة 5 — قدّم قبل الموعد النهائي

تفويت موعد نهائي يعني البدء من جديد. أنشئ تذكيرات في التقويم قبل أسبوعين و3 أيام من كل موعد. قدّم مبكراً لإتاحة الوقت لإصلاح أي مشاكل تقنية.

## قائمة التحقق النهائية

- [ ] جميع الوثائق المطلوبة مرفقة
- [ ] تمت مراجعة البيان الشخصي من قبل شخصين على الأقل
- [ ] تم اختيار برنامج المنحة الدراسية الصحيح
- [ ] تم تقديم الطلب قبل الموعد النهائي`,
      authorName: "المسؤول العام",
      tags: ["دليل", "تقديم", "نصائح", "إرشادات"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-05"),
    },
    {
      slug: "how-to-write-a-winning-scholarship-essay",
      title: "كيف تكتب مقالة منحة دراسية فائزة",
      excerpt: "نصائح عملية من الفائزين بالمنح الدراسية والمستشارين الأكاديميين حول صياغة بيان شخصي مقنع يبرز من بين آلاف الطلبات.",
      content: `## لماذا تهم المقالة

بالنسبة لمعظم المنح الدراسية، يُعدّ البيان الشخصي أو خطاب الدافع الجزء الأهم في طلبك. الدرجات تفتح لك الباب — مقالتك تحدد ما إذا كنت ستفوز.

## بنية المقالة القوية

### الافتتاحية — اجذب القارئ
ابدأ بلحظة محددة، أو تحدٍّ، أو رؤية شكّلت رحلتك الأكاديمية. تجنّب الافتتاح بـ "اسمي..." أو "أتقدّم من أجل...".

**ضعيفة:** "أتقدّم لهذه المنحة لأنني أريد دراسة الهندسة."

**قوية:** "اليوم الذي فقدت فيه قريتنا الكهرباء لمدة ثلاثة أسابيع كان اليوم الذي قررت فيه أن أصبح مهندساً كهربائياً."

### الجسم — اعرض، لا تخبر
استخدم أمثلة ملموسة من حياتك. بدلاً من قول "أنا مجتهد"، صف مشروعاً سهرت فيه ثلاث ليالٍ لتلبية موعد نهائي وما تعلّمته منه.

غطِّ ثلاثة أشياء:
1. **من أين أتيت** — خلفيتك وسياقك
2. **أين أنت الآن** — إنجازاتك الأكاديمية الحالية وأهدافك
3. **إلى أين تتجه** — رؤيتك وكيف ستوصلك هذه المنحة إلى هناك

### الخاتمة — اربطها بالمنحة
اختم بربط أهدافك بوضوح بما تقدمه المنحة تحديداً. أظهر أنك بحثت عن البرنامج وتعرف لماذا هذه المنحة بالذات — وليس أي منحة أخرى — هي المناسبة لك.

## الأخطاء الشائعة التي يجب تجنبها

- **عامة جداً** — قد يكون كتبها أي شخص
- **تكرار سيرتك الذاتية** — يجب أن تضيف المقالة معلومات جديدة
- **تجاوز الحد الأقصى للكلمات** — يدل على عدم القدرة على اتباع التعليمات
- **القواعد الضعيفة** — استخدم Grammarly واطلب من متحدث أصلي مراجعتها
- **عدم وجود بنية** — يجب أن تتدفق الفقرات بشكل منطقي

## عملية المراجعة

1. اكتب مسودة أولى دون تحرير
2. اتركها 24 ساعة
3. راجعها للمحتوى والبنية
4. اطلب من أستاذ أو مرشد المراجعة
5. قم بمراجعة نهائية للقواعد والإملاء`,
      authorName: "المسؤول العام",
      tags: ["مقالة", "كتابة", "بيان شخصي", "دليل", "نصائح"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-12"),
    },
    {
      slug: "how-to-get-strong-letters-of-recommendation",
      title: "كيف تحصل على خطابات توصية قوية",
      excerpt: "دليل خطوة بخطوة لطلب خطابات التوصية والتحضير لها ومتابعتها بطريقة تعزّز طلبك بشكل حقيقي.",
      content: `## لماذا تهم خطابات التوصية

تستخدم لجان المنح الدراسية خطابات التوصية للتحقق من الادعاءات التي تذكرها في بيانك الشخصي ولسماع صوت مستقل عن شخصيتك وقدراتك.

## من يجب أن تطلب منه؟

أفضل الموصين هم الأشخاص الذين:
- يعرفونك جيداً أكاديمياً أو مهنياً
- أشرفوا على عملك مباشرة
- يمكنهم التحدث عن إنجازات وصفات محددة
- يشغلون مناصب موثوقة (أستاذ، مشرف، مرشد)

**تجنّب** طلبها من أشخاص بناءً فقط على ألقابهم الرنانة بينما لا يعرفونك جيداً.

## كيفية الطلب — خطوة بخطوة

### 1. اطلب مبكراً (قبل 4 إلى 6 أسابيع على الأقل من الموعد النهائي)
امنح موصيك وقتاً كافياً. الطلب في اللحظة الأخيرة يضعهم في موقف صعب ويؤدي إلى خطابات أضعف.

### 2. اطلب شخصياً أو عبر البريد الإلكتروني
للأساتذة: زرهم خلال ساعات العمل أو أرسل بريداً إلكترونياً مهذباً. اشرح لأي منحة تتقدم ولماذا تطلب منهم تحديداً.

### 3. قدّم "حزمة الموصي"
سهّل على موصيك كتابة خطاب قوي بتقديم:
- سيرتك الذاتية
- مسودة بيانك الشخصي
- وصف المنحة ومتطلباتها
- إنجازات محددة تود أن يذكروها
- الموعد النهائي للتقديم والتعليمات

## المتابعة

أرسل تذكيراً مهذباً قبل أسبوع من الموعد النهائي. بعد عملية المنحة، اشكر موصيك دائماً بصرف النظر عن النتيجة — لقد استثمروا وقتاً في دعمك.

## ما الذي يجعل الخطاب قوياً؟

- أمثلة محددة على عملك وشخصيتك
- لغة مقارنة ("من بين أفضل 5% من الطلاب الذين درّستهم...")
- دليل على إمكانياتك للنجاح المستقبلي
- توصية واضحة من الموصي`,
      authorName: "المسؤول العام",
      tags: ["خطاب توصية", "دليل", "نصائح التقديم"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-18"),
    },

    // ── SCHOLARSHIP LISTS ────────────────────────────────────────────────────
    {
      slug: "top-scholarships-for-stem-students-2026",
      title: "أفضل 10 منح دراسية لطلاب العلوم والتكنولوجيا في 2026",
      excerpt: "قائمة منتقاة لأكثر المنح الدراسية شهرةً وأفضلها تمويلاً المتاحة لطلاب العلوم والتكنولوجيا والهندسة والرياضيات هذا العام.",
      content: `## لماذا منح العلوم والتكنولوجيا تنافسية

تجذب منح العلوم والتكنولوجيا آلاف المتقدمين لأنها تقدم تمويلاً سخياً وآفاقاً مهنية قوية. التميّز يتطلب التفوق الأكاديمي وقصة مقنعة معاً.

## أفضل 10 منح

### 1. برنامج فولبرايت للطلاب الأجانب (الولايات المتحدة)
واحدة من أكثر المنح شهرةً في العالم. تغطي الرسوم الدراسية الكاملة، ونفقات المعيشة، والتأمين الصحي للدراسات العليا في الولايات المتحدة. متاحة لطلاب من أكثر من 160 دولة.

**التمويل:** منحة كاملة | **المستوى:** ماجستير، دكتوراه | **الموعد النهائي:** يختلف حسب الدولة

### 2. منح DAAD (ألمانيا)
المنحة الرائدة في ألمانيا للطلاب الدوليين. يستفيد طلاب العلوم والتكنولوجيا بشكل خاص من برامج الهندسة والعلوم الطبيعية الألمانية ذات المستوى العالمي — كثير منها بدون رسوم.

**التمويل:** راتب شهري + بدل سفر | **المستوى:** جميع المستويات | **الموعد النهائي:** يختلف حسب البرنامج

### 3. منح تشيفنينغ (المملكة المتحدة)
المنحة الرائدة للحكومة البريطانية. تنافسية للغاية ومحترمة جداً. تغطي الرسوم الكاملة، وتكاليف المعيشة، والسفر.

**التمويل:** منحة كاملة | **المستوى:** ماجستير | **الموعد النهائي:** نوفمبر من كل عام

### 4. ماجستير إيراسموس موندوس المشترك (الاتحاد الأوروبي)
ادرس في جامعتين أو ثلاث جامعات أوروبية واحصل على درجة مشتركة. برامج العلوم والتكنولوجيا من بين الأكثر شعبيةً.

**التمويل:** منحة كاملة + سفر | **المستوى:** ماجستير | **الموعد النهائي:** يناير–مارس

### 5. منحة MEXT (اليابان)
منحة الحكومة اليابانية للدراسة الجامعية والعليا. ممتازة لطلاب الهندسة والروبوتات والتكنولوجيا.

**التمويل:** منحة كاملة | **المستوى:** بكالوريوس، ماجستير، دكتوراه | **الموعد النهائي:** مايو–يونيو

### 6. منحة غيتس كامبريدج (المملكة المتحدة)
تمويل كامل للدراسات العليا في جامعة كامبريدج. انتقائية للغاية — حوالي 90 طالباً فقط سنوياً حول العالم.

**التمويل:** منحة كاملة | **المستوى:** ماجستير، دكتوراه | **الموعد النهائي:** أكتوبر

### 7. المنح التركية (Türkiye Burslari)
منحة حكومية كاملة تغطي الرسوم، والسكن، والتأمين الصحي، وراتب شهري. برامج علوم وتكنولوجيا قوية في الهندسة وعلوم الحاسوب.

**التمويل:** منحة كاملة | **المستوى:** بكالوريوس، ماجستير، دكتوراه | **الموعد النهائي:** فبراير

### 8. منحة الحكومة الصينية (CSC)
واحدة من أكبر برامج المنح الدراسية في العالم. استثمرت الصين بشكل كبير في تعليم الهندسة والتكنولوجيا.

**التمويل:** منحة كاملة | **المستوى:** جميع المستويات | **الموعد النهائي:** مارس–أبريل

### 9. برنامج المنح الكورية الحكومية (KGSP)
يغطي الرسوم، والسكن، وبدل المعيشة، والتدريب على اللغة الكورية. ممتاز لطلاب الهندسة وتكنولوجيا المعلومات.

**التمويل:** منحة كاملة | **المستوى:** بكالوريوس، ماجستير، دكتوراه | **الموعد النهائي:** فبراير–مارس

### 10. منح المعهد السويدي
تمويل كامل لدراسة الماجستير في السويد — رائدة عالمياً في الابتكار والاستدامة والتكنولوجيا.

**التمويل:** منحة كاملة | **المستوى:** ماجستير | **الموعد النهائي:** فبراير

## نصائح للتقديم

- ابدأ البحث قبل 12–18 شهراً من الموعد الذي تريد بدء الدراسة فيه
- تقدّم لـ 5–8 منح لزيادة فرصك
- خصّص كل طلب وفقاً لقيم وأولويات المنحة المحددة`,
      authorName: "المسؤول العام",
      tags: ["علوم وتكنولوجيا", "قائمة منح", "2026", "هندسة", "علوم", "تكنولوجيا"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-22"),
    },
    {
      slug: "top-scholarships-for-arts-humanities-students-2026",
      title: "أفضل المنح الدراسية لطلاب الفنون والعلوم الإنسانية في 2026",
      excerpt: "قائمة شاملة للمنح الدراسية المتاحة للطلاب الذين يدرسون الأدب والتاريخ والفلسفة والفنون الجميلة واللغات وغيرها من التخصصات الإنسانية.",
      content: `## منح الفنون والعلوم الإنسانية: أكثر مما تعتقد

يعتقد كثير من الطلاب أن تمويل المنح الدراسية يتركز في تخصصات العلوم والتكنولوجيا. هذه أسطورة. لدى طلاب الفنون والعلوم الإنسانية الوصول إلى مجموعة واسعة من فرص التمويل المرموقة.

## أفضل المنح

### 1. منحة رودس (أوكسفورد)
أقدم وأشهر منحة دراسية دولية. متاحة لجميع التخصصات بما فيها الفنون والعلوم الإنسانية والاجتماعية. تغطي التكاليف الكاملة في جامعة أوكسفورد.

**التمويل:** منحة كاملة | **المستوى:** دراسات عليا | **الموعد النهائي:** أغسطس–أكتوبر

### 2. برنامج فولبرايت للباحثين
يدعم فولبرايت بشكل فعال البحث في العلوم الإنسانية ودراسة الفنون. كثير من الباحثين السابقين في فولبرايت كتّاب ومؤرخون وباحثون ثقافيون.

**التمويل:** منحة كاملة | **المستوى:** دراسات عليا، بحث | **الموعد النهائي:** يختلف حسب الدولة

### 3. منح تشيفنينغ
لا توجد قيود على التخصصات. التاريخ والأدب والعلاقات الدولية والصحافة شائعة بين باحثي تشيفنينغ.

**التمويل:** منحة كاملة | **المستوى:** ماجستير | **الموعد النهائي:** نوفمبر

### 4. منح DAAD للفنون والعلوم الإنسانية
لدى ألمانيا برامج استثنائية في التاريخ والفلسفة والدراسات الألمانية والفنون الجميلة. تقدم DAAD التمويل لجميع هذه المجالات.

**التمويل:** راتب شهري | **المستوى:** جميع المستويات | **الموعد النهائي:** يختلف

### 5. منحة الحكومة الفرنسية (برنامج إيفل)
فرنسا هي القلب العالمي للفن والفلسفة والثقافة. تدعم منحة إيفل أفضل الطلاب الدوليين في العلوم الإنسانية والاجتماعية.

**التمويل:** راتب شهري + بدلات | **المستوى:** ماجستير، دكتوراه | **الموعد النهائي:** يناير

## كيف تتميّز كمتقدم في العلوم الإنسانية

- أظهر التزاماً عميقاً بموضوعك من خلال المنشورات أو المشاريع أو العمل المجتمعي
- أظهر كيف يعالج بحثك أو عملك الإبداعي قضايا واقعية
- اربط عملك بقيم برنامج المنحة (التبادل الثقافي، القيادة العالمية، إلخ.)`,
      authorName: "المسؤول العام",
      tags: ["فنون", "علوم إنسانية", "قائمة منح", "2026", "أدب", "تاريخ"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-01-28"),
    },
    {
      slug: "fully-funded-scholarships-no-gpa-requirement-2026",
      title: "منح ممولة بالكامل بدون اشتراط معدل تراكمي في 2026",
      excerpt: "ليست كل المنح الدراسية تتطلب معدلاً تراكمياً مثالياً. إليك فرصاً ممولة بالكامل، شرعية ومرموقة، تركز على القيادة والإمكانيات والشخصية.",
      content: `## أبعد من المعدل التراكمي: منح ترى الإنسان بالكامل

من المفاهيم الخاطئة الشائعة أن الطلاب ذوي المعدلات 4.0 فقط يفوزون بالمنح الدراسية. بينما يهم الأداء الأكاديمي، تضع كثير من المنح المرموقة وزناً مساوياً أو أكبر على القيادة والأثر المجتمعي والإمكانيات.

## منح لا تتطلب حداً أدنى للمعدل التراكمي

### 1. منح تشيفنينغ (المملكة المتحدة)
لا تنشر تشيفنينغ حداً أدنى للمعدل التراكمي. يستند الاختيار إلى الإمكانيات القيادية والقدرة على بناء الشبكات والخطط المهنية. كثير من الباحثين الناجحين كان لديهم سجلات أكاديمية متوسطة لكن قصص حياة استثنائية.

### 2. إيراسموس موندوس
تختلف معايير الاختيار حسب تحالف البرنامج. كثير من البرامج تعطي وزناً أكبر للخبرة البحثية والدافع من المعدل التراكمي.

### 3. منحة مؤسسة الآغا خان الدولية
مصممة للطلاب من الدول النامية الذين يثبتون الحاجة المالية والشخصية القوية. يُؤخذ الأداء الأكاديمي في الاعتبار لكنه ليس العامل الوحيد.

### 4. المنحة المشتركة لليابان والبنك الدولي للدراسات العليا
مصممة للمهنيين في منتصف المسيرة المهنية. تُعطى الأولوية لخبرة العمل والإمكانيات القيادية على الدرجات الأكاديمية.

### 5. منح الكومنولث
تركز على أثر التنمية والمساهمة المحتملة في البلد الأم. القيادة والعمل المجتمعي يمكن أن يفوقا المعدل التراكمي.

## كيف تعوّض عن معدل تراكمي منخفض

1. **بيان شخصي قوي** — اشرح أي تحديات أكاديمية بصدق وأظهر النمو
2. **خطابات توصية استثنائية** — أستاذ يعرفك جيداً يستطيع أن يضمن إمكانياتك
3. **خبرة عمل أو بحث ذات صلة** — تُظهر القدرة العملية بما يتجاوز الدرجات
4. **المشاركة المجتمعية** — أدوار قيادية، تطوع، مشاريع ذات أثر اجتماعي
5. **مسار صاعد** — إذا كانت درجاتك المتأخرة أفضل من المبكرة، أبرز هذا الاتجاه

## كن صادقاً

لا تختلق أو تبالغ في معدلك التراكمي أبداً. تتحقق لجان المنح الدراسية من السجلات الأكاديمية وأي عدم صدق يؤدي إلى الاستبعاد الدائم.`,
      authorName: "المسؤول العام",
      tags: ["تمويل كامل", "بدون معدل", "قائمة منح", "قيادة", "دليل"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-02-03"),
    },

    // ── EXPERT ADVICE ────────────────────────────────────────────────────────
    {
      slug: "understanding-scholarship-eligibility-requirements",
      title: "فهم شروط الأهلية للمنح الدراسية",
      excerpt: "دليل عملي لفك شفرة معايير الأهلية والتعرف بسرعة على المنح التي تستحقها فعلاً — يوفر عليك ساعات من الجهد الضائع.",
      content: `## لماذا الأهلية أولاً

يقضي كثير من الطلاب أسابيع على الطلبات ليكتشفوا أنهم لم يكونوا مؤهلين أصلاً. تحقق دائماً من الأهلية قبل كتابة كلمة واحدة من بيانك الشخصي.

## فئات الأهلية الرئيسية

### 1. الجنسية والإقامة
هذا عادةً هو الفلتر الأول. تتطلب معظم المنح الحكومية أن تكون مواطناً أو مقيماً دائماً في دولة محددة. تستثني بعض المنح مواطني دول معينة. اقرأ هذا القسم أولاً.

### 2. المستوى الأكاديمي
تحدد المنح ما إذا كانت تموّل البكالوريوس أم الماجستير أم الدكتوراه أم ما بعد الدكتوراه أم البحث. التقديم للمستوى الخاطئ يضيع وقتك ووقتهم.

### 3. مجال الدراسة
بعض المنح متاحة لأي مجال. تقصر منح أخرى الطلبات على تخصصات محددة (مثل العلوم والتكنولوجيا فقط، السياسة العامة فقط، الزراعة فقط). تحقق إذا كان تخصصك المخطط له مؤهلاً.

### 4. المعدل التراكمي والمستوى الأكاديمي
تتطلب كثير من المنح حداً أدنى للمعدل التراكمي أو ترتيباً معيناً في الفصل. تحدد بعضها "الثلث الأعلى من فصل التخرج" أو ما يعادله. افهم كيف يتحول معدلك التراكمي إلى المقياس المطلوب.

### 5. حدود السن
كثيراً ما تكون للمنح الحكومية حدود قصوى للسن (مثل دون 35 للدراسات العليا). تحقق من هذا قبل استثمار الوقت في طلب.

### 6. إتقان اللغة
تتطلب معظم البرامج باللغة الإنجليزية IELTS (عادةً 6.0–7.0) أو TOEFL. تقبل بعضها اختبار Duolingo. تحقق من متطلب الدرجة المحددة وما إذا كانت شهادتك الحالية لا تزال صالحة (تنتهي صلاحية معظمها بعد سنتين).

### 7. حالة التوظيف
تتطلب بعض المنح (خاصةً تلك المخصصة للمهنيين في منتصف المسيرة) حداً أدنى من سنوات الخبرة العملية. تحظر منح أخرى المتقدمين المسجلين بالفعل في برنامج درجة علمية.

## بناء قائمة التحقق من الأهلية

قبل البدء بأي طلب، أنشئ قائمة تحقق:

| المعيار | المتطلب | هل أنا مؤهل؟ |
|---------|---------|--------------|
| الجنسية | أردني / فلسطيني | ✅ |
| المرحلة الدراسية | ماجستير | ✅ |
| المجال | علوم الحاسوب | ✅ |
| المعدل التراكمي | حد أدنى 3.0 / 4.0 | ✅ 3.4 |
| السن | بحد أقصى 35 | ✅ |
| اللغة | IELTS 6.5 | ✅ 7.0 |

## عندما تكون "تقريباً" مؤهلاً

إذا استوفيت 5 من 6 معايير، لا تتقدم. لجان المنح الدراسية صارمة. ركّز طاقتك على المنح التي تستوفي فيها جميع المتطلبات.`,
      authorName: "المسؤول العام",
      tags: ["أهلية", "دليل", "نصائح", "متطلبات"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-02-08"),
    },
    {
      slug: "scholarship-interview-preparation-guide",
      title: "كيف تستعد لمقابلة منحة دراسية",
      excerpt: "بمجرد أن يتم اختيارك ضمن القائمة المختصرة، تكون المقابلة عقبتك الأخيرة. تعلّم كيف تستعد، وما الأسئلة المتوقعة، وكيف تقدّم نفسك بثقة.",
      content: `## تهانينا — تم اختيارك في القائمة المختصرة

دعوتك إلى مقابلة منحة دراسية تعني أن طلبك أبهر اللجنة. الآن عليك تحويل تلك القائمة المختصرة إلى فوز.

## أشكال المقابلات الشائعة

- **مقابلة لجنة** — 3 إلى 5 أعضاء لجنة يطرحون الأسئلة (الأكثر شيوعاً)
- **مقابلة فردية** — مُحاوِر واحد، أكثر طابعاً حوارياً
- **تقييم جماعي** — أنت ومرشحون آخرون تناقشون موضوعاً معاً
- **مقابلة فيديو عبر الإنترنت** — عبر Zoom أو Teams، شائعة بشكل متزايد منذ 2020

## الأسئلة التي ستُسأل عنها بشكل شبه مؤكد

### عنك
- "حدّثنا عن نفسك."
- "لماذا اخترت هذا المجال للدراسة؟"
- "ما أعظم إنجاز أكاديمي حققته؟"

### عن المنحة
- "لماذا تقدّمت لهذه المنحة بالتحديد؟"
- "ماذا تعرف عن برنامجنا؟"
- "كيف تتماشى هذه المنحة مع أهدافك المهنية؟"

### عن مستقبلك
- "ماذا تخطط أن تفعل بعد الانتهاء من دراستك؟"
- "كيف ستساهم في بلدك الأم؟"
- "أين ترى نفسك بعد 10 سنوات؟"

### الأسئلة الصعبة
- "ما أكبر نقاط ضعفك؟"
- "حدّثنا عن إخفاق وما تعلّمته منه."
- "لماذا يجب أن نختارك على المرشحين الآخرين؟"

## كيف تستعد

### 1. ابحث عن المنحة بعمق
اعرف تاريخ البرنامج وقيمه وخريجيه البارزين ورسالته. أظهر أنك قد قمت بواجبك.

### 2. تدرّب بصوت عالٍ
التفكير في الإجابات ليس مثل قولها. تدرّب مع صديق، سجّل نفسك، أو استخدم مرآة. ركّز على الوضوح والإيجاز.

### 3. حضّر قصص STAR
للأسئلة السلوكية، استخدم منهجية STAR:
- **S** الموقف — صف السياق
- **T** المهمة — ما الذي احتجت لفعله
- **A** الإجراء — ما الذي فعلته
- **R** النتيجة — ما الذي حدث نتيجةً لذلك

### 4. حضّر أسئلة لتطرحها
طرح أسئلة مدروسة يُظهر اهتماماً حقيقياً. جرّب:
- "ما القاسم المشترك بين أنجح الباحثين في برنامجكم؟"
- "ما الفرص المتاحة للباحثين للتواصل مع الخريجين؟"

## نصائح يوم المقابلة

- ارتدِ ملابس مهنية (حتى للمقابلات عبر الإنترنت)
- احضر أو سجّل دخولك قبل 10 دقائق
- حافظ على التواصل البصري وتحدّث بإيقاع متزن
- استمع جيداً قبل الإجابة — لا بأس بأخذ لحظة للتفكير
- أرسل بريداً إلكترونياً للشكر خلال 24 ساعة من المقابلة`,
      authorName: "المسؤول العام",
      tags: ["مقابلة", "تحضير", "نصائح", "نصائح خبراء"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-02-12"),
    },
    {
      slug: "how-to-build-a-strong-cv-for-scholarship-applications",
      title: "كيف تبني سيرة ذاتية قوية لطلبات المنح الدراسية",
      excerpt: "سيرتك الذاتية غالباً هي أول مستند ينظر إليه المراجعون. تعلّم ماذا تُدرج، وكيف تُنسّقها، وما الذي تبحث عنه لجان المنح الدراسية فعلاً.",
      content: `## السيرة الذاتية للمنح الدراسية مقابل سيرة العمل

السيرة الذاتية للمنح الدراسية مختلفة عن سيرة طلب العمل. تريد لجان المنح الدراسية أن ترى الإنجازات الأكاديمية، والخبرة البحثية، والمنشورات، والمهارات اللغوية، والمشاركة المجتمعية — وليس فقط تاريخ العمل.

## الأقسام الأساسية

### 1. المعلومات الشخصية
الاسم، البريد الإلكتروني، الجنسية، وتاريخ الميلاد. أبقِها بسيطة. لا توجد صورة إلا إذا طُلبت تحديداً.

### 2. التعليم
أدرج درجاتك بترتيب زمني عكسي. اذكر:
- اسم المؤسسة وموقعها
- الدرجة ومجال الدراسة
- التواريخ (البداية – النهاية أو المتوقعة)
- المعدل التراكمي (إذا كان قوياً — أعلى من 3.0/4.0 أو ما يعادله)
- عنوان الأطروحة إذا كان ذا صلة

### 3. الإنجازات الأكاديمية والجوائز
أدرج المنح الدراسية، والشرفيات، والجوائز، والتمييزات. غالباً ما يكون هذا القسم هو ما يميّز المتقدمين التنافسيين.

### 4. الخبرة البحثية
إذا أجريت أبحاثاً (أطروحة جامعية، عمل مختبري، مساعد بحثي)، صفها باختصار مع النتائج واسم المشرف.

### 5. المنشورات والعروض
حتى عرض في مؤتمر أو ورقة بحثية بالمشاركة يعزّز طلبك بشكل كبير.

### 6. خبرة العمل
ركّز على المناصب التي تُظهر القيادة أو التدريس أو المهارات البحثية. دور مساعد بحثي أو تدريسي أكثر صلة من العمل بدوام جزئي غير ذي صلة.

### 7. التطوع والعمل المجتمعي
تقدّر لجان المنح الدراسية — خاصةً لبرامج مثل تشيفنينغ وفولبرايت — الأثر الاجتماعي والقيادة. أدرج أدواراً تطوعية ذات معنى.

### 8. المهارات اللغوية
أدرج جميع اللغات مع مستوى إتقانك (لغة أم، طليق، متوسط، أساسي) وأي شهادات (IELTS، TOEFL، DELF، Goethe).

### 9. المهارات التقنية
البرامج ذات الصلة، لغات البرمجة، التقنيات المختبرية، أو الأدوات.

### 10. المراجع
"المراجع متوفرة عند الطلب" أو أدرج مرجعين باسمهم ولقبهم ومؤسستهم وبريدهم الإلكتروني.

## قواعد التنسيق

- **الطول:** صفحتان كحد أقصى لمعظم المنح
- **الخط:** خط نظيف وقابل للقراءة (Calibri، Garamond، أو ما شابه)، 11–12 نقطة
- **الهوامش:** قياسية (2.5 سم / 1 إنش)
- **تنسيق الملف:** PDF ما لم يُحدَّد غير ذلك
- **الاتساق:** نفس التنسيق في كل مكان — لا تخلط أنماط النقاط

## ما يجب تجنبه

- الصور (إلا إذا طُلبت تحديداً)
- معلومات شخصية مثل الحالة الاجتماعية أو الديانة (إلا إذا طُلبت)
- تاريخ عمل غير ذي صلة لا يضيف قيمة
- أخطاء إملائية أو نحوية — راجع دائماً`,
      authorName: "المسؤول العام",
      tags: ["سيرة ذاتية", "CV", "دليل", "نصائح خبراء", "نصائح التقديم"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-02-15"),
    },
    {
      slug: "scholarship-application-timeline-12-month-plan",
      title: "الجدول الزمني لتقديم المنح الدراسية على مدى 12 شهراً",
      excerpt: "خطة شهراً بشهر لمساعدتك على التحضير والبحث وتقديم طلبات المنح الدراسية قبل المواعيد النهائية بوقت كافٍ — دون أن تترك شيئاً للصدفة.",
      content: `## لماذا التخطيط المسبق يفوز بالمنح الدراسية

الطلاب الذين يفوزون بالمنح التنافسية نادراً ما يبدؤون التحضير قبل أسبوعين من الموعد النهائي. أفضل الطلبات تُبنى على مدى أشهر من البحث والصياغة والتحسين.

## خطتك لـ 12 شهراً

### الأشهر 12–10 قبل الموعد النهائي: مرحلة البحث
- حدّد 10–15 منحة تناسب ملفك
- أنشئ جدول بيانات للتتبع: الاسم، الموعد النهائي، الأهلية، الوثائق المطلوبة، الحالة
- ابحث عن قيم كل منحة، والباحثين السابقين، ومعايير الاختيار
- ابدأ بتحسين نقاط الضعف (درجات اللغة، المعدل التراكمي، الأنشطة اللامنهجية)

### الأشهر 9–8: تحضير الوثائق
- اطلب كشوف الدرجات الرسمية من مؤسستك
- ابدأ الدراسة لاختبارات اللغة (IELTS، TOEFL) إذا لزم الأمر
- حدّث سيرتك الذاتية بجميع الإنجازات الأخيرة
- حدّد الموصين المحتملين وأبلغهم بخططك

### الأشهر 7–6: المسودات الأولى
- اكتب مسودات أولى لبيانك الشخصي / خطاب الدافع
- اطلب من الموصين رسمياً — قدّم لهم سيرتك الذاتية ومعلومات المنحة
- اعتمد كشوف الدرجات وترجمها إذا لزم الأمر

### الأشهر 5–4: المراجعة والتغذية الراجعة
- راجع البيانات الشخصية بناءً على ملاحظات الأساتذة والمرشدين
- تأكد من أن الموصين على المسار الصحيح بخطاباتهم
- أكمل أي وثائق متبقية (شهادات اللغة، إلخ.)

### الأشهر 3–2: التحضير النهائي
- مراجعة نهائية لجميع المواد المكتوبة
- تأكد من أن جميع الوثائق بالتنسيق الصحيح وضمن حدود الصفحات/الكلمات
- استعد للمقابلات المحتملة — تدرّب على الأسئلة الشائعة

### الشهر 1: التقديم
- قدّم الطلبات قبل أسبوع على الأقل من الموعد النهائي
- أكّد استلام جميع المواد المقدّمة
- تابع مع الموصين إذا لم تُقدَّم خطاباتهم

### بعد التقديم
- تتبّع حالة الطلب
- استعد للمقابلات إذا تم اختيارك في القائمة المختصرة
- استمر في التقديم لمنح أخرى — لا تنتظر نتيجة واحدة

## المبادئ الرئيسية

1. **تقدّم لمنح متعددة** — 5–10 هو المثالي
2. **خصّص كل طلب** — لا تقدّم نفس المقالة مرتين أبداً
3. **التزم بكل موعد نهائي** — الطلبات المتأخرة لا تُقبل أبداً
4. **احتفظ بالسجلات** — احفظ نسخاً من كل ما تقدّمه`,
      authorName: "المسؤول العام",
      tags: ["جدول زمني", "تخطيط", "دليل", "نصائح التقديم", "نصائح خبراء"],
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-02-18"),
    },

    // ── DRAFT (coming soon) ──────────────────────────────────────────────────
    {
      slug: "scholarships-for-refugees-and-displaced-students-2026",
      title: "منح دراسية للاجئين والطلاب النازحين في 2026",
      excerpt: "مرجع مخصص يسرد المنح الدراسية المصممة خصيصاً للاجئين، وطالبي اللجوء، والطلاب المتأثرين بالنزاعات أو النزوح.",
      content: `## التعليم طريقاً للاستقرار

بالنسبة للطلاب المتأثرين بالنزاعات أو النزوح، المنح الدراسية ليست فقط عن التطور المهني — يمكن أن تغيّر حياتهم. أنشأت كثير من المنظمات تدفقات تمويل مخصصة لهذه الفئة.

## أبرز المنح

### مفوضية الأمم المتحدة لشؤون اللاجئين / مبادرة ألبرت أينشتاين الأكاديمية الألمانية للاجئين (DAFI)
توفر تمويلاً للاجئين المسجلين لدى المفوضية لمتابعة التعليم الجامعي في بلد لجوئهم.

### شبكة الباحثين في خطر
تربط الباحثين المهددين بمؤسسات مضيفة حول العالم يمكنها توفير الأمان والدعم.

### معهد التعليم الدولي — صندوق إنقاذ الباحثين
زمالات طارئة للأكاديميين الذين تتعرض حياتهم أو عملهم للتهديد.

### تشيفنينغ — صندوق النزاع والاستقرار والأمن
مسارات تشيفنينغ محددة لمواطني الدول المتأثرة بالنزاعات.

### تمويل MPOWER
قروض ومنح دراسية للطلاب الدوليين بمن فيهم اللاجئون الذين يدرسون في الولايات المتحدة وكندا.

## كيفية التقديم كطالب نازح

- وثيقة تسجيل المفوضية مطلوبة غالباً كإثبات لحالة اللجوء
- اشرح وضعك بوضوح وبشكل واقعي في بيانك الشخصي
- اطلب الدعم من المنظمات غير الحكومية في منطقتك التي يمكنها المساعدة في الطلبات

*يجري توسيع هذه المقالة بمزيد من البرامج وإرشادات التقديم. تحقق قريباً للحصول على النسخة الكاملة.*`,
      authorName: "المسؤول العام",
      tags: ["لاجئون", "طلاب نازحون", "قائمة منح", "2026", "إنساني"],
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

  console.log("📋 بيانات الاعتماد للاختبار:");
  console.log("   🔑 المسؤول:  admin@scholarhub.com / Admin@123");
  console.log("   👨‍🏫 الأستاذ:  professor@university.edu / Prof@123");
  console.log("   👩‍🎓 الطالب:   student@example.com / Student@123\n");

  console.log("📊 البيانات المُدخلة:");
  console.log("   ✅ 3 مستخدمين (مسؤول، أستاذ، طالب)");
  console.log("   ✅ 8 تصنيفات");
  console.log("   ✅ 6 منح دراسية");
  console.log("   ✅ 4 شهادات");
  console.log("   ✅ 2 طلبات");
  console.log("   ✅ 3 منح محفوظة");
  console.log("   ✅ 2 إشعارات");
  console.log("   ✅ 14 إدخالاً في محتوى الصفحات (بما في ذلك سياسة الخصوصية وشروط الخدمة وصفحة من نحن وتكوين التذييل)");
  console.log("   ✅ 6 عناصر في الأسئلة الشائعة");
  console.log("   ✅ 10 منشورات مدونة (9 منشورة، 1 مسودة)\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
