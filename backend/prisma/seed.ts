import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with initial users & sample liability letters...');

  // 1. Admin Account
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const adminSecret = authenticator.generateSecret(); // Secret for Microsoft Authenticator

  const admin = await prisma.user.upsert({
    where: { username: 'admin2' },
    update: {},
    create: {
      username: 'admin2',
      password: adminPassword,
      role: 'ADMIN',
      isTwoFactorEnabled: true,
      twoFactorSecret: adminSecret,
    },
  });

  console.log(`✅ Default Admin Created: admin2 / Admin@123 (2FA Secret: ${adminSecret})`);

  // 2. Standard User Account
  const userPassword = await bcrypt.hash('User@123', 10);
  const userSecret = authenticator.generateSecret();

  const user = await prisma.user.upsert({
    where: { username: 'staff1' },
    update: {},
    create: {
      username: 'staff1',
      password: userPassword,
      role: 'USER',
      isTwoFactorEnabled: true,
      twoFactorSecret: userSecret,
    },
  });

  console.log(`✅ Default Staff User Created: staff1 / User@123 (2FA Secret: ${userSecret})`);

  // 3. Sample Liability Letters
  const sampleLetters = [
    {
      bankName: 'Amlak Finance PJSC',
      accountNumber: 'AB1234567890',
      issueDate: new Date('2026-10-02'),
      expiryDate: new Date('2026-10-03'),
      status: 'EXPIRED' as const,
      issuedById: admin.id,
    },
    {
      bankName: 'Amlak Finance PJSC',
      accountNumber: 'AF9876543210',
      issueDate: new Date('2026-10-05'),
      expiryDate: new Date('2026-11-05'),
      status: 'ACTIVE' as const,
      issuedById: user.id,
    },
  ];

  for (const item of sampleLetters) {
    await prisma.letter.create({
      data: item,
    });
  }

  console.log('🌱 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
