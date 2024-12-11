export class Customer {
  id: any;
  nom: string;
  prenom: string;
  adresse: string;
  email: string;
  numero: string;
  commande: number;
  boutique: string;
  createdAt: string;
}

export class CustomerAdd {
  nom: string;
  prenom: string;
  adresse: string;
  email: string;
  numero: string;
}

export class CustomerUpdate {
  nom: string;
  prenom: string;
  adresse: string;
  email: string;
  numero: string;
}
