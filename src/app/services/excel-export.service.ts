// excel-export.service.ts
import * as XLSX from 'xlsx';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  exportToExcel(data: any[], fileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // maximum column widths
    const columnWidths = Object.keys(data[0]).map((key) => {
      // longest data entry
      const maxWidth = Math.max(
        key.length,
        ...data.map((item) => String(item[key]).length)
      );
      return { wch: maxWidth + 2 }; // the 2 is for the padding
    });

    worksheet['!cols'] = columnWidths; // column widths

    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Excel file generation
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }
}
