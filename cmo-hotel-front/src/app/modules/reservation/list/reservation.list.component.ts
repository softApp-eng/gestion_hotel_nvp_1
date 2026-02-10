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
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ApiReservationService } from '../api.reservation.service';
import { SlicePipe } from '@angular/common';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { Toastr } from '../../../core/service/toastr.service';
import { MatDrawer, MatDrawerContainer, MatSidenavModule } from '@angular/material/sidenav';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { HasPermissionDirective } from '../../../core/auth/HasPermissionDirective';
import { ApiPersonService } from '../../person/api.person.service';
import { FuseMediaWatcherService } from '../../../../@fuse/services/media-watcher';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

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
        TitleCasePipe,
        RouterLink,
        HasPermissionDirective,
        DatePipe,
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
    key = '';
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

    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _matDialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

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
            .search(this.currentPage, this.pageSize)
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
