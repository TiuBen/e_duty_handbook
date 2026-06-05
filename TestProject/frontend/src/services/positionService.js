import request from "./axios";

export const positionService = {
    getAll: () => request.get("/positions"),

    getById: (id) => request.get(`/positions/${id}`),

    create: (data) => request.post("/positions", data),

    update: (id, data) => request.put(`/positions/${id}`, data),

    remove: (id) => request.delete(`/positions/${id}`),
};
