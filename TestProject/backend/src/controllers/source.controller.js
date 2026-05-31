import { sourceService } from "../services/source.service.js";

export const sourceController = {
    create: async (req, res) => {
        try {
            res.status(201).json(await sourceService.create(req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    findAll: async (req, res) => {
        try {
            res.json(await sourceService.findAll());
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    findOne: async (req, res) => {
        try {
            res.json(await sourceService.findOne(Number(req.params.id)));
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    },
    update: async (req, res) => {
        try {
            res.json(await sourceService.update(Number(req.params.id), req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            res.json(await sourceService.delete(Number(req.params.id)));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};
