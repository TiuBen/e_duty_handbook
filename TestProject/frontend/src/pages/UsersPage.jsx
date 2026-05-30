// filepath: /frontend/src/pages/UsersPage.js
import React, { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "../services/api";
import UserForm from "../components/UserForm";
import UserList from "../components/UserList";

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    const handleCreateOrUpdate = async (user) => {
        if (editingUser) {
            await updateUser(editingUser.id, user);
        } else {
            await createUser(user);
        }
        setEditingUser(null);
        fetchUsers();
    };

    const handleDelete = async (id) => {
        await deleteUser(id);
        fetchUsers();
    };

    const handleEdit = (user) => {
        setEditingUser(user);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>用户管理</h1>
            <UserForm onSubmit={handleCreateOrUpdate} initialData={editingUser} />
            <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
};

export default UsersPage;
