import { describe, it, expect } from "vitest";
import { validateNonNegativeFields } from "../salaryValidation.js";

describe("validateNonNegativeFields", () => {
  it("returns valid true for positive numbers", () => {
    const result = validateNonNegativeFields(
      {
        gaji_pokok: 1000000,
        tj_transport: "50000",
        uang_makan: 1000,
      },
      {
        gaji_pokok: "Gaji Pokok",
        tj_transport: "Tunjangan Transport",
        uang_makan: "Uang Makan",
      }
    );

    expect(result).toEqual({ valid: true, errors: {} });
  });

  it("returns error when any number is negative", () => {
    const result = validateNonNegativeFields(
      {
        gaji_pokok: -1,
        tj_transport: 100,
      },
      {
        gaji_pokok: "Gaji Pokok",
        tj_transport: "Tunjangan Transport",
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({
      gaji_pokok: "Gaji Pokok harus lebih dari 0",
    });
  });

  it("returns error when value is zero", () => {
    const result = validateNonNegativeFields(
      {
        jml_potongan: 0,
      },
      {
        jml_potongan: "Jumlah Potongan",
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({
      jml_potongan: "Jumlah Potongan harus lebih dari 0",
    });
  });

  it("returns error for non-numeric values", () => {
    const result = validateNonNegativeFields(
      {
        jml_potongan: "abc",
      },
      {
        jml_potongan: "Jumlah Potongan",
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({
      jml_potongan: "Jumlah Potongan harus berupa angka yang valid",
    });
  });
});
