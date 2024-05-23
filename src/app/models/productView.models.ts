import { Product } from "./product.models";

export class ProductViews {
  constructor(public id: string,
              public product:Product,
              public viewDate: Date,
              public viewCount: number){ }
}
