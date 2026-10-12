import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { ApiReservationService } from '../../reservation/api.reservation.service';
import { SwitchRoomModel } from '../../reservation/list/dialog-switch-room/switch.room.model';

@Component({
    selector: 'delogement-list',
    templateUrl: './delogement.list.component.html',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatTableModule,
        MatTooltipModule,
        MatSelectModule,
        MatPaginator,
        FormsModule,
        HighlightPipe,
        DatePipe,
        DecimalPipe,
        NgClass,
        RouterLink,
        DisableIfNoPermissionDirective,
    ],
})
export class DelogementListComponent implements OnInit {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;

    isLoading = false;
    key = '';
    selectedRoom = '';
    roomOptions: string[] = [];

    /** Lignes aplaties : une ligne = un occupant (client) en séjour. */
    occupants: any[] = [];

    displayedColumns: string[] = [
        'ref',
        'guest',
        'room',
        'period',
        'price',
        'action',
    ];

    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);

    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.dataSource.paginator = this._paginator;
        this.getOccupants();
    }

    getOccupants(): void {
        this.isLoading = true;
        this._apiReservationService
            .getSejours()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (rows: any[]) => {
                    this.occupants = this.flattenOccupants(rows || []);
                    this.buildRoomOptions();
                    this.applyFilters();
                },
                error: () => {
                    this.occupants = [];
                    this.buildRoomOptions();
                    this.applyFilters();
                },
            });
    }

    /**
     * Transforme chaque réservation en une ligne par occupant.
     */
    private flattenOccupants(reservations: any[]): any[] {
        const list: any[] = [];
        (reservations || []).forEach((res) => {
            (res?.guests || []).forEach((guest: any) => {
                list.push({
                    code: res?.code,
                    category: res?.category,
                    checkin: res?.checkin,
                    plannedEnd: res?.plannedEnd,
                    reservation: res,
                    guest: guest,
                    person: guest?.person,
                    room: guest?.room,
                    appliedPrice: guest?.appliedPrice ?? 0,
                });
            });
        });
        return list;
    }

    private buildRoomOptions(): void {
        const rooms = new Set<string>();
        this.occupants.forEach((row) => {
            const code = row?.room?.code || row?.room?.name;
            if (code) rooms.add(code);
        });
        this.roomOptions = Array.from(rooms).sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true })
        );
    }

    applyFilters(): void {
        let data = this.occupants || [];

        // Filtre par numéro de chambre
        if (this.selectedRoom) {
            data = data.filter(
                (row) =>
                    row?.room?.code === this.selectedRoom ||
                    row?.room?.name === this.selectedRoom
            );
        }

        // Filtre par mot-clé (occupant, chambre, code réservation...)
        if (this.key) {
            data = data.filter((row) =>
                this.buildSearchIndex(row).includes(this.key)
            );
        }

        this.dataSource.data = data;
    }

    private buildSearchIndex(row: any): string {
        const person = row?.person || {};
        const room = row?.room || {};
        return [
            row?.code,
            room?.code,
            room?.name,
            room?.roomType?.type,
            room?.pavillon?.name,
            person?.firstName,
            person?.lastName,
            person?.matricule,
            person?.grade?.code,
            person?.grade?.name,
            person?.grade?.category?.name,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
    }

    search(value: string): void {
        this.key = value?.trim().toLowerCase() || '';
        this.applyFilters();
    }

    filterByRoom(room: string): void {
        this.selectedRoom = room || '';
        this.applyFilters();
    }

    getOccupantName(row: any): string {
        const person = row?.person || {};
        return `${person?.firstName || ''} ${person?.lastName || ''}`.trim();
    }

    /**
     * Tarif affiché pour l'occupant : le prix appliqué au séjour s'il existe,
     * sinon le tarif de la grille du type de chambre pour sa catégorie de grade.
     */
    getCurrentTariff(row: any): number {
        const applied = Number(row?.appliedPrice);
        if (applied && applied > 0) {
            return applied;
        }
        return this.getGridPrice(row?.room, row?.person);
    }

    isAppliedTariff(row: any): boolean {
        const applied = Number(row?.appliedPrice);
        return !!applied && applied > 0;
    }

    private getGridPrice(room: any, person: any): number {
        const prices = room?.roomType?.prices;
        const categoryCode = person?.grade?.category?.code;
        if (!prices || !categoryCode) {
            return 0;
        }
        const entry = prices.find(
            (p: any) => p?.category?.code === categoryCode
        );
        return entry?.price ?? 0;
    }

    /**
     * Ouvre le dialogue de délogement (changement de chambre) pour l'occupant
     * ciblé. Le nouveau tarif est repris automatiquement de la grille tarifaire
     * du type de chambre selon la catégorie du grade.
     */
    raiseDeloger(row: any): void {
        if (!row?.guest?.id) return;
        this._matDialog
            .open(SwitchRoomModel, {
                data: {
                    reservation: row.reservation,
                    selectedGuestId: row.guest.id,
                    title: 'Délogement',
                },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result?.reload) {
                    this.getOccupants();
                }
            });
    }
}
