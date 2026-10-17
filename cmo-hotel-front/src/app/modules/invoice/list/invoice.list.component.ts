import {
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize, Subject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { DatePipe, DecimalPipe, NgClass, SlicePipe } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {  MatSidenavModule } from '@angular/material/sidenav';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ApiCommonService } from '../../../core/service/api.common.service';
import { UtilsService } from '../../../core/service/utils.service';
import {DisableIfNoPermissionDirective} from "../../../core/auth/DisableIfNoPermissionDirective";
import { FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { Toastr } from '../../../core/service/toastr.service';
import { ApiInvoiceService } from '../api.invoice.service';
import { PaymentModel } from '../payment-model/payment.model';
import {InvoiceDetailsModel} from "../details/invoice.details.model";
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
    selector: 'invoice-list',
    templateUrl: './invoice.list.component.html',
    styleUrls: ['./invoice.list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
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
        MatSidenavModule,
        MatIconModule,
        FormsModule,
        MatTabsModule,
        MatDatepickerModule,
        DatePipe,
        SlicePipe,
        MatOption,
        MatSelect,
        DisableIfNoPermissionDirective,
        DecimalPipe,
        MatCheckboxModule,
        MatSlideToggle,
    ],
})
export class InvoiceListComponent implements OnInit, OnDestroy {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'num', // 2
        'period', // 20
        'category', // 15
        'roomAndGuests', // 35
        'prices', // 10
        'status', // 10
        'action', // 8
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];

    loadingFicheId: number | null = null;

    categories = [];
    paymentModes = [];
    status = [];
    filters = {
        key: '',
        room: '',
        priseEnCharge: false,
        categories: [],
        paymentModes: [],
        status: [],
        startDate: null,
        endDate: null,
        checkinFrom: null,
        checkinTo: null,
        checkoutFrom: null,
        checkoutTo: null,
    };

    /**
     * Constructor
     */
    constructor(
        private _apiInvoiceService: ApiInvoiceService,
        private _apiCommonService: ApiCommonService,
        private _matDialog: MatDialog,
        private _toast: Toastr,
        private _utilsService: UtilsService
    ) {}

    // TODO si la facture non encore payée alors affiher les chambres et lec clients à partir de reservationDetails sinon en les recupere depuis reservationDetails

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

    get activeFiltersCount(): number {
        let count = 0;
        if (this.filters.key !== '') count++;
        if (this.filters.room !== '') count++;
        if (this.filters.priseEnCharge) count++;
        if (this.filters.categories.length > 0) count++;
        if (this.filters.paymentModes.length > 0) count++;
        if (this.filters.status.length > 0) count++;
        if (this.filters.startDate || this.filters.endDate) count++;
        if (this.filters.checkinFrom || this.filters.checkinTo) count++;
        if (this.filters.checkoutFrom || this.filters.checkoutTo) count++;
        return count;
    }

    resetFilters() {
        this.filters = {
            key: '',
            room: '',
            priseEnCharge: false,
            categories: [],
            paymentModes: [],
            status: [],
            startDate: null,
            endDate: null,
            checkinFrom: null,
            checkinTo: null,
            checkoutFrom: null,
            checkoutTo: null,
        };
        this.search();
    }

    loadStatus() {
        this._apiCommonService.getEnumsData('invoice-status').subscribe({
            next: (data) => {
                this.status = data;
            },
        });
    }

    loadPaymentMode() {
        this._apiCommonService.getEnumsData('payment-mode').subscribe({
            next: (data) => {
                this.paymentModes = data;
            },
        });
    }

    loadCategories() {
        this._apiCommonService
            .getEnumsData('reservation-categories')
            .subscribe({
                next: (data) => {
                    this.categories = data;
                },
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this.loadStatus();
        this.loadPaymentMode();
        this.loadCategories();
        this.dataSource.paginator = this._paginator;
        this.search();
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.search();
    }

    search(trigger?: MatMenuTrigger) {
        this.isLoading = true;
        this.dataSource.data = [];
        this._apiInvoiceService
            .search(
                this.filters.key,
                this.filters.room,
                this.filters.paymentModes,
                this.filters.priseEnCharge,
                this.filters.categories,
                this.filters.status,
                this.filters.startDate
                    ? this._utilsService.convertToDate(this.filters.startDate)
                    : '',
                this.filters.endDate
                    ? this._utilsService.convertToDate(this.filters.endDate)
                    : '',
                this.filters.checkinFrom
                    ? this._utilsService.convertToDate(this.filters.checkinFrom)
                    : '',
                this.filters.checkinTo
                    ? this._utilsService.convertToDate(this.filters.checkinTo)
                    : '',
                this.filters.checkoutFrom
                    ? this._utilsService.convertToDate(this.filters.checkoutFrom)
                    : '',
                this.filters.checkoutTo
                    ? this._utilsService.convertToDate(this.filters.checkoutTo)
                    : '',
                this.currentPage,
                this.pageSize
            )
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    console.log(value);
                    this.dataSource.data = value?.content || [];
                    this.totalRows = value?.totalElements || 0;

                    setTimeout(() => {
                        if (this._paginator) {
                            this._paginator.pageIndex = this.currentPage;
                            this._paginator.length = this.totalRows;
                        }
                    });
                    if (trigger) {
                        trigger.closeMenu();
                    }
                },
            });
    }

    getStatusStyle(status: string) {
        const statusMap: Record<string, any> = {
            PAID: {
                label: 'Payée',
                class: 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-50',
                icon: 'heroicons_solid:check-circle',
            },
            UNPAID: {
                label: 'Non payée',
                class: 'bg-red-200 text-red-800 dark:bg-red-600 dark:text-red-50',
                icon: 'heroicons_solid:exclamation-circle',
            },
            IN_PROGRESS: {
                label: 'En cours',
                class: 'bg-blue-200 text-blue-800 dark:bg-blue-600 dark:text-blue-50',
                icon: 'heroicons_solid:clock',
            },
            CANCELED: {
                label: 'Annulée',
                class: 'bg-red-200 text-red-800 dark:bg-red-600 dark:text-red-50',
                icon: 'heroicons_solid:x-circle',
            },
        };

        return (
            statusMap[status] || {
                label: status,
                class: 'bg-gray-100 text-gray-600',
                icon: 'heroicons_solid:question-mark-circle',
            }
        );
    }

    removeSpecificFilter(filter: string) {
        if (filter == 'key') this.filters.key = '';
        if (filter == 'room') this.filters.room = '';
        if (filter == 'priseEnCharge') this.filters.priseEnCharge = false;
        if (filter == 'category') this.filters.categories = [];
        if (filter == 'status') this.filters.status = [];
        if (filter == 'paymentModes') this.filters.paymentModes = [];

        if (filter == 'range') {
            this.filters.startDate = null;
            this.filters.endDate = null;
        }
        if (filter == 'checkinRange') {
            this.filters.checkinFrom = null;
            this.filters.checkinTo = null;
        }
        if (filter == 'checkoutRange') {
            this.filters.checkoutFrom = null;
            this.filters.checkoutTo = null;
        }
        this.search();
    }

    getLabels(target: 'status' | 'category' | 'paymentModes'): string {
        let labels;
        if (target == 'status')
            labels = this.filters.status
                .map(
                    (code) =>
                        this.status.find((item) => item.code === code)?.name
                )
                .filter((name) => !!name)
                .join(', ');

        if (target == 'paymentModes')
            labels = this.filters.paymentModes
                .map(
                    (code) =>
                        this.paymentModes.find((item) => item.code === code)
                            ?.name
                )
                .filter((name) => !!name)
                .join(', ');

        if (target == 'category')
            labels = this.filters.categories
                .map(
                    (code) =>
                        this.categories.find((item) => item.code === code)?.name
                )
                .filter((name) => !!name)
                .join(', ');

        return labels;
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

    openPaymentModal(row) {
        if (!row?.num) return;
        this._matDialog
            .open(PaymentModel, {
                data: { invoice: row },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result.reload) {
                    this.search();
                }
            });
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
                    this.search();
                }
            });
    }

    openChangePaymentModeModal(row) {
        if (!row?.num) return;
        this._matDialog
            .open(PaymentModel, {
                data: { invoice: row, changeModeOnly: true },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result?.reload) {
                    this.search();
                }
            });
    }

    isOverdue(plannedEnd: any) {
        return false;
    }

    processInvoice(row: any, action: 'download' | 'view'): void {
        if (!row?.num) return;

        this.loadingFicheId = row.num;

        // Pré-ouverture synchrone de l'onglet pour éviter le blocage des popups
        const viewTab = action === 'view' ? window.open('', '_blank') : null;

        this._apiInvoiceService
            .generateInvoicePdf(row.num)
            .subscribe({
                next: (blob: Blob) => {
                    const blobUrl = window.URL.createObjectURL(blob);

                    if (action === 'download') {
                        // CAS 1 : TELECHARGEMENT
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `Facture_${row.invoiceNumber}.pdf`;
                        link.click();
                        // Nettoyage de la mémoire
                        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
                    } else {
                        // CAS 2 : AFFICHAGE dans le nouvel onglet pré-ouvert
                        if (viewTab) {
                            viewTab.location.href = blobUrl;
                            viewTab.focus();
                        } else {
                            window.open(blobUrl, '_blank');
                        }
                        // Nettoyage différé pour laisser le temps à l'onglet de charger
                        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
                    }

                    this.loadingFicheId = null;
                },
                error: (err) => {
                    viewTab?.close();
                    console.error('Erreur PDF:', err);
                    this.loadingFicheId = null;
                    this._toast.error("erreur de generation de la fiche de réservation")
                    // Optionnel : Afficher un SnackBar d'erreur
                },
            });
    }

    processEtatExplicatif(row: any, action: 'download' | 'view') {
        if (!row?.num) return;

        this.loadingFicheId = row.num;

        // Pré-ouverture synchrone de l'onglet pour éviter le blocage des popups
        const viewTab = action === 'view' ? window.open('', '_blank') : null;

        this._apiInvoiceService
            .generateEtatExplicatifPdf(row.num)
            .subscribe({
                next: (blob: Blob) => {
                    const blobUrl = window.URL.createObjectURL(blob);

                    if (action === 'download') {
                        // CAS 1 : TELECHARGEMENT
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `Etat_explicatif_${row.invoiceNumber}.pdf`;
                        link.click();
                        // Nettoyage de la mémoire
                        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
                    } else {
                        // CAS 2 : AFFICHAGE dans le nouvel onglet pré-ouvert
                        if (viewTab) {
                            viewTab.location.href = blobUrl;
                            viewTab.focus();
                        } else {
                            window.open(blobUrl, '_blank');
                        }
                        // Nettoyage différé pour laisser le temps à l'onglet de charger
                        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
                    }

                    this.loadingFicheId = null;
                },
                error: (err) => {
                    viewTab?.close();
                    console.error('Erreur PDF:', err);
                    this.loadingFicheId = null;
                    this._toast.error("erreur de generation de la fiche de réservation")
                    // Optionnel : Afficher un SnackBar d'erreur
                },
            });
    }
}
