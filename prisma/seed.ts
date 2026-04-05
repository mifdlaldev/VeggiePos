import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL atau DATABASE_URL belum dikonfigurasi untuk seed.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  const adminFullName = process.env.SEED_ADMIN_FULL_NAME ?? "Admin VeggiePOS";

  const cashierUsername = process.env.SEED_KASIR_USERNAME ?? "kasir";
  const cashierPassword = process.env.SEED_KASIR_PASSWORD ?? "kasir12345";
  const cashierFullName = process.env.SEED_KASIR_FULL_NAME ?? "Kasir VeggiePOS";

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      fullName: adminFullName,
      password: await hashPassword(adminPassword),
      role: UserRole.ADMIN,
    },
    create: {
      username: adminUsername,
      fullName: adminFullName,
      password: await hashPassword(adminPassword),
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { username: cashierUsername },
    update: {
      fullName: cashierFullName,
      password: await hashPassword(cashierPassword),
      role: UserRole.KASIR,
    },
    create: {
      username: cashierUsername,
      fullName: cashierFullName,
      password: await hashPassword(cashierPassword),
      role: UserRole.KASIR,
    },
  });

  console.log("Seed selesai. User admin dan kasir siap dipakai.");
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
