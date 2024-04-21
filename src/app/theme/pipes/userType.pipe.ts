import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userType'
})
export class UserTypePipe implements PipeTransform {

  transform(val: any, args?: any): any {
    let value:string = val;
    if( (/admin/ig).test(value) ){
      return ('admin').toUpperCase();
    }else if( (/particulier/ig).test(value) ){
      return ('particulier').toUpperCase();
    }else if( (/boutique/ig).test(value) ){
      return ('boutique').toUpperCase()
    }else{
      return ('inconnue').toUpperCase()
    }

  }

}
