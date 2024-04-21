export class UserAddForm {
  auth:Auth;
  contacts:Contact;
  firstname:string;
  lastname:string;
  type:Type;
}
export class UserEditForm {
  auth:Auth2;
  contacts:Contact;
  firstname:string;
  lastname:string;
  username:string
  type:Type;
}
class Auth2 {
  password1:string;
  password2:string;
  isEnabled:boolean
}
class Auth {
  password1:string;
  password2:string;
}
class Contact {
  email:string;
  phoneNumber:string;
  address:string;
}
class Type {
  name:string;
}
