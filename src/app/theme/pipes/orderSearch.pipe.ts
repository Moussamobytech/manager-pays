import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'OrderSearchPipe', pure: false })
export class OrderSearchPipe implements PipeTransform {
    transform(value: any[], args?: any): any {
        let searchText = new RegExp(args, 'ig');
        if (value) {
            return value.filter(order => {
                if (order.codeCommande || order.quantite || order.montant || order.dateCommande) {
                    return (order.codeCommande.search(searchText) !== -1) || 
                    (order.quantite.search(searchText) !== -1) ||
                    (order.montant.search(searchText) !== -1) ||
                    (order.dateCommande.search(searchText) !== -1 );
                } else {
                    return order.search(searchText) !== -1;
                }
            });
        }
    }
}
