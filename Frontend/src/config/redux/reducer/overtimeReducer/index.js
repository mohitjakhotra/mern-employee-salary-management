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
} from '../../action/overtimeAction/overtimeActionTypes/index.js';

const initialState = {
    dataOvertime: [],
    selectedOvertime: null,
    pagination: {
        total: 0,
        limit: 10,
        offset: 0,
        pages: 0
    },
    loading: false,
    message: '',
    error: null,
    validationErrors: {}
};

const overtimeReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_DATA_OVERTIME_REQUEST:
        case GET_DATA_OVERTIME_BY_ID_REQUEST:
        case CREATE_DATA_OVERTIME_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };

        case GET_DATA_OVERTIME_SUCCESS:
            return {
                ...state,
                loading: false,
                dataOvertime: action.payload.data,
                pagination: action.payload.pagination,
                error: null
            };

        case GET_DATA_OVERTIME_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload.message,
                validationErrors: action.payload.errors || {}
            };

        case CREATE_DATA_OVERTIME_SUCCESS:
            return {
                ...state,
                loading: false,
                message: action.payload.message || 'Data overtime berhasil disimpan',
                error: null,
                validationErrors: {}
            };

        case CREATE_DATA_OVERTIME_FAILURE:
            return {
                ...state,
                loading: false,
                message: '',
                error: action.payload.message,
                validationErrors: action.payload.errors || {}
            };

        case GET_DATA_OVERTIME_BY_ID_SUCCESS:
            return {
                ...state,
                loading: false,
                selectedOvertime: action.payload,
                error: null
            };

        case GET_DATA_OVERTIME_BY_ID_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload.message,
                validationErrors: action.payload.errors || {}
            };

        case CLEAR_OVERTIME_FEEDBACK:
            return {
                ...state,
                message: '',
                error: null,
                validationErrors: {}
            };

        default:
            return state;
    }
};

export default overtimeReducer;
