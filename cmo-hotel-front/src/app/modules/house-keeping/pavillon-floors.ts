/**
 * Gestion des étages par pavillon.
 *
 * Liste fixe utilisée pour l'affichage et les impressions :
 *   - CHELLAH : étages 1 à 5
 *   - OUDAYA / OUDAYAS : étages 6 à 9 (chambres 601..907)
 *
 * Les étages supplémentaires réellement présents dans les données sont
 * également conservés (union).
 */
const PAVILLON_FLOORS: { match: RegExp; floors: string[] }[] = [
    { match: /chellah/i, floors: ['1', '2', '3', '4', '5'] },
    { match: /oudaya/i, floors: ['6', '7', '8', '9'] },
];

/** Liste des étages attendus pour un pavillon donné. */
export function pavillonFloors(pavillonName: string): string[] {
    const found = PAVILLON_FLOORS.find((p) => p.match.test(pavillonName || ''));
    return found ? [...found.floors] : [];
}

export function sortFloors(a: string, b: string): number {
    const na = Number(a);
    const nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) {
        return na - nb;
    }
    return String(a).localeCompare(String(b));
}

/**
 * Fusionne les étages attendus du pavillon avec ceux réellement présents
 * dans les données, puis trie le résultat.
 */
export function mergeFloors(pavillonName: string, presentFloors: string[]): string[] {
    const set = new Set<string>();
    (presentFloors || []).forEach((f) => set.add(String(f)));
    pavillonFloors(pavillonName).forEach((f) => set.add(f));
    return Array.from(set).sort(sortFloors);
}
