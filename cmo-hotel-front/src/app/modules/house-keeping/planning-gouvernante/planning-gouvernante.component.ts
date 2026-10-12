import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { mergeFloors, sortFloors } from '../pavillon-floors';
import { ApiReservationService } from '../../reservation/api.reservation.service';
import { ApiRoomService } from '../../pavillon/api.room.service';
import { ApiPavillonService } from '../../pavillon/api.pavillon.service';
import { User } from '../../../core/user/user.types';
import { UserService } from '../../../core/user/user.service';
import { Subject, takeUntil } from 'rxjs';

type DayStatus = 'ARRIVÉE' | 'DÉPART' | 'RECOUCHE';

interface WeekItem {
    type: DayStatus;
    guest: string;
    grade: string;
    time: string;
    category: string;
    code: string;
}

interface DayHead {
    date: Date;
    key: string;
    label: string;
    short: string;
    isToday: boolean;
    isWeekend: boolean;
}

interface RoomRow {
    room: any;
    floor: string;
    cells: Array<{ key: string; items: WeekItem[] }>;
}

interface PavilionGroup {
    id: string;
    name: string;
    rows: RoomRow[];
    total: number;
}

@Component({
    selector: 'planning-gouvernante',
    templateUrl: './planning-gouvernante.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatMenuModule,
        FormsModule,
        CommonModule,
        NgClass,
    ],
})
export class PlanningGouvernanteComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    user: User;

    /** Lundi de la semaine affichée */
    weekStart: Date = new Date();

    // Données
    private sejours: any[] = [];
    /** roomId -> (jour -> items) */
    private weekIndex = new Map<any, Map<string, WeekItem[]>>();

    // Filtres
    selectedPavillon = '';
    selectedFloor = '';
    searchKey = '';
    filterStatus: '' | DayStatus = '';

    // Pavillons et chambres
    pavillons: any[] = [];
    rooms: any[] = [];

    isLoading = false;

    constructor(
        private _apiReservationService: ApiReservationService,
        private _apiRoomService: ApiRoomService,
        private _apiPavillonService: ApiPavillonService,
        private _userService: UserService
    ) {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });
        this.weekStart = this.startOfWeek(new Date());
    }

    ngOnInit(): void {
        this.loadPavillons();
        this.loadRooms();
        this.loadPlanning();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // ------------------------------------------------------------------
    //  Dates
    // ------------------------------------------------------------------

    private pad(n: number): string {
        return n < 10 ? '0' + n : '' + n;
    }

    fmtDate(d: Date): string {
        return `${this.pad(d.getDate())}/${this.pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }

    private startOfDay(d: Date): Date {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    }

    private startOfWeek(date: Date): Date {
        const d = this.startOfDay(date);
        const day = d.getDay(); // 0 = dimanche
        const diff = day === 0 ? -6 : 1 - day; // lundi premier jour
        d.setDate(d.getDate() + diff);
        return d;
    }

    addDays(d: Date, n: number): Date {
        const x = new Date(d);
        x.setDate(x.getDate() + n);
        return x;
    }

    private isSameDay(a: Date, b: Date): boolean {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }

    private timeStr(d: Date | null): string {
        return d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    }

    get weekDays(): Date[] {
        return Array.from({ length: 7 }, (_, i) => this.addDays(this.weekStart, i));
    }

    get dayKeys(): string[] {
        return this.weekDays.map((d) => this.fmtDate(d));
    }

    get dayHeaders(): DayHead[] {
        const today = this.startOfDay(new Date()).getTime();
        return this.weekDays.map((date) => ({
            date,
            key: this.fmtDate(date),
            label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            short: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            isToday: date.getTime() === today,
            isWeekend: date.getDay() === 0 || date.getDay() === 6,
        }));
    }

    get weekLabel(): string {
        return `Semaine du ${this.fmtDate(this.weekStart)} au ${this.fmtDate(this.addDays(this.weekStart, 6))}`;
    }

    // ------------------------------------------------------------------
    //  Navigation semaine
    // ------------------------------------------------------------------

    prevWeek(): void {
        this.setWeek(this.addDays(this.weekStart, -7));
    }

    nextWeek(): void {
        this.setWeek(this.addDays(this.weekStart, 7));
    }

    thisWeek(): void {
        this.setWeek(new Date());
    }

    private setWeek(date: Date): void {
        this.weekStart = this.startOfWeek(date);
        this.buildWeekIndex();
    }

    // ------------------------------------------------------------------
    //  Chargement
    // ------------------------------------------------------------------

    loadPavillons(): void {
        this._apiPavillonService.all().subscribe({
            next: (data) => {
                this.pavillons = data || [];
            },
        });
    }

    loadRooms(): void {
        this._apiRoomService.grantedRooms().subscribe({
            next: (data) => {
                this.rooms = data || [];
            },
        });
    }

    loadPlanning(): void {
        this.isLoading = true;
        this._apiReservationService.getSejours().subscribe({
            next: (sejours: any[]) => {
                this.sejours = sejours || [];
                this.buildWeekIndex();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    /**
     * Construit l'index roomId -> jour -> items (ARRIVÉE / DÉPART / RECOUCHE)
     * pour la semaine courante, à partir des séjours.
     */
    private buildWeekIndex(): void {
        this.weekIndex = new Map();
        const days = this.weekDays.map((d) => this.startOfDay(d));

        (this.sejours || []).forEach((sejour) => {
            const guests = sejour?.guests || [];
            const code = sejour?.code;
            const plannedStartRaw = sejour?.plannedStart ? new Date(sejour.plannedStart) : null;
            const plannedEndRaw = sejour?.plannedEnd ? new Date(sejour.plannedEnd) : null;
            const plannedStart = plannedStartRaw ? this.startOfDay(plannedStartRaw) : null;
            const plannedEnd = plannedEndRaw ? this.startOfDay(plannedEndRaw) : null;

            guests.forEach((guest: any) => {
                const roomId = guest?.room?.id;
                if (roomId == null) {
                    return;
                }
                const person = guest?.person;
                const checkin = guest?.checkin ? new Date(guest.checkin) : null;
                const checkout = guest?.checkout ? new Date(guest.checkout) : null;
                const guestName = `${person?.firstName || ''} ${person?.lastName || ''}`.trim();
                const grade = person?.grade?.code || '';

                days.forEach((day) => {
                    const isCheckin = checkin ? this.isSameDay(checkin, day) : false;
                    const isCheckout = checkout ? this.isSameDay(checkout, day) : false;

                    let type: DayStatus | null = null;
                    if (isCheckin) {
                        type = 'ARRIVÉE';
                    } else if (isCheckout) {
                        type = 'DÉPART';
                    } else if (plannedStart && plannedEnd && day >= plannedStart && day < plannedEnd) {
                        type = 'RECOUCHE';
                    }

                    if (!type) {
                        return;
                    }

                    if (!this.weekIndex.has(roomId)) {
                        this.weekIndex.set(roomId, new Map());
                    }
                    const byDay = this.weekIndex.get(roomId)!;
                    const key = this.fmtDate(day);
                    if (!byDay.has(key)) {
                        byDay.set(key, []);
                    }
                    byDay.get(key)!.push({
                        type,
                        guest: guestName,
                        grade,
                        time: type === 'ARRIVÉE' ? this.timeStr(checkin) : type === 'DÉPART' ? this.timeStr(checkout) : '',
                        category: sejour?.category || '',
                        code: code || '',
                    });
                });
            });
        });
    }

    // ------------------------------------------------------------------
    //  Filtres / vue
    // ------------------------------------------------------------------

    onPavillonChange(): void {
        this.selectedFloor = '';
    }

    /** Étages disponibles pour le pavillon sélectionné (liste fixe + données) */
    get floorOptions(): string[] {
        const byPav = new Map<string, { name: string; floors: string[] }>();
        (this.rooms || []).forEach((r) => {
            if (this.selectedPavillon && r?.pavillon?.id?.toString() !== this.selectedPavillon) {
                return;
            }
            const key = r?.pavillon?.id?.toString() ?? 'none';
            const name = r?.pavillon?.name ?? 'Sans pavillon';
            if (!byPav.has(key)) {
                byPav.set(key, { name, floors: [] });
            }
            if (r?.floor != null && r.floor !== '') {
                byPav.get(key)!.floors.push(String(r.floor));
            }
        });
        const set = new Set<string>();
        byPav.forEach((v) => mergeFloors(v.name, v.floors).forEach((f) => set.add(f)));
        return Array.from(set).sort(sortFloors);
    }

    private roomWeekItems(roomId: any): WeekItem[] {
        const byDay = this.weekIndex.get(roomId);
        if (!byDay) {
            return [];
        }
        const out: WeekItem[] = [];
        this.dayKeys.forEach((k) => {
            (byDay.get(k) || []).forEach((it) => out.push(it));
        });
        return out;
    }

    /**
     * Chambres groupées par pavillon ; un tableau semaine par pavillon
     * (lignes = chambres, colonnes = 7 jours).
     */
    get displayGroups(): PavilionGroup[] {
        const search = (this.searchKey || '').toLowerCase().trim();

        let rooms = [...(this.rooms || [])];
        if (this.selectedPavillon) {
            rooms = rooms.filter((r) => r?.pavillon?.id?.toString() === this.selectedPavillon);
        }
        if (this.selectedFloor) {
            rooms = rooms.filter((r) => String(r?.floor ?? '') === this.selectedFloor);
        }
        if (this.filterStatus) {
            rooms = rooms.filter((r) => this.roomWeekItems(r.id).some((it) => it.type === this.filterStatus));
        }
        if (search) {
            rooms = rooms.filter((r) => {
                const items = this.roomWeekItems(r.id);
                return (
                    String(r.name || '').toLowerCase().includes(search) ||
                    String(r.code || '').toLowerCase().includes(search) ||
                    String(r.roomType?.type || '').toLowerCase().includes(search) ||
                    items.some((it) => String(it.guest || '').toLowerCase().includes(search))
                );
            });
        }

        const map = new Map<string, { id: string; name: string; rooms: any[] }>();
        rooms.forEach((room) => {
            const pk = room?.pavillon?.id?.toString() ?? 'none';
            const pn = room?.pavillon?.name ?? 'Sans pavillon';
            if (!map.has(pk)) {
                map.set(pk, { id: pk, name: pn, rooms: [] });
            }
            map.get(pk)!.rooms.push(room);
        });

        return Array.from(map.values())
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
            .map((pav) => {
                const sorted = [...pav.rooms].sort((a, b) => {
                    const fa = Number(a?.floor ?? 0);
                    const fb = Number(b?.floor ?? 0);
                    if (!isNaN(fa) && !isNaN(fb) && fa !== fb) {
                        return fa - fb;
                    }
                    return String(a.name || '').localeCompare(String(b.name || ''), undefined, {
                        numeric: true,
                        sensitivity: 'base',
                    });
                });

                const rows: RoomRow[] = sorted.map((room) => {
                    const byDay = this.weekIndex.get(room.id);
                    return {
                        room,
                        floor: room?.floor != null && room?.floor !== '' ? String(room.floor) : '—',
                        cells: this.dayKeys.map((k) => ({
                            key: k,
                            items: (byDay?.get(k) || []).filter(
                                (it) => !this.filterStatus || it.type === this.filterStatus
                            ),
                        })),
                    };
                });

                return { id: pav.id, name: pav.name, rows, total: rows.length };
            });
    }

    get totalRooms(): number {
        return this.displayGroups.reduce((s, g) => s + g.total, 0);
    }

    get stats(): { arrivals: number; departures: number; recouches: number } {
        let arrivals = 0;
        let departures = 0;
        let recouches = 0;
        this.weekIndex.forEach((byDay) =>
            byDay.forEach((items) =>
                items.forEach((it) => {
                    if (this.filterStatus && it.type !== this.filterStatus) {
                        return;
                    }
                    if (it.type === 'ARRIVÉE') {
                        arrivals++;
                    } else if (it.type === 'DÉPART') {
                        departures++;
                    } else {
                        recouches++;
                    }
                })
            )
        );
        return { arrivals, departures, recouches };
    }

    statusClass(type: DayStatus): string {
        if (type === 'ARRIVÉE') {
            return 'badge-arr';
        }
        if (type === 'DÉPART') {
            return 'badge-dep';
        }
        return 'badge-rec';
    }

    // ------------------------------------------------------------------
    //  Impression (même logique que le planning d'occupation, en semaine)
    // ------------------------------------------------------------------

    printPavillon(pavillonId: string): void {
        this.printPlanning(pavillonId);
    }

    printPlanning(pavillonId?: string): void {
        const days = this.dayHeaders;
        const groups = this.displayGroups.filter((g) => !pavillonId || g.id === pavillonId);
        if (groups.length === 0) {
            return;
        }

        const generated = new Date();
        const userName = this.user?.username || 'Système';

        const headCells = days
            .map(
                (d) =>
                    `<th class="${d.isWeekend ? 'weekend' : ''}${d.isToday ? ' today' : ''}">
                        <span class="d-label">${d.label}</span><span class="d-date">${d.short}</span>
                    </th>`
            )
            .join('');

        const sections = groups
            .map((pav) => {
                const rows = pav.rows
                    .map((row) => {
                        const room = row.room;
                        const typeLabel = room?.roomType?.type || room?.type || '';
                        const cells = row.cells
                            .map((c) => {
                                const content =
                                    c.items.length > 0
                                        ? c.items
                                              .map(
                                                  (it) =>
                                                      `<div class="cell-item">
                                                        <span class="badge ${this.statusClass(it.type)}">${it.type}</span>
                                                        ${it.guest ? `<span class="guest">${it.guest}</span>` : ''}
                                                       </div>`
                                              )
                                              .join('')
                                        : '<span class="dash">·</span>';
                                return `<td>${content}</td>`;
                            })
                            .join('');
                        return `<tr>
                            <td class="room-cell">
                                <div class="room-code">${room?.name || room?.code || ''}</div>
                                <div class="room-type">Étage ${row.floor}${typeLabel ? ' — ' + typeLabel : ''}</div>
                            </td>
                            ${cells}
                        </tr>`;
                    })
                    .join('');

                return `<section class="pavillon">
                    <h2>PLANNING D'OCCUPATION P. ${pav.name}</h2>
                    <table>
                        <thead><tr><th class="room-head">Chambre</th>${headCells}</tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </section>`;
            })
            .join('');

        const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Planning d'occupation — ${this.weekLabel}</title>
<style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 14px; color: #0f172a; }
    .doc-header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #4f46e5; padding-bottom:8px; margin-bottom:16px; }
    .doc-header h1 { font-size: 18px; margin: 0; }
    .doc-header .meta { text-align:right; font-size:12px; color:#475569; }
    .pavillon { margin-bottom: 20px; page-break-after: always; }
    .pavillon:last-child { page-break-after: auto; }
    .pavillon h2 { font-size: 15px; margin: 0 0 8px; background:#eef2ff; color:#3730a3; padding:6px 10px; border-radius:6px; text-transform:uppercase; }
    table { width:100%; border-collapse: collapse; font-size: 10px; table-layout: fixed; }
    th, td { border:1px solid #cbd5e1; padding:4px; text-align:center; vertical-align:middle; }
    thead th { background:#f8fafc; font-weight:700; }
    thead th.weekend { background:#f1f5f9; }
    thead th.today { background:#e0e7ff; }
    .d-label { display:block; text-transform:uppercase; font-size:9px; letter-spacing:.5px; }
    .d-date { display:block; font-size:10px; color:#475569; }
    .room-head { width:110px; }
    .room-cell { text-align:left; }
    .room-code { font-weight:800; font-size:12px; }
    .room-type { color:#64748b; font-size:9px; }
    td { vertical-align: top; height:44px; }
    .cell-item { display:flex; flex-direction:column; align-items:center; gap:1px; margin-bottom:2px; }
    .badge { border-radius:4px; padding:1px 4px; font-size:8px; font-weight:700; color:#fff; white-space:nowrap; }
    .badge-arr { background:#16a34a; }
    .badge-dep { background:#dc2626; }
    .badge-rec { background:#4f46e5; }
    .guest { font-size:8px; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
    .dash { color:#cbd5e1; }
    .legend { margin-top:14px; font-size:11px; color:#475569; display:flex; gap:16px; justify-content:flex-end; }
    .legend span { display:inline-flex; align-items:center; gap:5px; }
    .legend i { width:12px; height:12px; border-radius:3px; display:inline-block; }
    .footer { margin-top:10px; font-size:10px; color:#94a3b8; text-align:right; }
    @media print { body { margin: 8mm; } .pavillon { page-break-inside: avoid; } }
</style>
</head>
<body>
    <header class="doc-header">
        <h1>PLANNING D'OCCUPATION</h1>
        <div class="meta">
            <div><strong>${this.weekLabel}</strong></div>
            <div>Généré par ${userName} le ${this.fmtDate(generated)} à ${this.timeStr(generated)}</div>
        </div>
    </header>
    ${sections}
    <div class="legend">
        <span><i style="background:#16a34a"></i>ARRIVÉE</span>
        <span><i style="background:#dc2626"></i>DÉPART</span>
        <span><i style="background:#4f46e5"></i>RECOUCHE</span>
    </div>
    <div class="footer">CMO Hôtel — Service d'étage</div>
</body>
</html>`;

        const win = window.open('', '_blank', 'width=1200,height=800');
        if (!win) {
            return;
        }
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 400);
    }
}
