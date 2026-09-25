import request from "./axios";

export const sourceService = {
    getAll: () => request.get("/sources"),

    getById: (id) => request.get(`/sources/${id}`),

    create: (data) => request.post("/sources", data),

    update: (id, data) => request.put(`/sources/${id}`, data),

    remove: (id) => request.delete(`/sources/${id}`),
};
