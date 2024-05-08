export class Category {
  constructor(public id: string,
              public nom:string,
              public hasSubCategory: boolean,
              public parentId: number,
              public image: File,
              public status : string= 'actif'){ }
}

export class Product {
  constructor(public id: string,
              public nom: string,
              public image1: Array<any>,
              public image2: Array<any>,
              public image3: Array<any>,
              public image4: Array<any>,
              public image5: Array<any>,
              public prix : number,
              public pricePromotion: number,
              public priceBasic : number,
              public quantite: number,
              public oldPrice: number,
              public newPrice: number,
              public discount: number,
              public ratingsCount: number,
              public rate: number,
              public description: string,
              public availibilityCount: number,
              public cartCount: number,
              public color: Array<string>,
              public size: Array<string>,
              public weight: number,
              public categorie: Category,
              public contact: string,
              public user : User){ }
}

export class  User {
    constructor (public username: string,
                 public password: string,
                 public email: string,
                 public phoneNumber: number,
                 public firstname : string,
                 public lastname : string
                 ) {}




}


export class  Contact {
  constructor (
    public id: string,
             public name: string,
               public email: string,
               public phoneNumber: number,
               public message : string,
               ) {}
}



export class  Campagne {
  constructor (
               public id: string,
               public libelle: string,
               public username: string,
               public type: string,
               public etat: boolean,
               public dateDebut : Date,
               public dateFin : Date,
               public produit : Product,
               public image : File,
               ) {}
}



export class  Brand {
  constructor (
               public id: string,
               public libelle: string,
               public description: string,
               public etat: boolean,
               public logo : File,
               ) {}
}

export class Newsletter{
  constructor(
        public id: string,
        public email: string,
        public etat:boolean
  ){}
}
