import { prisma } from "../prisma/prisma.js";

export const shiftItemService = {
    create: (data) => {
        return prisma.shiftItem.create({
            data: {
                positionId: Number(data.positionId),
                infoId: Number(data.infoId),
                dutyLogId: Number(data.dutyLogId),
                isChecked: data.isChecked ?? false,
                checkedBy: data.checkedBy ? Number(data.checkedBy) : null,
                checkedAt: data.checkedAt || null,
            },
        });
    },

    findAll: () =>
        prisma.shiftItem.findMany({
            include: { position: true, info: true, dutyLog: true, checkedByUser: true },
        }),

    findOne: (id) =>
        prisma.shiftItem.findUnique({
            where: { id },
            include: { position: true, info: true, dutyLog: true, checkedByUser: true },
        }),

    update: (id, data) => {
        return prisma.shiftItem.update({
            where: { id },
            data: {
                ...data,
                positionId: data.positionId ? Number(data.positionId) : undefined,
                infoId: data.infoId ? Number(data.infoId) : undefined,
                dutyLogId: data.dutyLogId ? Number(data.dutyLogId) : undefined,
                checkedBy: data.checkedBy ? Number(data.checkedBy) : undefined,
            },
        });
    },

    delete: (id) => prisma.shiftItem.delete({ where: { id } }),
};
