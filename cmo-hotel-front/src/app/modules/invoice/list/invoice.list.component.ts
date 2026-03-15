import {
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize, Subject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {  MatSidenavModule } from '@angular/material/sidenav';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ApiCommonService } from '../../../core/service/api.common.service';
import { UtilsService } from '../../../core/service/utils.service';
import {DisableIfNoPermissionDirective} from "../../../core/auth/DisableIfNoPermissionDirective";
import { FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { Toastr } from '../../../core/service/toastr.service';
import { ApiInvoiceService } from '../api.invoice.service';

@Component({
    selector: 'invoice-list',
    templateUrl: './invoice.list.component.html',
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
        RouterLink,
        DatePipe,
        SlicePipe,
        MatOption,
        MatSelect,
        MatSelectTrigger,
        DisableIfNoPermissionDirective,
    ],
})
export class InvoiceListComponent implements OnInit, OnDestroy {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'num',
        'action',
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();


    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];

    categories = [];
    paymentModes = [];
    status = [];
    filters = {
        key: '',
        priseEnCharge: false,
        categories: [],
        paymentModes: [],
        status: [],
        startDate: null,
        endDate: null,
    };

    /**
     * Constructor
     */
    constructor(
        private _apiInvoiceService: ApiInvoiceService,
        private _apiCommonService: ApiCommonService,
        private _matDialog: MatDialog,
        private _toast: Toastr,
        private _utilsService: UtilsService,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {}

    get activeFiltersCount(): number {
        let count = 0;
        if (this.filters.status.length > 0) count++;
        if (this.filters.startDate || this.filters.endDate) count++;
        return count;
    }

    resetFilters() {
        this.filters = {
            key: '',
            priseEnCharge: false,
            categories: [],
            paymentModes: [],
            status: [],
            startDate: null,
            endDate: null,
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
            PENDING: {
                label: 'En attente',
                class: 'bg-amber-200 text-amber-800 dark:bg-amber-600 dark:text-amber-50',
            },
            CONFIRMED: {
                label: 'Confirmée',
                class: 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-50',
            },
            IN_PROGRESS: {
                label: 'En cours',
                class: 'bg-blue-200 text-blue-800 dark:bg-blue-600 dark:text-blue-50',
            },
            COMPLETED: {
                label: 'Terminée',
                class: 'bg-teal-200 text-teal-800 dark:bg-teal-600 dark:text-teal-50',
            },
            CANCELED: {
                label: 'Annulée',
                class: 'bg-red-200 text-red-800 dark:bg-red-600 dark:text-red-50',
            },
            NO_SHOW: {
                label: 'Non présenté',
                class: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-50',
            },
            EXPIRED: {
                label: 'Expirée',
                class: 'bg-orange-200 text-orange-800 dark:bg-orange-600 dark:text-orange-50',
            },
            CLOSED: {
                label: 'Clôturée',
                class: 'bg-slate-300 text-slate-900 dark:bg-slate-700 dark:text-slate-100',
            },
        };

        return (
            statusMap[status] || {
                label: status,
                class: 'bg-gray-100 text-gray-600',
            }
        );
    }

    removeSpecificFilter(filter: string) {
        if (filter == 'key') this.filters.key = '';
        if (filter == 'priseEnCharge') this.filters.priseEnCharge = false;
        if (filter == 'category') this.filters.categories = [];
        if (filter == 'status') this.filters.status = [];
        if (filter == 'paymentModes') this.filters.paymentModes = [];

        if (filter == 'range') {
            this.filters.startDate = null;
            this.filters.endDate = null;
        }
        this.search();
    }

    getLabels(target: 'status' | 'category'| 'paymentModes'): string {
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
                        this.paymentModes.find((item) => item.code === code)?.name
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
}
