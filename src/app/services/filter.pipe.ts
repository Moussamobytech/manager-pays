import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../models/product.models';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  transform(items: Product[], searchTerm: string): any[] {
    if (!items || !searchTerm) {
      return items;
    }
    searchTerm = searchTerm.toLowerCase();
    return items.filter(item => item.nom.toLowerCase().includes(searchTerm));
  }

}
