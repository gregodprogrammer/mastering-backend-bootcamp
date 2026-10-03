import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/authorize.js";
import { prisma } from "../lib/prisma.js";
import { appEvents } from "../lib/events.js";

const router = Router();

router.use(authenticate);
router.use(requirePermission("roles:manage"));

router.get("/roles", async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isDefault: role.isDefault,
        userCount: role._count.users,
        permissions: role.permissions.map(
          (rolePermission) => rolePermission.permission.name,
        ),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/users/:userId/roles", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { roleName } = req.body;

    if (!roleName) {
      res.status(400).json({
        message: "roleName is required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    });

    if (!role) {
      res.status(404).json({
        message: "Role not found",
      });
      return;
    }

    const assignedBy = req.user?.userId;

    if (!assignedBy) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const userRole = await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId,
        roleId: role.id,
        assignedBy,
      },
    });

    appEvents.emit("admin:role-assigned", {
      assignedBy,
      targetUserId: userId,
      roleName: role.name,
    });

    res.status(201).json({
      message: "Role assigned successfully",
      data: {
        userId: userRole.userId,
        role: role.name,
        assignedBy: userRole.assignedBy,
        assignedAt: userRole.assignedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:userId/roles/:roleName", async (req, res, next) => {
  try {
    const { userId, roleName } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    });

    if (!role) {
      res.status(404).json({
        message: "Role not found",
      });
      return;
    }

    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    if (!existingUserRole) {
      res.status(404).json({
        message: "Role assignment not found",
      });
      return;
    }

    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    const revokedBy = req.user?.userId;

    if (!revokedBy) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    appEvents.emit("admin:role-revoked", {
      revokedBy,
      targetUserId: userId,
      roleName: role.name,
    });

    res.json({
      message: "Role revoked successfully",
      data: {
        userId,
        role: role.name,
        revokedBy,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
