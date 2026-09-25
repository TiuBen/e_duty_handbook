import { positionService } from "../services/position.service.js";

export const positionController = {
    create: async (req, res) => {
        try {
            res.status(201).json(await positionService.create(req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    findAll: async (req, res) => {
        try {
            res.json(await positionService.findAll());
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    findOne: async (req, res) => {
        try {
            res.json(await positionService.findOne(Number(req.params.id)));
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    },
    update: async (req, res) => {
        try {
            res.json(await positionService.update(Number(req.params.id), req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            res.json(await positionService.delete(Number(req.params.id)));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};
