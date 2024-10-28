import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'exportButtonShow',
  pure: false
})

export class ExportButtonShowPipe implements PipeTransform {

  transform(items: any[], value: any): boolean {
    return items?.some(item => item.name === value);
  }
}
