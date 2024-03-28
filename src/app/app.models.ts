export class Category {
  constructor(public id: number,
              public nom:string,
              public hasSubCategory: boolean,
              public parentId: number){ }
}

export class Product {
  constructor(public id: number,
              public nom: string,
              public image1: Array<any>,
              public image2: Array<any>,
              public image3: Array<any>,
              public prix : number,
              public quantite: number,
              public oldPrice: number,
              public newPrice: number,
              public discount: number,
              public ratingsCount: number,
              public ratingsValue: number,
              public description: string,
              public availibilityCount: number,
              public cartCount: number,
              public color: Array<string>,
              public size: Array<string>,
              public weight: number,
              public categorie: Category){ }
}
