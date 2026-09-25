import request from "./axios";

export const shiftItemService = {
    getAll: () => request.get("/shift-items"),

    getById: (id) => request.get(`/shift-items/${id}`),

    create: (data) => request.post("/shift-items", data),

    update: (id, data) => request.put(`/shift-items/${id}`, data),

    remove: (id) => request.delete(`/shift-items/${id}`),
};
