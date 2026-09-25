const { getAllUsers, getUser, addUser, modifyUser, removeUser } = require("../services/users.service");

// 获取所有用户
const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 根据 ID 获取用户
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await getUser(parseInt(id));
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 创建用户
const createUser = async (req, res) => {
    const { username, phoneNumber } = req.body;
    try {
        const newUser = await addUser({ username, phoneNumber });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 更新用户
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, phoneNumber } = req.body;
    try {
        const updatedUser = await modifyUser(parseInt(id), { username, phoneNumber });
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 删除用户
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await removeUser(parseInt(id));
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
