/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 * @param {Object[]} data - Array of row objects
 * @param {Object[]} columns - [{ label: 'Display Name', key: 'objectKey' }]
 * @param {string} filename - Output filename without extension
 */

export const exportToCsv = (data, columns, filename = 'export') => {
  if (!data || data.length === 0) return;

  const header = columns.map((col) => `"${col.label}"`).join(',');

  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key] ?? '';
        // Escape double-quotes inside cell values
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};