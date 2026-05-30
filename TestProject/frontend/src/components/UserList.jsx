import React from "react";

const UserList = ({ users, onEdit, onDelete }) => {
    return (
        <table border="1" style={{ width: "100%", textAlign: "left" }}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>手机号</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.phonenumber}</td>
                        <td>
                            <button onClick={() => onEdit(user)}>编辑</button>
                            <button onClick={() => onDelete(user.id)}>删除</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default UserList;
