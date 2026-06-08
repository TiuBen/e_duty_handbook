import { prisma } from "../prisma/prisma.js";

export const categoryService = {
    create: async (data) => {
        return prisma.category.create({
            data: {
                name: data.name,
            },
        });
    },

    findAll: async () => {
        return prisma.category.findMany({
            orderBy: {
                id: "asc",
            },
        });
    },

    findOne: async (id) => {
        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new Error("Category not found");
        }

        return category;
    },

    update: async (id, data) => {
        return prisma.category.update({
            where: { id },
            data: {
                name: data.name,
            },
        });
    },

    delete: async (id) => {
        return prisma.category.delete({
            where: { id },
        });
    },
};
