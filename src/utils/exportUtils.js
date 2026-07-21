/**
 * Utility function to export JS array of objects to a downloadable CSV file.
 * Handles escaping strings, commas, and double quotes.
 */
export const exportToCSV = (data, filename = 'report.csv') => {
  if (!data || !data.length) {
    return;
  }
  
  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Format rows
  const rows = data.map((item) => {
    return headers
      .map((header) => {
        let val = item[header];
        // Convert null/undefined to empty string
        let str = val === null || val === undefined ? '' : String(val);
        // Escape quotes
        str = str.replace(/"/g, '""');
        // Wrap in quotes if special chars exist
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          str = `"${str}"`;
        }
        return str;
      })
      .join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
