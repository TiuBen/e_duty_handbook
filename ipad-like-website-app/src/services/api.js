import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api"; // 后端服务地址

// 获取所有用户
export const getUsers = async () => {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
};

// 根据 ID 获取用户
export const getUserById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
};

// 创建用户
export const createUser = async (user) => {
    const response = await axios.post(`${API_BASE_URL}/users`, user);
    return response.data;
};

// 更新用户
export const updateUser = async (id, user) => {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, user);
    return response.data;
};

// 删除用户
export const deleteUser = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
    return response.data;
};
