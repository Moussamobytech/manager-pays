import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFr'
})
export class DateFrPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let date:Date = new Date(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month starts from 0, so add 1; pad with leading zero if needed
    const day = String(date.getDate()).padStart(2, '0'); // Pad with leading zero if needed
    const hour = String(date.getHours()).padStart(2, '0'); // Pad with leading zero if needed

    // switch(date){
    //   case date:
    // }
    return 'Le '+day+' '+month+' '+year+' a '+hour+'h';
  }

}
