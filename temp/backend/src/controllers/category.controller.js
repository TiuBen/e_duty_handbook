import { categoryService } from "../services/category.service.js";

export const categoryController = {
    create: async (req, res) => {
        try {
            res.status(201).json(await categoryService.create(req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    findAll: async (req, res) => {
        try {
            res.json(await categoryService.findAll());
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    findOne: async (req, res) => {
        try {
            res.json(await categoryService.findOne(Number(req.params.id)));
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            res.json(await categoryService.update(Number(req.params.id), req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            res.json(await categoryService.delete(Number(req.params.id)));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};
