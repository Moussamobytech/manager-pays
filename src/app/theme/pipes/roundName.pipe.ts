import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundName'
})
export class RoundNamePipe implements PipeTransform {

  transform(value: any, arg1: number = 15, arg2: boolean): any {
    let values:string = value;
    if(values.length > arg1 && arg2)
      return values.substring(0,arg1)+'...';
    else
      return values;
  }

}
