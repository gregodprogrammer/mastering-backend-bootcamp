import type { Request, Response, NextFunction } from "express";
import { getUserPermissions } from "../services/rbac.service.js";

export function requirePermission(
  ...requiredPermissions: string[]
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          message: "Authentication required",
        });
        return;
      }

      const userPermissions = await getUserPermissions(
        req.user.userId,
      );

      const missingPermissions = requiredPermissions.filter(
        (permission) => !userPermissions.has(permission),
      );

      if (missingPermissions.length > 0) {
        res.status(403).json({
          message: "You do not have the required permission",
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
