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
import { DatePipe, NgClass, SlicePipe, TitleCasePipe } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatDrawerContainer, MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { HasPermissionDirective } from '../../../core/auth/HasPermissionDirective';
import { ExtractGuestDataPipe } from '../../reservation/list/extract-guest-data-pipe';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { ApiReservationService } from '../../reservation/api.reservation.service';
import { ApiCommonService } from '../../../core/service/api.common.service';
import { UtilsService } from '../../../core/service/utils.service';
import { FuseMediaWatcherService } from '../../../../@fuse/services/media-watcher';
import { PersonManageModel } from '../../reservation/dialog-manage-person/person-manage.model';
import { ReservationDetailsModel } from '../../reservation/dialog-reservation-details/reservation.details.model';
import { CloseReservationModel } from '../../reservation/list/dialog-close-reservation/close.reservation.model';

@Component({
    selector: 'sejour-list',
    templateUrl: './sejour.list.component.html',
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
    ],
})
export class SejourListComponent implements OnInit, OnDestroy {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        //'info',
        'code',
        'checkin',
        'checkout',
        'room',
        'person',
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
    key = '';

    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _apiCommonService: ApiCommonService,
        private _matDialog: MatDialog,
        private _utilsService: UtilsService,
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
            .search(
                this.key,
                '',
                ['CONFIRMED'],
                [],
                '',
                '',
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

    raiseReservationDetailsDialog(reservation) {
        this._matDialog
            .open(ReservationDetailsModel, {
                data: { reservation: reservation},
                disableClose: true,
            })
            .afterClosed()
            .subscribe();
    }

    closeDrawer() {
        this.matDrawer.close();
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
}
