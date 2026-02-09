import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize, Subject } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { NgClass } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ApiReservationService } from '../api.reservation.service';
import { SlicePipe } from '@angular/common';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { Toastr } from '../../../core/service/toastr.service';
import { MatDrawer } from '@angular/material/sidenav';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';

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
        RouterLink,
        MatPaginator,
        SlicePipe
    ],
})
export class ReservationListComponent implements OnInit {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'name',
        'action',
    ];
    key = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

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
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.dataSource.paginator = this._paginator;
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
}
