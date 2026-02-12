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
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
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
        HasPermissionDirective,
        DatePipe,
        ExtractGuestDataPipe,
        SlicePipe,
        MatOption,
        MatSelect,
        MatSelectTrigger,
    ],
})
export class ReservationListComponent implements OnInit, OnDestroy {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'info',
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

    status = [
        {
            code: 'CONFIRMED',
            label: 'Confirmée',
            description: 'Les réservations sont validées et confirmée.',
            color: 'text-green-600 bg-green-50',
            icon: 'check_circle'
        },
        {
            code: 'PENDING',
            label: 'En attente',
            description: 'Les réservations sont enregistrées mais nécessite une action ou un paiement.',
            color: 'text-amber-600 bg-amber-50',
            icon: 'history'
        },
        {
            code: 'IN_PROGRESS',
            label: 'En cours',
            description: 'Le séjour est actuellement effectif (client sur place).',
            color: 'text-blue-600 bg-blue-50',
            icon: 'door_front'
        },
         {
            code: 'CLOSED',
                label: 'Clôturée',
                description: 'Le séjour est terminé et le dossier est archivé.',
                color: 'text-gray-600 bg-gray-50',
                icon: 'archive'
        },
        {
            code: 'CANCELED',
                label: 'Annulée',
                description: 'La réservation a été annulée.',
                color: 'text-red-600 bg-red-50',
                icon: 'cancel'
        }
    ];
    selectedStatus = {
        code: 'PENDING',
        label: 'En attente',
        description: 'Les réservations sont enregistrées mais nécessite une action ou un paiement.',
        color: 'text-amber-600 bg-amber-50',
        icon: 'history'
    };

    key = '';
    filters = {
        status: [],
        startDate: null,
        endDate: null
    };
    isAdvancedFilter = false;

    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _matDialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    get activeFiltersCount(): number {
        let count = 0;
        if (this.filters.status.length > 0) count++;
        if (this.filters.startDate || this.filters.endDate) count++;
        return count;
    }

    applyFilters() {
        console.log('Filtres appliqués:', this.filters);
        // Ici, appelez votre service ou émettez un événement pour filtrer le mat-table
    }

    resetFilters() {
        this.filters = {
            status: [],
            startDate: null,
            endDate: null
        };
        this.applyFilters();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
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
            .search(this.key, this.currentPage, this.pageSize)
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
}
