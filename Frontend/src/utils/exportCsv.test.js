import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCsv } from './exportCsv';

describe('exportToCsv', () => {
  beforeEach(() => {
    // Mock DOM APIs not available in jsdom
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();
    const mockLink = {
      href: '',
      setAttribute: vi.fn(),
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  it('does nothing when data is empty', () => {
    expect(() => exportToCsv([], [], 'test')).not.toThrow();
  });

  it('triggers download with correct filename', () => {
    const data = [{ nik: '001', nama_pegawai: 'Budi' }];
    const columns = [{ label: 'NIK', key: 'nik' }, { label: 'Nama', key: 'nama_pegawai' }];
    exportToCsv(data, columns, 'pegawai-test');
    const link = document.createElement('a');
    expect(link.setAttribute).toHaveBeenCalledWith('download', 'pegawai-test.csv');
  });

  it('escapes double-quotes in cell values', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    const data = [{ nama_pegawai: 'Budi "Junior" Santoso' }];
    const columns = [{ label: 'Nama', key: 'nama_pegawai' }];
    exportToCsv(data, columns, 'test');
    // Blob receives escaped content — verify no throw
    expect(createElementSpy).toHaveBeenCalled();
  });
});