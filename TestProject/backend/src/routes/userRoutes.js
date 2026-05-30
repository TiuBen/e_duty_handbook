const express = require("express");
const UserController = require("../controllers/userController");

const setUserRoutes = (app) => {
    const router = express.Router();
    const userController = new UserController();

    router.post("/users", userController.createUser.bind(userController));
    router.get("/users/:id", userController.getUser.bind(userController));
    router.put("/users/:id", userController.updateUser.bind(userController));
    router.delete("/users/:id", userController.deleteUser.bind(userController));

    app.use("/api", router);
};

module.exports = setUserRoutes;