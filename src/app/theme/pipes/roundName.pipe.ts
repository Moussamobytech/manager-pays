import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundName'
})
export class RoundNamePipe implements PipeTransform {

  transform(value: any, arg?: any): any {
    let values:string = value;
    if(values.length > arg)
      return values.substring(0,arg)+'...';
    else
      return values;
  }

}
