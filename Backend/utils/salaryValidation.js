export const validateNonNegativeFields = (payload, fieldLabels) => {
  const errors = {};

  Object.entries(fieldLabels).forEach(([fieldName, fieldLabel]) => {
    const value = payload[fieldName];
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      errors[fieldName] = `${fieldLabel} harus berupa angka yang valid`;
      return;
    }

    if (numericValue <= 0) {
      errors[fieldName] = `${fieldLabel} harus lebih dari 0`;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
