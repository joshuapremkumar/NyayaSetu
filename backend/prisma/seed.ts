import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@courtaction.ai' },
    update: {},
    create: {
      email: 'admin@courtaction.ai',
      passwordHash: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      department: 'IT Administration',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create legal reviewer
  const reviewerPassword = await bcrypt.hash('reviewer123', 10);
  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@courtaction.ai' },
    update: {},
    create: {
      email: 'reviewer@courtaction.ai',
      passwordHash: reviewerPassword,
      name: 'Legal Reviewer',
      role: 'LEGAL_REVIEWER',
      department: 'Legal Department',
    },
  });

  console.log('Created legal reviewer:', reviewer.email);

  // Create department officer
  const officerPassword = await bcrypt.hash('officer123', 10);
  const officer = await prisma.user.upsert({
    where: { email: 'officer@courtaction.ai' },
    update: {},
    create: {
      email: 'officer@courtaction.ai',
      passwordHash: officerPassword,
      name: 'Department Officer',
      role: 'DEPARTMENT_OFFICER',
      department: 'Public Works',
    },
  });

  console.log('Created department officer:', officer.email);

  console.log('Database seed completed successfully!');
  console.log('\nDefault credentials:');
  console.log('Admin: admin@courtaction.ai / admin123');
  console.log('Reviewer: reviewer@courtaction.ai / reviewer123');
  console.log('Officer: officer@courtaction.ai / officer123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Made with Bob
