import {
    CLEAR_OVERTIME_FEEDBACK,
    CREATE_DATA_OVERTIME_FAILURE,
    CREATE_DATA_OVERTIME_REQUEST,
    CREATE_DATA_OVERTIME_SUCCESS,
    GET_DATA_OVERTIME_BY_ID_FAILURE,
    GET_DATA_OVERTIME_BY_ID_REQUEST,
    GET_DATA_OVERTIME_BY_ID_SUCCESS,
    GET_DATA_OVERTIME_FAILURE,
    GET_DATA_OVERTIME_REQUEST,
    GET_DATA_OVERTIME_SUCCESS
} from './overtimeActionTypes/index.js';
import * as overtimeAPI from '../../../../api/overtimeAPI';

export const getDataOvertime = ({ limit = 10, offset = 0, worker_id } = {}) => {
    return async (dispatch) => {
        dispatch({ type: GET_DATA_OVERTIME_REQUEST });

        try {
            const response = await overtimeAPI.getOvertimes({ limit, offset, worker_id });
            dispatch({
                type: GET_DATA_OVERTIME_SUCCESS,
                payload: {
                    data: response.data || [],
                    pagination: response.pagination || { total: 0, limit, offset, pages: 0 }
                }
            });
            return { success: true, data: response };
        } catch (error) {
            const payload = {
                message: error.response?.data?.message || error.message,
                errors: error.response?.data?.errors || {}
            };
            dispatch({ type: GET_DATA_OVERTIME_FAILURE, payload });
            return { success: false, ...payload };
        }
    };
};

export const createDataOvertime = (overtimePayload) => {
    return async (dispatch) => {
        dispatch({ type: CREATE_DATA_OVERTIME_REQUEST });

        try {
            const response = await overtimeAPI.createOvertime(overtimePayload);
            dispatch({ type: CREATE_DATA_OVERTIME_SUCCESS, payload: response });
            return { success: true, data: response };
        } catch (error) {
            const payload = {
                message: error.response?.data?.message || 'Gagal menyimpan data overtime',
                errors: error.response?.data?.errors || {}
            };
            dispatch({ type: CREATE_DATA_OVERTIME_FAILURE, payload });
            return { success: false, ...payload };
        }
    };
};

export const getDataOvertimeById = (id) => {
    return async (dispatch) => {
        dispatch({ type: GET_DATA_OVERTIME_BY_ID_REQUEST });

        try {
            const response = await overtimeAPI.getOvertimeById(id);
            dispatch({ type: GET_DATA_OVERTIME_BY_ID_SUCCESS, payload: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            const payload = {
                message: error.response?.data?.message || error.message,
                errors: error.response?.data?.errors || {}
            };
            dispatch({ type: GET_DATA_OVERTIME_BY_ID_FAILURE, payload });
            return { success: false, ...payload };
        }
    };
};

export const clearOvertimeFeedback = () => ({
    type: CLEAR_OVERTIME_FEEDBACK
});
