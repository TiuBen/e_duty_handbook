const express = require("express");
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/users.controller");

const router = express.Router();

// 获取所有用户
router.get("/", getUsers);

// 根据 ID 获取用户
router.get("/:id", getUserById);

// 创建用户
router.post("/", createUser);

// 更新用户
router.put("/:id", updateUser);

// 删除用户
router.delete("/:id", deleteUser);

module.exports = router;
