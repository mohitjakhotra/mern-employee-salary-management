import { describe, it, expect } from "vitest";
import {
  ALLOWED_DESIGNATIONS,
  validateDesignation,
} from "../designationValidation.js";

describe("validateDesignation", () => {
  it("accepts allowed designation values", () => {
    ALLOWED_DESIGNATIONS.forEach((designation) => {
      const result = validateDesignation(designation);
      expect(result).toEqual({ valid: true, error: null });
    });
  });

  it("rejects empty designation", () => {
    const result = validateDesignation("");
    expect(result).toEqual({
      valid: false,
      error: "Designation wajib dipilih",
    });
  });

  it("rejects designation outside allowed list", () => {
    const result = validateDesignation("Foreman");
    expect(result).toEqual({
      valid: false,
      error: "Designation tidak valid",
    });
  });
});
