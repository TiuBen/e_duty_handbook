const express = require("express");
const PostController = require("../controllers/postController");

const setPostRoutes = (app) => {
    const router = express.Router();
    const postController = new PostController();

    router.post("/", postController.createPost.bind(postController));
    router.get("/:id", postController.getPost.bind(postController));
    router.put("/:id", postController.updatePost.bind(postController));
    router.delete("/:id", postController.deletePost.bind(postController));

    app.use("/api/posts", router);
};

module.exports = setPostRoutes;