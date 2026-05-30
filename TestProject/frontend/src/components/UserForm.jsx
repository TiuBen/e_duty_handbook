import React, { useState, useEffect } from "react";

const UserForm = ({ onSubmit, initialData }) => {
    const [username, setUsername] = useState(initialData?.username || "");
    const [phonenumber, setPhonenumber] = useState(initialData?.phonenumber || "");

    useEffect(() => {
        if (initialData) {
            setUsername(initialData.username);
            setPhonenumber(initialData.phonenumber);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ username, phonenumber });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="手机号"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
                required
            />
            <button type="submit">提交</button>
        </form>
    );
};

export default UserForm;
