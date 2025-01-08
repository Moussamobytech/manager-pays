import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'UserSearchPipe', pure: false })
export class UserSearchPipe implements PipeTransform {
  transform(values: any[], args?: any): any {
    let searchText = new RegExp(args, 'ig');
    if (values) {
      return values.filter(value => {
        if (value.firstname||value.lastname||value.username) {
          return (value.firstname.search(searchText) !== -1)||(value.lastname.search(searchText) !== -1)||(value.username.search(searchText) !== -1||(value.profiles[0].name.search(searchText) !== -1));
        }else{
          return value.search(searchText) !== -1;
        }
      });
    }
  }
}
