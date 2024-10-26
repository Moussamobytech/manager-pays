// excel-export.service.ts
import * as XLSX from 'xlsx';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  exportToExcel(data: any[], fileName: string): void {
    // worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // maximum column widths
    const columnWidths = Object.keys(data[0]).map((key) => {
      // width for each column by finding the longest data entry
      const maxWidth = Math.max(
        key.length, // header width
        ...data.map((item) => String(item[key]).length) // data width
      );
      return { wch: maxWidth + 2 }; // add some padding
    });

    worksheet['!cols'] = columnWidths; // Set the column widths

    // Create a workbook and add the worksheet
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }
}
