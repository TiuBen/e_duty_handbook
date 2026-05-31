import { usersService } from "../services/user.service.js";

export const usersController = {
    create: async (req, res) => {
        console.log("create user");
        console.log(req.body);

        try {
            res.status(201).json(await usersService.create(req.body));
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: err.message });
        }
    },
    findAll: async (req, res) => {
        console.log("ddddddddddddddddddddddddddddddddddd");

        try {
            res.json(await usersService.findAll());
        } catch (err) {
            console.log(err);

            res.status(500).json({ error: err.message });
        }
    },
    findOne: async (req, res) => {
        try {
            res.json(await usersService.findOne(Number(req.params.id)));
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    },
    update: async (req, res) => {
        try {
            res.json(await usersService.update(Number(req.params.id), req.body));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            res.json(await usersService.delete(Number(req.params.id)));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};
