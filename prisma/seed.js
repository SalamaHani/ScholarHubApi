"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...\n');
    // ==================== CREATE ADMIN USER ====================
    console.log('Creating admin user...');
    const adminPassword = await bcryptjs_1.default.hash('Admin@123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@scholarhub.com' },
        update: {},
        create: {
            email: 'admin@scholarhub.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: client_1.UserRole.ADMIN,
            isEmailVerified: true,
        },
    });
    console.log(`  ✅ Admin: ${admin.email}`);
    // ==================== CREATE PROFESSOR USER ====================
    console.log('Creating professor user...');
    const profPassword = await bcryptjs_1.default.hash('Prof@123', 12);
    const professor = await prisma.user.upsert({
        where: { email: 'professor@university.edu' },
        update: {},
        create: {
            email: 'professor@university.edu',
            password: profPassword,
            firstName: 'Dr. Ahmed',
            lastName: 'Hassan',
            role: client_1.UserRole.PROFESSOR,
            isEmailVerified: true,
            professorProfile: {
                create: {
                    institution: 'Gaza University',
                    department: 'Computer Science',
                    position: 'Associate Professor',
                    isVerified: true,
                    verifiedAt: new Date(),
                },
            },
        },
    });
    console.log(`  ✅ Professor: ${professor.email}`);
    // ==================== CREATE STUDENT USER ====================
    console.log('Creating student user...');
    const studentPassword = await bcryptjs_1.default.hash('Student@123', 12);
    const student = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: {},
        create: {
            email: 'student@example.com',
            password: studentPassword,
            firstName: 'Sarah',
            lastName: 'Mohammed',
            role: client_1.UserRole.STUDENT,
            isEmailVerified: true,
            studentProfile: {
                create: {
                    university: 'Gaza University',
                    fieldOfStudy: 'Computer Science',
                    currentDegree: client_1.DegreeLevel.BACHELOR,
                    gpa: 3.8,
                    graduationYear: 2026,
                    country: 'Palestine',
                },
            },
        },
    });
    console.log(`  ✅ Student: ${student.email}`);
    // ==================== CREATE CATEGORIES ====================
    console.log('\nCreating categories...');
    const categories = [
        { name: 'STEM', slug: 'stem', description: 'Science, Technology, Engineering, Mathematics', icon: '🔬', color: '#3B82F6' },
        { name: 'Arts & Humanities', slug: 'arts-humanities', description: 'Art, Literature, History, Philosophy', icon: '🎨', color: '#8B5CF6' },
        { name: 'Business', slug: 'business', description: 'Business, Management, Economics', icon: '💼', color: '#10B981' },
        { name: 'Medicine & Health', slug: 'medicine-health', description: 'Medical and Health Sciences', icon: '⚕️', color: '#EF4444' },
        { name: 'Social Sciences', slug: 'social-sciences', description: 'Psychology, Sociology, Political Science', icon: '🌍', color: '#F59E0B' },
        { name: 'Engineering', slug: 'engineering', description: 'All Engineering Fields', icon: '⚙️', color: '#6366F1' },
        { name: 'Law', slug: 'law', description: 'Legal Studies', icon: '⚖️', color: '#78716C' },
        { name: 'Education', slug: 'education', description: 'Teaching and Education', icon: '📚', color: '#EC4899' },
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
    console.log('\nCreating scholarships...');
    const scholarships = [
        {
            title: 'Fulbright Foreign Student Program',
            description: 'The Fulbright Program is the flagship international educational exchange program sponsored by the U.S. government. It provides funding for graduate students, young professionals, and artists to study, conduct research, or teach English in the United States.',
            organization: 'U.S. Department of State',
            country: 'United States',
            fieldOfStudy: ['All Fields'],
            degreeLevel: [client_1.DegreeLevel.MASTER, client_1.DegreeLevel.PHD],
            fundingType: client_1.FundingType.FULL,
            deadline: new Date('2026-05-15'),
            applicationLink: 'https://foreign.fulbrightonline.org/',
            requirements: 'Bachelor\'s degree, English proficiency, strong academic record',
            eligibility: 'Open to all nationalities. Palestinian students are encouraged to apply.',
            benefits: 'Tuition, living expenses, health insurance, round-trip airfare',
            isFeatured: true,
        },
        {
            title: 'Chevening Scholarships',
            description: 'Chevening Scholarships are the UK government\'s global scholarship programme, funded by the Foreign, Commonwealth and Development Office and partner organisations.',
            organization: 'UK Government',
            country: 'United Kingdom',
            fieldOfStudy: ['All Fields'],
            degreeLevel: [client_1.DegreeLevel.MASTER],
            fundingType: client_1.FundingType.FULL,
            deadline: new Date('2026-11-01'),
            applicationLink: 'https://www.chevening.org/',
            requirements: '2 years work experience, Bachelor\'s degree, English proficiency',
            eligibility: 'Citizens of Chevening-eligible countries including Palestine',
            benefits: 'University tuition fees, monthly stipend, travel costs, arrival allowance',
            isFeatured: true,
        },
        {
            title: 'DAAD Scholarships',
            description: 'The DAAD (German Academic Exchange Service) offers scholarships for international students to pursue master\'s or PhD studies at top German universities.',
            organization: 'German Academic Exchange Service',
            country: 'Germany',
            fieldOfStudy: ['All Fields'],
            degreeLevel: [client_1.DegreeLevel.MASTER, client_1.DegreeLevel.PHD],
            fundingType: client_1.FundingType.FULL,
            deadline: new Date('2026-10-15'),
            applicationLink: 'https://www.daad.de/',
            requirements: 'Bachelor\'s degree, academic excellence, language proficiency',
            eligibility: 'Open to graduates from all countries',
            benefits: 'Monthly payments, travel allowance, health insurance',
            isFeatured: true,
        },
        {
            title: 'Turkish Scholarships (Türkiye Burslari)',
            description: 'A comprehensive scholarship program by the Republic of Turkey for international students.',
            organization: 'Republic of Turkey',
            country: 'Turkey',
            fieldOfStudy: ['All Fields'],
            degreeLevel: [client_1.DegreeLevel.BACHELOR, client_1.DegreeLevel.MASTER, client_1.DegreeLevel.PHD],
            fundingType: client_1.FundingType.FULL,
            deadline: new Date('2026-02-20'),
            applicationLink: 'https://turkiyeburslari.gov.tr/',
            requirements: 'Academic excellence, age requirements vary by degree level',
            eligibility: 'Non-Turkish citizens, including Palestinians',
            benefits: 'Tuition, accommodation, monthly stipend, Turkish language course, health insurance',
            isFeatured: false,
        },
        {
            title: 'Erasmus Mundus Joint Masters',
            description: 'High-level integrated master\'s programmes delivered by consortia of higher education institutions across Europe and beyond.',
            organization: 'European Union',
            country: 'Europe',
            fieldOfStudy: ['Various Specializations'],
            degreeLevel: [client_1.DegreeLevel.MASTER],
            fundingType: client_1.FundingType.FULL,
            deadline: new Date('2026-01-30'),
            applicationLink: 'https://erasmus-plus.ec.europa.eu/',
            requirements: 'Bachelor\'s degree, English proficiency, program-specific requirements',
            eligibility: 'Open to students worldwide',
            benefits: 'Tuition, travel, living costs, installation costs',
            isFeatured: false,
        },
        {
            title: 'MEXT Scholarship (Japan)',
            description: 'Japanese government scholarship for international students wishing to study at Japanese universities.',
            organization: 'Japanese Government',
            country: 'Japan',
            fieldOfStudy: ['All Fields'],
            degreeLevel: [client_1.DegreeLevel.BACHELOR, client_1.DegreeLevel.MASTER, client_1.DegreeLevel.PHD],
            fundingType: client_1.FundingType.FULL,
            deadline: new Date('2026-04-15'),
            applicationLink: 'https://www.studyinjapan.go.jp/',
            requirements: 'Age requirements, academic excellence, health requirements',
            eligibility: 'Citizens of countries with diplomatic relations with Japan',
            benefits: 'Tuition exemption, monthly allowance, travel costs',
            isFeatured: false,
        },
    ];
    const stemCategory = await prisma.category.findUnique({ where: { slug: 'stem' } });
    for (const scholarship of scholarships) {
        const created = await prisma.scholarship.create({
            data: {
                ...scholarship,
                status: client_1.ScholarshipStatus.APPROVED,
                createdById: admin.id,
                approvedById: admin.id,
                approvedAt: new Date(),
                categories: stemCategory ? {
                    create: { categoryId: stemCategory.id }
                } : undefined,
            },
        });
        console.log(`  ✅ Scholarship: ${created.title}`);
    }
    console.log('\n✨ Database seeded successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin:     admin@scholarhub.com / Admin@123');
    console.log('   Professor: professor@university.edu / Prof@123');
    console.log('   Student:   student@example.com / Student@123\n');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map