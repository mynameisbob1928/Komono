import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

export default new PrismaClient().$extends(withAccelerate());
