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
import { DatePipe, DecimalPipe, NgClass, NgForOf, SlicePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { DisableIfNoPermissionDirective } from '../../core/auth/DisableIfNoPermissionDirective';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { ApiReservationService } from '../reservation/api.reservation.service';
import { HighlightPipe } from '../../../@fuse/pipes/HighlightPipe';
import { ReservationDetailsModel } from '../reservation/dialog-reservation-details/reservation.details.model';
import { UtilsService } from '../../core/service/utils.service';
import { Toastr } from '../../core/service/toastr.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
    selector: 'depart-prevu',
    templateUrl: './depart-prevu.list.component.html',
    styleUrls: ['./depart-prevu.list.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatIconModule,
        MatButtonModule,
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
        DisableIfNoPermissionDirective,
        DecimalPipe,
        SlicePipe,
        MatDatepickerModule,
        MatNativeDateModule,
    ],
})
export class DepartPrevuListComponent implements OnInit {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    isLoadingStatistics: boolean = false;
    displayedColumns: string[] = [
        'details',
        'period',
        'category',
        'pax',
        'roomAndGuests',
        'nights',
        'pc',
    ];

    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];
    today = new Date();
    selectedDate: Date = new Date();

    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _matDialog: MatDialog,
        private _utils: UtilsService,
        private _toast: Toastr
    ) {}

    ngOnInit(): void {
        this.dataSource.paginator = this._paginator;
        this.getData();
    }

    onDateChange(newDate: Date): void {
        if (newDate) {
            this.selectedDate = newDate;
            this.getData(); // Recharge les données pour la nouvelle date choisie
        }
    }

    getData(): void {
        this.isLoading = true;
        this.dataSource.data = [];

        // Formate la date au format 'dd/MM/yyyy' exigé par l'API backend
        const formattedDate = this._utils.convertToDate(this.selectedDate);

        this._apiReservationService
            .getDepartPrevu(formattedDate)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.dataSource.data = value || [];
                },
                error: (err) => {
                    this._toast.error(
                        'Erreur lors du chargement des départs prévus'
                    );
                },
            });
    }

    /**
     * Utilitaire pour convertir un objet Date au format string 'dd/MM/yyyy'
     */
    private formatDateToISO(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Exemple: 2026-10-01
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

    getNightsTooltip(row: any): string {
        const missing = row.missingNights || [];
        if ((!row.validatedNights || row.validatedNights.length === 0) && missing.length === 0) {
            return "Aucune nuitée n'a encore été validée.";
        }

        const details = (row.validatedNights || [])
            .map((n) => {
                const date = new Date(n.nightDate).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                });
                return `• Le ${date} (${n.roomName} - ${n.roomPriceApplied} Dhs)`;
            })
            .join('\n'); // Le \n sera maintenant interprété grâce au CSS global

        const totalAmount = (row.validatedNights || []).reduce(
            (sum, n) => sum + (n.roomPriceApplied || 0),
            0
        );

        const missingDetails = missing
            .map((m) => {
                const date = new Date(m).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                });
                return `• Le ${date} (non validée)`;
            })
            .join('\n');

        return (
            `DÉTAIL DES NUITS :\n` +
            `--------------------------\n` +
            `${details}\n` +
            `--------------------------\n` +
            `TOTAL : ${totalAmount} Dhs` +
            (missing.length > 0
                ? `\n--------------------------\nNUITS NON VALIDÉES (${missing.length}) :\n${missingDetails}`
                : '')
        );
    }

    getUniqueNightsCount(row: any): number {
        if (!row.validatedNights || row.validatedNights.length === 0) {
            return 0;
        }
        const uniqueDates = new Set(
            row.validatedNights.map((n) => n.nightDate)
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

    calculateTotalPrice(validatedNights: any): number {
        if (!validatedNights) {
            return 0;
        }

        return validatedNights.reduce((total, night) => {
            // On s'assure que le prix est un nombre pour éviter les erreurs de concaténation
            const price = night.roomPriceApplied || 0;
            return total + price;
        }, 0);
    }

    processDownloadEncassement(action: 'download' | 'print'): void {
        this._apiReservationService.generateMainCourantePdf().subscribe({
            next: (blob: Blob) => {
                const blobUrl = window.URL.createObjectURL(blob);

                if (action === 'download') {
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = `Main-courante_${this._utils.convertToDate(this.today).replace('/', '-')}.pdf`;
                    link.click();
                } else {
                    const printWindow = window.open(blobUrl, '_blank');
                    if (printWindow) {
                        printWindow.focus();
                    }
                }

                // Nettoyage de la mémoire
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
                //this.loadingFicheId = null;
            },
            error: (err) => {
                console.error('Erreur PDF:', err);
                //this.loadingFicheId = null;
                this._toast.error('erreur de generation de la main courante');
            },
        });
    }

    // Calculer le total Espèces (Direct Pay) pour un pavillon
    getTotalDirect(pavillon: any): number {
        return pavillon.roomTypeStats.reduce(
            (acc, curr) => acc + curr.occupantsDirectPay,
            0
        );
    }

    // Calculer le total Prise en Charge pour un pavillon
    getTotalPEC(pavillon: any): number {
        return pavillon.roomTypeStats.reduce(
            (acc, curr) => acc + curr.occupantsPriseEnCharge,
            0
        );
    }

    // Pourcentage par type de chambre
    getPercent(val: number, type: any): string {
        const total = type.occupantsDirectPay + type.occupantsPriseEnCharge;
        return total > 0 ? ((val / total) * 100).toFixed(1) : '0';
    }

    // Pourcentage global par pavillon
    getGlobalPercent(pavillon: any, mode: 'ESP' | 'PEC'): string {
        const totalDirect = this.getTotalDirect(pavillon);
        const totalPEC = this.getTotalPEC(pavillon);
        const total = totalDirect + totalPEC;

        if (total === 0) return '0';
        return mode === 'ESP'
            ? ((totalDirect / total) * 100).toFixed(1)
            : ((totalPEC / total) * 100).toFixed(1);
    }
}
