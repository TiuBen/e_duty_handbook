import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
});

export async function getWorkflowXml() {
    const res = await api.get("/workflow/handover/xml");

    return res.data;
}
