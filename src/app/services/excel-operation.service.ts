// excel-export.service.ts
import * as XLSX from 'xlsx';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ExcelOperationService {

  constructor(private auth:AuthenticationService) {}

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


  importCustomerFromExcel(file: File): Promise<any[]> {
    let thisBoutique = this.auth.currentUser().username;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Assume data is in the first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // JSON conversion
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          let errorFieldIndex = 0;
          const actualHeaders = jsonData[0];
          const modeleExpectedKeys = ['prenom', 'nom' /*, 'email'*/, 'numero', 'adresse'];

          const isValid = modeleExpectedKeys.every((header, index) => {
            const normalizedHeader = header.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const normalizedActualHeader = actualHeaders[index].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

            errorFieldIndex = index ;
            return normalizedHeader === normalizedActualHeader;
          });

          if (!isValid) {
            reject({name:actualHeaders[errorFieldIndex]});
            return;
          }
          //check if the file contains data
          if (jsonData.length <= 1) {
            reject({FileEmpty:true});
            return;
          }

          const processedData = jsonData.slice(1).map((row) => ({
            prenom: row[0],
            nom: row[1],
            // email: row[2],
            numero: row[2],
            adresse: row[3],
            boutique: thisBoutique
          }));

          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);

      reader.readAsArrayBuffer(file);
    });
  }
}
