import request from "./axios";

export const userService = {
    getAll() {
        return request.get("/users");
    },

    create(data) {
        return request.post("/users", data);
    },

    update(id, data) {
        return request.put(`/users/${id}`, data);
    },

    remove(id) {
        return request.delete(`/users/${id}`);
    },
};
