import { shiftItemService } from "../services/shiftItem.service.js";

export const shiftItemController = {
    create: async (req, res) => {
        try {
            res.status(201).json(await shiftItemService.create(req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    findAll: async (req, res) => {
        try {
            res.json(await shiftItemService.findAll());
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    findOne: async (req, res) => {
        try {
            res.json(await shiftItemService.findOne(Number(req.params.id)));
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    },
    update: async (req, res) => {
        try {
            res.json(await shiftItemService.update(Number(req.params.id), req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            res.json(await shiftItemService.delete(Number(req.params.id)));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};
