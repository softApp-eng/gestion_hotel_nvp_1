import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'extractGuestData',
    standalone: true // Pour Angular moderne
})
export class ExtractGuestDataPipe implements PipeTransform {

    /**
     * @param row La ligne complète (ReservationDetails)
     * @param property Le chemin vers la donnée (ex: 'room' ou 'person.firstName')
     * @param unique Si vrai, supprime les doublons
     */
    transform(row: any, property: string, unique: boolean = true): any[] {
        if (!row || !row.guests) return [];

        // Extraction dynamique de la propriété (gère les chemins profonds comme 'person.firstName')
        const data = row.guests.map((guest: any) => {
            return property.split('.').reduce((obj, key) => obj?.[key], guest);
        });

        // Nettoyage des valeurs nulles/indéfinies
        const filteredData = data.filter((item: any) => item !== null && item !== undefined);

        if (unique) {
            // Gestion des doublons pour les objets (via ID) ou les primitives
            const seen = new Set();
            return filteredData.filter((item: any) => {
                const valueToCompare = (typeof item === 'object' && item.id) ? item.id : item;
                if (seen.has(valueToCompare)) return false;
                seen.add(valueToCompare);
                return true;
            });
        }
        return filteredData;
    }
}
