import request from "./axios";

export const categoriesService = {
    getAll() {
        return request.get("/categories");
    },

    create(data) {
        return request.post("/categories", data);
    },

    update(id, data) {
        return request.put(`/categories/${id}`, data);
    },

    remove(id) {
        return request.delete(`/categories/${id}`);
    },
};
