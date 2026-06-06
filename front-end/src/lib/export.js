import * as XLSX from 'xlsx';

/**
 * Reusable utility to export JSON data arrays into native Excel (.xlsx) files
 * @param {Array<Object>} data Raw objects list
 * @param {string} fileName Target download file name
 * @param {Object} keyMap Mapping of object keys to display labels: { key: "Column Label" }
 */
export function exportToExcel(data, fileName = "export.xlsx", keyMap = null) {
  if (!data || data.length === 0) {
    alert("Không có dữ liệu để xuất Excel!");
    return;
  }

  // 1. Map keys to user-friendly column headers if keyMap is provided
  let formattedData = data;
  if (keyMap) {
    formattedData = data.map(item => {
      const formattedItem = {};
      Object.keys(keyMap).forEach(k => {
        if (item[k] !== undefined) {
          formattedItem[keyMap[k]] = item[k];
        }
      });
      return formattedItem;
    });
  }

  // 2. Create SheetJS objects
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dữ liệu");

  // 3. Trigger native browser file download
  XLSX.writeFile(workbook, fileName);
}
