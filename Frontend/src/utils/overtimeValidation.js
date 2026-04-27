const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getTodayString = () => {
    return toLocalDateString(new Date());
};

export const getSevenDaysAgoString = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return toLocalDateString(date);
};

export const validateOvertimeInput = (formData) => {
    const errors = {};
    const today = getTodayString();
    const sevenDaysAgo = getSevenDaysAgoString();

    if (!formData.worker_id) {
        errors.worker_id = 'Worker is required';
    }

    if (!formData.date) {
        errors.date = 'Date is required';
    } else {
        if (formData.date > today) {
            errors.date = 'Date cannot be in the future';
        }
        if (formData.date < sevenDaysAgo) {
            errors.date = 'Date cannot be more than 7 days in the past';
        }
    }

    if (!formData.hours && formData.hours !== 0) {
        errors.hours = 'Hours are required';
    } else {
        const hours = Number.parseFloat(formData.hours);
        if (Number.isNaN(hours) || hours < 1 || hours > 6) {
            errors.hours = 'Hours must be between 1 and 6';
        }
    }

    if (!formData.reason?.trim()) {
        errors.reason = 'Reason is required';
    } else if (formData.reason.trim().length < 10) {
        errors.reason = 'Reason must be at least 10 characters';
    }

    return errors;
};
