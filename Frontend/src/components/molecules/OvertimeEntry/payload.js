export const buildOvertimePayload = (formData) => ({
    worker_id: Number.parseInt(formData.worker_id, 10),
    date: formData.date,
    hours: Number.parseFloat(formData.hours),
    reason: formData.reason.trim()
});
