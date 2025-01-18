export class Category {
  constructor(public id: string,
              public nom:string,
              public hasSubCategory: boolean,
              public parentId: number,
              public image: File,
              public status : string= 'actif'){ }
}

export class Products {
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
              public categorie: string,
              public contact: string,
              public user : User){ }
}

export class  User {
    constructor (public username: string,
                 public password: string,
                 public email: string,
                 public phoneNumber: number,
                 public firstname : string,
                 public lastname : string,
                 public adresse : string ,
                 ) {}




}


export class  Contact {
  constructor (
    public id: string,
             public name: string,
               public email: string,
               public phoneNumber: string,
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
               public produit : Products,
               public image : File,
               ) {}
}



export class  Brand {
  constructor (
    public logo : string,
    public id?: string,
    public name?: string,
    public description?: string,
    public etat?: boolean,
  ) {}
}


export class  Influencer {
  constructor (
               public id: string,
               public nomClomplet: string,
               public code: string,
               public etat: boolean,
               public email : string,
               public createdAt : string,
               ) {}
}

export class Newsletter{
  constructor(
        public id: string,
        public email: string,
        public etat:boolean
  ){}
}
