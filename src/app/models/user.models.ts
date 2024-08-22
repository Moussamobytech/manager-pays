export class User {
  id?: string;
  username: string;
  firstname?: string|null;
  lastname?: string|null;
  email?: string|null;
  phoneNumber?: string|null;
  adresse?: string|null;
  boutique?: string|null;
  password?: string;
  profiles?: Profile[];
  avatar?: string;
  points?: number|null;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class Profile {
    id?: string;
    name?: string
}







// export class User {
//   id: number;
//   username: string;
//   password: string;
//   profile: UserProfile;
//   work: UserWork;
//   contacts: UserContacts;
//   social: UserSocial;
//   settings: UserSettings;
// }

// export class UserProfile {
//   name: string;
//   surname: string;
//   birthday: Object;
//   gender: string;
//   image: string;
// }

// export class UserWork {
//   company: string;
//   position: string;
//   salary: number;
// }

// export class UserContacts{
//   email: string;
//   phone: string;
//   address: string;
// }

// export class UserSocial {
//   facebook: string;
//   twitter: string;
//   google: string;
// }

// export class UserSettings{
//   isActive: boolean;
//   isDeleted: boolean;
//   registrationDate: Date;
//   joinedDate: Date;
// }
