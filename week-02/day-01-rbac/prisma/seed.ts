import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function seedRBAC() {
  const permissionDefs = [
    {
      name: "documents:create",
      resource: "documents",
      action: "create",
      description: "Upload documents",
    },
    {
      name: "documents:read",
      resource: "documents",
      action: "read",
      description: "View documents",
    },
    {
      name: "documents:update",
      resource: "documents",
      action: "update",
      description: "Edit document metadata",
    },
    {
      name: "documents:delete",
      resource: "documents",
      action: "delete",
      description: "Delete documents",
    },
    {
      name: "conversations:create",
      resource: "conversations",
      action: "create",
      description: "Start conversations",
    },
    {
      name: "conversations:read",
      resource: "conversations",
      action: "read",
      description: "View conversations",
    },
    {
      name: "users:read",
      resource: "users",
      action: "read",
      description: "View user list",
    },
    {
      name: "users:manage",
      resource: "users",
      action: "manage",
      description: "Manage user accounts",
    },
    {
      name: "roles:manage",
      resource: "roles",
      action: "manage",
      description: "Manage roles and permissions",
    },
  ];

  const permissions: Record<string, { id: string }> = {};

  for (const permission of permissionDefs) {
    permissions[permission.name] = await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {},
      create: permission,
    });
  }

  const roleDefs = [
    {
      name: "admin",
      description: "Full system access",
      isDefault: false,
      permissions: Object.keys(permissions),
    },
    {
      name: "member",
      description: "Standard user",
      isDefault: true,
      permissions: [
        "documents:create",
        "documents:read",
        "documents:update",
        "conversations:create",
        "conversations:read",
      ],
    },
    {
      name: "viewer",
      description: "Read-only access",
      isDefault: false,
      permissions: [
        "documents:read",
        "conversations:read",
      ],
    },
  ];

  for (const roleDef of roleDefs) {
    const role = await prisma.role.upsert({
      where: {
        name: roleDef.name,
      },
      update: {
        description: roleDef.description,
        isDefault: roleDef.isDefault,
      },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        isDefault: roleDef.isDefault,
      },
    });

    for (const permissionName of roleDef.permissions) {
      const permission = permissions[permissionName];

      if (!permission) {
        throw new Error(
          `Permission "${permissionName}" was not found during RBAC seeding`,
        );
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("RBAC seeded: 3 roles, 9 permissions");
}

async function seedUsers() {
  const adminPasswordHash = await bcrypt.hash(
    "Admin123!",
    12,
  );

  const testPasswordHash = await bcrypt.hash(
    "TestPassword1!",
    12,
  );

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@docuchat.dev",
    },
    update: {
      name: "Admin User",
      passwordHash: adminPasswordHash,
      role: "admin",
      tier: "enterprise",
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: "Admin User",
      email: "admin@docuchat.dev",
      passwordHash: adminPasswordHash,
      role: "admin",
      tier: "enterprise",
      isActive: true,
    },
  });

  const testUser = await prisma.user.upsert({
    where: {
      email: "test@docuchat.dev",
    },
    update: {
      name: "Test User",
      passwordHash: testPasswordHash,
      role: "user",
      tier: "free",
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: "Test User",
      email: "test@docuchat.dev",
      passwordHash: testPasswordHash,
      role: "user",
      tier: "free",
      isActive: true,
    },
  });

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: {
      name: "admin",
    },
  });

  const memberRole = await prisma.role.findUniqueOrThrow({
    where: {
      name: "member",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: testUser.id,
        roleId: memberRole.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      roleId: memberRole.id,
    },
  });

  console.log("Users seeded: admin + member test user");
}

async function main() {
  await seedRBAC();
  await seedUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
