/**
 * Étages des chambres.
 *
 * Le NUMÉRO de chambre est la source la plus fiable (ex. « 601 » → étage 6,
 * « 101 » → étage 1) : le champ `floor` stocké en base peut être mal renseigné
 * (cas historique OUDAYA où presque toutes les chambres étaient en étage 1).
 * On retombe sur `floor` si le nom n'est pas numériquement interprétable,
 * puis sur « — ».
 */
export function roomFloorLabel(room: any): string {
    const name = String(room?.name ?? '').trim();
    if (/^\d{3,}$/.test(name)) {
        return String(Math.floor(Number(name) / 100));
    }
    const floor = room?.floor;
    if (floor !== null && floor !== undefined && String(floor).trim() !== '') {
        return String(floor).trim();
    }
    return '—';
}

/** Compare deux libellés d'étage (numérique si possible, sinon alphabétique). */
export function compareFloorKeys(a: string, b: string): number {
    if (a === '—') {
        return 1;
    }
    if (b === '—') {
        return -1;
    }
    const na = Number(a);
    const nb = Number(b);
    if (!isNaN(na) && !isNaN(nb) && na !== nb) {
        return na - nb;
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}
