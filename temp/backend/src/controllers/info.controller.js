import { infoService } from "../services/info.service.js";

export const infoController = {
    create: async (req, res) => {
        try {
            res.status(201).json(await infoService.create(req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    findAll: async (req, res) => {
        try {
            res.json(await infoService.findAll());
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    findOne: async (req, res) => {
        try {
            res.json(await infoService.findOne(Number(req.params.id)));
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    },
    update: async (req, res) => {
        try {
            res.json(await infoService.update(Number(req.params.id), req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            res.json(await infoService.delete(Number(req.params.id)));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};
