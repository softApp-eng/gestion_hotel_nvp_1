import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { DatePipe, NgClass, SlicePipe, TitleCasePipe } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ApiReservationService } from '../api.reservation.service';
import { MatDrawer, MatDrawerContainer, MatSidenavModule } from '@angular/material/sidenav';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { HasPermissionDirective } from '../../../core/auth/HasPermissionDirective';
import { FuseMediaWatcherService } from '../../../../@fuse/services/media-watcher';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ExtractGuestDataPipe } from './extract-guest-data-pipe';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ApiCommonService } from '../../../core/service/api.common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilsService } from '../../../core/service/utils.service';
import {DisableIfNoPermissionDirective} from "../../../core/auth/DisableIfNoPermissionDirective";
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { ToastrService } from 'ngx-toastr';
import { Toastr } from '../../../core/service/toastr.service';
import { PersonManageModel } from '../dialog-manage-person/person-manage.model';
import { AcceptReservationModel } from './dialog-accept-reservation/accept.reservation.model';
import { ReservationDetailsModel } from '../dialog-reservation-details/reservation.details.model';
import { CloseReservationModel } from './dialog-close-reservation/close.reservation.model';

@Component({
    selector: 'reservation-list',
    templateUrl: './reservation.list.component.html',
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
        MatDrawerContainer,
        MatSidenavModule,
        MatIconModule,
        FormsModule,
        MatTabsModule,
        MatDatepickerModule,
        RouterLink,
        DatePipe,
        ExtractGuestDataPipe,
        SlicePipe,
        MatOption,
        MatSelect,
        MatSelectTrigger,
        DisableIfNoPermissionDirective,
    ],
})
export class ReservationListComponent implements OnInit, OnDestroy {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        //'info',
        'code',
        'checkin',
        'checkout',
        'room',
        'person',
        'status',
        'action',
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    selectedItem;
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];

    status = [];
    selectedStatus = null;
    key = '';

    categories = [];
    filters = {
        reservationCode: '',
        status: [],
        categories: [],
        startDate: null,
        endDate: null,
    };
    isAdvancedFilter = false;

    actionConfigDialogue: FuseConfirmationConfig = {
        title: '',
        message: '',
        icon: {
            show: true,
            name: 'heroicons_outline:exclamation-triangle',
            color: 'warn',
        },
        actions: {
            confirm: {
                show: true,
                label: 'Confirmer',
                color: 'warn',
            },
            cancel: {
                show: true,
                label: 'Annuler',
            },
        },
        dismissible: true,
    };

    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _apiCommonService: ApiCommonService,
        private _matDialog: MatDialog,
        private _toast: Toastr,
        private _utilsService: UtilsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    get activeFiltersCount(): number {
        let count = 0;
        if (this.filters.status.length > 0) count++;
        if (this.filters.startDate || this.filters.endDate) count++;
        return count;
    }

    applyFilters(trigger?: MatMenuTrigger) {
        console.log('applyFilters', this.filters);
        if (trigger) {
            trigger.closeMenu();
        }
        if (!this.isAdvancedFilter) {
            this.filters.status = this.selectedStatus
                ? [this.selectedStatus.code]
                : [];
        }
        this.currentPage = 0;
        this.search();
    }

    resetFilters() {
        this.filters = {
            reservationCode: '',
            status: [],
            categories: [],
            startDate: null,
            endDate: null,
        };
        this.selectedStatus = null;
        this.applyFilters();
    }

    loadStatus() {
        this._apiCommonService.getEnumsData('reservation-status').subscribe({
            next: (data) => {
                this.status = data;
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
        this.loadCategories();
        //this.searchPersons();
        this.dataSource.paginator = this._paginator;
        // Subscribe to media query change
        this._fuseMediaWatcherService
            .onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {
                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.search();
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.search();
    }

    search() {
        this.isLoading = true;
        this.dataSource.data = [];
        this._apiReservationService
            .search(
                this.key,
                this.filters.reservationCode,
                this.filters.status,
                this.filters.categories,
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
                },
            });
    }

    openDrawer(item) {
        this.selectedItem = item;
        this.matDrawer.open();
    }

    closeDrawer() {
        this.matDrawer.close();
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
        if (filter == 'status') this.filters.status = [];

        if (filter == 'category') this.filters.categories = [];

        if (filter == 'range') {
            this.filters.startDate = null;
            this.filters.endDate = null;
        }

        this.search();
    }

    getLabels(target: 'status' | 'category'): string {
        let labels;
        if (target == 'status')
            labels = this.filters.status
                .map(
                    (code) =>
                        this.status.find((item) => item.code === code)?.name
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

    deleteReservation(reservation) {
        if (!reservation.code)
            return;
        this.actionConfigDialogue.title = `Confirmer la suppression de la reservation #${reservation.code}.`;
        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer cette reservation #${reservation.code}?<br> Cette action est irréversible. Toutes les données de cette reservation seront supprimées.`;
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this._apiReservationService.deleteReservation(reservation.code).subscribe({
                    next: (value) => {
                        this._toast.success('reservation supprimée');
                        let data = this.dataSource.data;
                        data = data.filter((s) => s.code !== reservation.code);
                        this.dataSource.data = data;

                        if (this.dataSource.paginator) {
                            this.dataSource.paginator.length =
                                data.length;
                        }
                    },
                    error: (err) =>
                        this._toast.error(
                            err?.error?.description ||
                            "Une erreur s'est produit"
                        ),
                });
        });
    }

    cancelReservation(reservation) {
        if (!reservation.code)
            return;
        this.actionConfigDialogue.title = `Confirmer l'annulation de la reservation #${reservation.code}.`;
        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir annuler cette reservation #${reservation.code} ?`;
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this._apiReservationService.cancelReservation(reservation.code).subscribe({
                    next: (value) => {
                        this._toast.success('reservation annulée');
                        let data = this.dataSource.data;
                        data = data.map((s) => {
                            if (s.code === reservation.code){
                                reservation.status.code = 'CANCELED';
                                reservation.status.name = 'Annulée';
                            }
                            return s;
                        });
                        this.dataSource.data = data;
                    },
                    error: (err) =>
                        this._toast.error(
                            err?.error?.description ||
                            "Une erreur s'est produit"
                        ),
                });
        });
    }

    raiseAcceptReservation(code) {
        if (!code)
            return;
        this._matDialog
            .open(AcceptReservationModel, {
                data: { code: code},
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result.reload) {
                    this.search();
                }
            });
    }

    raiseCloseReservation(code) {
        if (!code)
            return;
        this._matDialog
            .open(CloseReservationModel, {
                data: { code: code},
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result.reload) {
                    this.search();
                }
            });
    }

    raiseReservationDetailsDialog(reservation) {
        this._matDialog
            .open(ReservationDetailsModel, {
                data: { reservation: reservation},
                disableClose: true,
            })
            .afterClosed()
            .subscribe();
    }
}
