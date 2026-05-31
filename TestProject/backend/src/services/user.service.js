import { prisma } from "../prisma/prisma.js";

export const usersService = {
    create: (data) => prisma.user.create({ data }),
    findAll: () => prisma.user.findMany(),
    findOne: (id) => prisma.user.findUnique({ where: { id } }),
    update: (id, data) => prisma.user.update({ where: { id }, data }),
    delete: (id) => prisma.user.delete({ where: { id } }),
};
