import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const family = await prisma.family.upsert({
    where: { id: "family_demo" },
    update: {},
    create: {
      id: "family_demo",
      displayName: "Demo Family"
    }
  });

  const user = await prisma.user.upsert({
    where: { id: "user_demo" },
    update: {},
    create: {
      id: "user_demo",
      familyId: family.id,
      name: "Demo Parent",
      role: "guardian"
    }
  });

  const memorySpace = await prisma.memorySpace.upsert({
    where: { id: "memory_space_demo_baby" },
    update: {},
    create: {
      id: "memory_space_demo_baby",
      familyId: family.id,
      type: "baby",
      displayName: "Demo Baby"
    }
  });

  console.log({
    familyId: family.id,
    userId: user.id,
    memorySpaceId: memorySpace.id
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
