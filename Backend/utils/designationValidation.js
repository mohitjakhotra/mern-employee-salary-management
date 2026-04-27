const ALLOWED_DESIGNATIONS = [
  "Mason",
  "Electrician",
  "Plumber",
  "Supervisor",
  "Helper",
];

export const validateDesignation = (designation) => {
  if (typeof designation !== "string" || designation.trim() === "") {
    return {
      valid: false,
      error: "Designation wajib dipilih",
    };
  }

  if (!ALLOWED_DESIGNATIONS.includes(designation)) {
    return {
      valid: false,
      error: "Designation tidak valid",
    };
  }

  return {
    valid: true,
    error: null,
  };
};

export { ALLOWED_DESIGNATIONS };
