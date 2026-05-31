import request from "./axios";

export const dutyLogService = {
    getAll: () => request.get("/duty-logs"),

    getById: (id) => request.get(`/duty-logs/${id}`),

    create: (data) => request.post("/duty-logs", data),

    update: (id, data) => request.put(`/duty-logs/${id}`, data),

    remove: (id) => request.delete(`/duty-logs/${id}`),
};
