import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'UserSearchPipe', pure: false })
export class UserSearchPipe implements PipeTransform {
  transform(value: any[], args?: any): any {
    let searchText = new RegExp(args, 'ig');
    if (value) {
      return value.filter(user => {
        if (user.firstname||user.lastname||user.username) {
          return (user.firstname.search(searchText) !== -1)||(user.lastname.search(searchText) !== -1)||(user.username.search(searchText) !== -1||(user.profiles[0].name.search(searchText) !== -1));
        }else{
          return user.search(searchText) !== -1;
        }
      });
    }
  }
}
