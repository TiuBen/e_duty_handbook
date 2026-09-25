import { prisma } from "../prisma/prisma.js";

export const sourceService = {
    create: (data) => prisma.source.create({ data }),
    findAll: () => prisma.source.findMany(),
    findOne: (id) => prisma.source.findUnique({ where: { id } }),
    update: (id, data) => prisma.source.update({ where: { id }, data }),
    delete: (id) => prisma.source.delete({ where: { id } }),
};
