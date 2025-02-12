import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'CommandeSearchPipe', pure: false })
export class CommandeSearchPipe implements PipeTransform {
    transform(value: any[], args?: any): any {
        let searchText = new RegExp(args, 'ig');
        if (value) {
            return value.filter(commande => {
                if (commande.codeCommande || commande.quantite || commande.montant || commande.dateCommande) {
                    return (commande.codeCommande.search(searchText) !== -1) || 
                    (commande.quantite.search(searchText) !== -1) ||
                    (commande.montant.search(searchText) !== -1) ||
                    (commande.dateCommande.search(searchText) !== -1 );
                } else {
                    return commande.search(searchText) !== -1;
                }
            });
        }
    }
}
