import request from "./axios";
export const infoService = {
    getAll: () => request.get("/infos"),

    getById: (id) => request.get(`/infos/${id}`),

    create: (data) => request.post("/infos", data),

    update: (id, data) => request.put(`/infos/${id}`, data),

    remove: (id) => request.delete(`/infos/${id}`),
};
