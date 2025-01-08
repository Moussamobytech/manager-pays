import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'CustomerSearch', pure: false })
export class CustomerSearchPipe implements PipeTransform {
  transform(values: any[], args?: any): any {
    let searchText = new RegExp(args, 'ig');
    if (values) {
      return values.filter(value => {
        if (value.prenom||value.numero) {
          return (value.prenom.search(searchText) !== -1)||(value.numero.search(searchText) !== -1);
        }else{
          return value.search(searchText) !== -1;
        }
      });
    }
  }
}
