/**
 * Gestion des étages par pavillon.
 *
 * Liste fixe utilisée pour l'affichage et les impressions :
 *   - CHELLAH : étages 1 à 5
 *   - OUDAYA / OUDAYAS : étages 1 à 4
 *
 * Les étages supplémentaires réellement présents dans les données sont
 * également conservés (union).
 */
const PAVILLON_MAX_FLOORS: { match: RegExp; max: number }[] = [
    { match: /chellah/i, max: 5 },
    { match: /oudaya/i, max: 4 },
];

/** Liste des étages attendus (1..N) pour un pavillon donné. */
export function pavillonFloors(pavillonName: string): string[] {
    const found = PAVILLON_MAX_FLOORS.find((p) => p.match.test(pavillonName || ''));
    const max = found ? found.max : 0;
    const list: string[] = [];
    for (let i = 1; i <= max; i++) {
        list.push(String(i));
    }
    return list;
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
