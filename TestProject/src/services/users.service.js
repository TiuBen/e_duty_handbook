const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 定位 SQLite 数据库文件
const dbPath = path.resolve(__dirname, "../db/handover.db");

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to SQLite database:", err.message);
    } else {
        console.log("Connected to SQLite database at", dbPath);
    }
});

// 获取所有用户
const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM users";
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// 根据 ID 获取用户
const getUser = (id) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM users WHERE id = ?";
        db.get(query, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// 创建用户
const addUser = ({ username, phonenumber }) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO users (username, phonenumber) VALUES (?, ?)";
        db.run(query, [username, phonenumber], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, username, phonenumber });
            }
        });
    });
};

// 更新用户
const modifyUser = (id, { username, phonenumber }) => {
    return new Promise((resolve, reject) => {
        const query = "UPDATE users SET username = ?, phonenumber = ? WHERE id = ?";
        db.run(query, [username, phonenumber, id], function (err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                resolve(null); // 用户不存在
            } else {
                resolve({ id, username, phonenumber });
            }
        });
    });
};

// 删除用户
const removeUser = (id) => {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM users WHERE id = ?";
        db.run(query, [id], function (err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                resolve(null); // 用户不存在
            } else {
                resolve(true);
            }
        });
    });
};

module.exports = {
    getAllUsers,
    getUser,
    addUser,
    modifyUser,
    removeUser,
};
