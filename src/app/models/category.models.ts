export class Category {
    constructor(public id: string, 
                public nom:string, 
                public image:string, 
                public status:string, 
                public createdAt:string, 
                public updatedAt:string, 
                public hasSubCategory: boolean,
                public parentId: number){ }


}

export class User {
    id?: string;
    username?: string;
    createdAt?: string;
    updatedAt?: string;
    password?: string;
    firstname?: string;
    lastname?: string;
    phoneNumber?: string;
    adresse?: string;
    profiles?: string[];
    email?: string;
    avatar?: string;
    points?: number;
    isEnabled?: boolean;
}