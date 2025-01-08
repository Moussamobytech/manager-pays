import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'discount'
})
export class DiscountConverterPipe implements PipeTransform {

  transform(value1: any, value2: any): any {
    const basic = Number(value1);
    const promo = Number(value2);
    const  diff = basic - promo;
    let discount = ((diff*100)/basic).toFixed(0);
    return discount;
  }

}
