export class Campagne {
    constructor(public id: string,
                public nom: string,
                public montantMinAchat:number,
                public montantMaxAchat:number,
                public reduction:number, // En % ou montant fixe
                public commissionParrain:number, // En % ou montant fixe
                public seuilRetrait:number,
                public nombreUtilisation:number,
                public type:string,
                public dateDebut:string,
                public dateFin:string, 
                public createdAt:string,
                public updatedAt:string,
               ){ }
  }
