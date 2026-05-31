import { prisma } from "../prisma/prisma.js";

export const positionService = {
    create: (data) => prisma.position.create({ data }),
    findAll: () => prisma.position.findMany(),
    findOne: (id) => prisma.position.findUnique({ where: { id } }),
    update: (id, data) => prisma.position.update({ where: { id }, data }),
    delete: (id) => prisma.position.delete({ where: { id } }),
};
