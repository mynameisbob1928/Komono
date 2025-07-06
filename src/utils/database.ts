import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const Prisma = new PrismaClient().$extends(withAccelerate());

export default Prisma;