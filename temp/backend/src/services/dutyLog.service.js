import { prisma } from "../prisma/prisma.js";

export const dutyLogService = {
    create: (data) => {
        return prisma.dutyLog.create({
            data: {
                positionId: Number(data.positionId),
                userId: Number(data.userId),
                startTime: data.startTime,
                status: data.status,
            },
        });
    },

    findAll: () =>
        prisma.dutyLog.findMany({
            include: { position: true, user: true },
        }),

    findOne: (id) =>
        prisma.dutyLog.findUnique({
            where: { id },
            include: { position: true, user: true },
        }),

    update: (id, data) => {
        return prisma.dutyLog.update({
            where: { id },
            data: {
                ...data,
                positionId: data.positionId ? Number(data.positionId) : undefined,
                userId: data.userId ? Number(data.userId) : undefined,
            },
        });
    },

    delete: (id) => prisma.dutyLog.delete({ where: { id } }),
};
