import {
    Component,
    OnInit,
    ViewChild, ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { ApiReservationService } from '../../reservation/api.reservation.service';
import { ReservationDetailsModel } from '../../reservation/dialog-reservation-details/reservation.details.model';
import { CloseReservationModel } from '../../reservation/list/dialog-close-reservation/close.reservation.model';
import { NightValidationModel } from '../night-validation/night-validation.model';
import { TimeExtendModel } from '../time-extend/time-extend.model';

@Component({
    selector: 'sejour-list',
    templateUrl: './sejour.list.component.html',
    styleUrls: ['./sejour.list.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatIconModule,
        MatButtonModule,
        HighlightPipe,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        NgClass,
        MatPaginator,
        MatIconModule,
        FormsModule,
        MatTabsModule,
        DatePipe,
        SlicePipe,
        DisableIfNoPermissionDirective,
    ],
})
export class SejourListComponent implements OnInit {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'code',
        'period',
        'nights',
        'category',
        'roomAndGuests',
        'action',
    ];

    reservations;


    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];
    key = '';
    today = new Date();

    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _matDialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.dataSource.paginator = this._paginator;
        this.getSejour();
    }

    getSejour() {
        this.isLoading = true;
        this.dataSource.data = [];
        this._apiReservationService
            .getSejours()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    value?.forEach((row) => {
                        if (row?.guests) {
                            row?.guests.sort((a, b) => {
                                const orderA = a.role?.order || 0;
                                const orderB = b.role?.order || 0;
                                return orderA - orderB;
                            });
                        }
                    });
                    this.reservations = this.dataSource.data = value || [];
                    this.totalRows = value?.length || 0;
                    console.log(value);
                    setTimeout(() => {
                        if (this._paginator) {
                            this._paginator.pageIndex = this.currentPage;
                            this._paginator.length = this.totalRows;
                        }
                    });
                },
            });
    }

    raiseReservationDetailsDialog(reservation) {
        this._matDialog
            .open(ReservationDetailsModel, {
                data: { reservation: reservation },
                disableClose: true,
            })
            .afterClosed()
            .subscribe();
    }


    raiseCloseReservation(code) {
        if (!code) return;
        this._matDialog
            .open(CloseReservationModel, {
                data: { code: code },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result.reload) {
                    this.getSejour();
                }
            });
    }

    raiseNightValidate() {
        this._matDialog
            .open(NightValidationModel, {
                data: { reservations: this.reservations },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result.reload) {
                    this.getSejour();
                }
            });
    }

    raiseTimeExtend(r) {
        this._matDialog
            .open(TimeExtendModel, {
                data: { reservation: r },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result.reload) {
                    this.getSejour();
                }
            });
    }

    isOverdue(dateString: any): boolean {
        if (!dateString) return false;
        const dateToCheck = new Date(dateString);
        this.today.setHours(0, 0, 0, 0);
        dateToCheck.setHours(0, 0, 0, 0);
        return dateToCheck < this.today;
    }

    search(key: string): void {
        this.key = key?.trim().toLowerCase();

        // Si la clé est vide, on restaure la liste complète
        if (!this.key) {
            this.dataSource.data = this.reservations;
            return;
        }

        this.dataSource.data = this.reservations?.filter((res) => {
            // 1. Recherche dans les données de base de la réservation
            const basicInfo = [
                res.code,
                res.status?.name,
                res.category?.name,
                res.observation
            ].join(' ').toLowerCase();

            if (basicInfo.includes(this.key)) return true;

            // 2. Recherche profonde dans les invités (Guests)
            // .some() s'arrête dès qu'il trouve une correspondance
            const guestMatch = res.guests?.some((guest: any) => {
                const p = guest.person;
                const r = guest.room;

                const personInfo = [
                    p?.firstName,
                    p?.lastName,
                    p?.identity,
                    p?.matricule,
                    p?.grade?.code,
                    p?.grade?.name,
                    r?.name,
                    r?.roomType?.type
                ].join(' ').toLowerCase();

                return personInfo.includes(this.key);
            });

            return guestMatch;
        });

        // Retour à la première page de la pagination après filtrage
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    getNightsTooltip(row: any): string {
        if (!row.validatedNights || row.validatedNights.length === 0) {
            return "Aucune nuitée n'a encore été validée.";
        }

        const details = row.validatedNights.map(n => {
            const date = new Date(n.nightDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            return `• Le ${date} (${n.roomName} - ${n.roomPriceApplied} Dhs)`;
        }).join('\n'); // Le \n sera maintenant interprété grâce au CSS global

        const totalAmount = row.validatedNights.reduce((sum, n) => sum + (n.roomPriceApplied || 0), 0);

        return `DÉTAIL DES NUITS :\n` +
            `--------------------------\n` +
            `${details}\n` +
            `--------------------------\n` +
            `TOTAL : ${totalAmount} Dhs`;
    }

    getUniqueNightsCount(row: any): number {
        if (!row.validatedNights || row.validatedNights.length === 0) {
            return 0;
        }
        const uniqueDates = new Set(
            row.validatedNights.map(n => n.nightDate)
        );
        return uniqueDates.size;
    }

    getGroupedRooms(guests: any[]): any[] {
        if (!guests) return [];

        const groups = guests.reduce((acc, guest) => {
            const roomId = guest.room.id;
            if (!acc[roomId]) {
                acc[roomId] = { room: guest.room, occupants: [] };
            }
            acc[roomId].occupants.push(guest);
            return acc;
        }, {});

        return Object.values(groups);
    }
}
