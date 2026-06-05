import { prisma } from "../prisma/prisma.js";

export const infoService = {
    create: (data) => {
        return prisma.info.create({
            data: {
                ...data,
            },
        });
    },

    findAll: () =>
        prisma.info.findMany({
            include: { infoSource: true, creatorUser: true, creatorPosition: true },
        }),

    findOne: (id) =>
        prisma.info.findUnique({
            where: { id },
            include: { source: true, creator: true, creatorPosition: true },
        }),

    update: (id, data) => {
        return prisma.info.update({
            where: { id },
            data: {
                ...data,
                sourceId: data.sourceId ? Number(data.sourceId) : undefined,
                creatorId: data.creatorId ? Number(data.creatorId) : undefined,
                creatorPositionId: data.creatorPositionId ? Number(data.creatorPositionId) : undefined,
            },
        });
    },

    delete: (id) => prisma.info.delete({ where: { id } }),
};
