import {
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe, NgClass, SlicePipe } from '@angular/common';
import { ApiInvoiceService } from '../api.invoice.service';
import {
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerInputEvent,
    MatDatepickerToggle,
} from '@angular/material/datepicker';
import { UtilsService } from '../../../core/service/utils.service';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { InvoiceDetailsModel } from '../details/invoice.details.model';
import { Toastr } from '../../../core/service/toastr.service';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';

@Component({
    selector: 'encaissement',
    templateUrl: './encaissement.component.html',
    styleUrls: ['./encaissement.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        MatSidenavModule,
        MatIconModule,
        FormsModule,
        MatTabsModule,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        ReactiveFormsModule,
        DatePipe,
        DecimalPipe,
        SlicePipe,
        NgClass,
        DisableIfNoPermissionDirective,
    ],
})
export class EncaissementComponent implements OnInit {
    isLoading: boolean = false;
    displayedColumns2: string[] = [
        'num',
        'period',
        'category',
        'roomAndGuests',
        'paidAt',
        'prices',
    ];

    dateControl = new FormControl(new Date());

    summaryDisplayedColumns: string[] = ['mode', 'count', 'total'];

    encaissements = [
        { mode: 'PRISE_EN_CHARGE', title: 'Prise en charge', data: [] },
        { mode: 'TPE', title: 'TPE', data: [] },
        { mode: 'ESPECE', title: 'Espèce', data: [] },
        { mode: 'CHEQUE', title: 'Cheque', data: [] },
    ];

    loadingFicheId: number | null = null;

    /**
     * Constructor
     */
    constructor(
        private _apiInvoiceService: ApiInvoiceService,
        private _toast: Toastr,
        private _utilsService: UtilsService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.fetchData(this.dateControl.value);
    }

    fetchData(selectedDate: Date | null): void {
        if (!selectedDate) return;
        this.isLoading = true;
        this._apiInvoiceService
            .getEncaissement(this._utilsService.convertToDate(selectedDate))
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.prepareData(value);
                },
                error: () => {
                    this.clearData();
                },
            });
    }

    prepareData(data: any): any {
        this.clearData();
        const groupedByPayment = data?.reduce((acc, item) => {
            const mode = item.paymentMode?.code || 'Unknown';
            if (!acc[mode]) acc[mode] = [];
            acc[mode].push(item);
            return acc;
        }, {});

        this.encaissements = this.encaissements.map((enc) => ({
            ...enc,
            data: groupedByPayment[enc.mode] || [],
        }));

        console.log('encaissements', this.encaissements);
    }

    clearData(): void {
        this.encaissements = this.encaissements.map((enc) => ({
            ...enc,
            data: [],
        }));
    }

    onDateChange(event: MatDatepickerInputEvent<Date>): void {
        this.fetchData(event.value);
    }

    openDetailsModal(row) {
        if (!row) return;
        this._matDialog
            .open(InvoiceDetailsModel, {
                data: { invoice: row },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result?.reload) {
                    this.fetchData(this.dateControl.value);
                }
            });
    }
    getNightsTooltip(row: any): string {
        if (!row.validatedNights || row.validatedNights.length === 0) {
            return "Aucune nuitée n'a encore été validée.";
        }

        const details = row.validatedNights
            .map((n) => {
                const date = new Date(n.nightDate).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                });
                return `• Le ${date} (${n.roomName} - ${n.roomPriceApplied} Dhs)`;
            })
            .join('\n');

        const totalAmount = row.validatedNights.reduce(
            (sum, n) => sum + (n.roomPriceApplied || 0),
            0
        );

        return (
            `DÉTAIL DES NUITS :\n` +
            `--------------------------\n` +
            `${details}\n` +
            `--------------------------\n` +
            `TOTAL : ${totalAmount} Dhs`
        );
    }

    getGroupedRooms(invoiceRooms: any[]): any[] {
        if (!invoiceRooms) return [];

        return invoiceRooms.map((room) => ({
            room: {
                name: room.roomName,
                roomType: { type: room.roomType },
                id: room.id,
            },
            occupants: room.guests,
        }));
    }

    getTotalMontantByMode(mode: string): number {
        // On cherche l'objet encaissement correspondant au mode
        const encaissement = this.encaissements.find((e) => e.mode === mode);

        if (!encaissement || !encaissement.data) return 0;

        return encaissement.data.reduce(
            (acc, row) =>
                acc +
                (row.totalRoomPrice || 0) +
                (row.totalPrestationPrice || 0),
            0
        );
    }

    // Getter pour construire les données du tableau récapitulatif
    get summaryData(): any[] {
        return this.encaissements
            .map((enc) => {
                // Calcul du total pour ce mode précis
                const totalMode = enc.data.reduce(
                    (acc, row) =>
                        acc +
                        (row.totalRoomPrice || 0) +
                        (row.totalPrestationPrice || 0),
                    0
                );

                return {
                    mode: enc.title,
                    count: enc.data.length,
                    total: totalMode,
                };
            })
            .filter((item) => item.count > 0); // Optionnel: n'afficher que les modes qui ont des données
    }

    get grandTotalEncaissement(): number {
        return this.summaryData.reduce((acc, curr) => acc + curr.total, 0);
    }
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;

    processDownloadEncassement(action: 'download' | 'print'): void {
        //this.loadingFicheId = this.dateControl.value;
        let day = this._utilsService.convertToDate(this.dateControl.value);

        this._apiInvoiceService
            .generateEncaissementPdf(day)
            .subscribe({
                next: (blob: Blob) => {
                    const blobUrl = window.URL.createObjectURL(blob);

                    if (action === 'download') {
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `Encaissement_${day.replace('/', '-')}.pdf`;
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
                    this._toast.error(
                        'erreur de generation de la fiche de réservation'
                    );
                },
            });
    }
}
