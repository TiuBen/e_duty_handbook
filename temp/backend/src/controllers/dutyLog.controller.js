import { dutyLogService } from "../services/dutyLog.service.js";

export const dutyLogController = {
    create: async (req, res) => {
        try {
            res.status(201).json(await dutyLogService.create(req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    findAll: async (req, res) => {
        try {
            res.json(await dutyLogService.findAll());
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    findOne: async (req, res) => {
        try {
            res.json(await dutyLogService.findOne(Number(req.params.id)));
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    },
    update: async (req, res) => {
        try {
            res.json(await dutyLogService.update(Number(req.params.id), req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            res.json(await dutyLogService.delete(Number(req.params.id)));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};
