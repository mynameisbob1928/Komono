import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const Prisma = new PrismaClient().$extends(withAccelerate());