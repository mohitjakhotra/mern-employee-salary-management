import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const createOvertime = async (payload) => {
    const response = await axios.post(`${API_BASE_URL}/api/overtime`, payload);
    return response.data;
};

export const getOvertimes = async ({ limit = 10, offset = 0, worker_id } = {}) => {
    const params = { limit, offset };
    if (worker_id) params.worker_id = worker_id;

    const response = await axios.get(`${API_BASE_URL}/api/overtime`, { params });
    return response.data;
};

export const getOvertimeById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/api/overtime/${id}`);
    return response.data;
};
