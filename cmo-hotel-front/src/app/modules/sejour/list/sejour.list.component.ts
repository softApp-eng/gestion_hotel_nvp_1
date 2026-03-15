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
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { ExtractGuestDataPipe } from '../../reservation/list/extract-guest-data-pipe';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { ApiReservationService } from '../../reservation/api.reservation.service';
import { ReservationDetailsModel } from '../../reservation/dialog-reservation-details/reservation.details.model';
import { CloseReservationModel } from '../../reservation/list/dialog-close-reservation/close.reservation.model';
import { NightValidationModel } from '../night-validation/night-validation.model';

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
        MatIconModule,
        FormsModule,
        MatTabsModule,
        DatePipe,
        ExtractGuestDataPipe,
        SlicePipe,
        DisableIfNoPermissionDirective,
    ],
})
export class SejourListComponent implements OnInit {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        //'info',
        'code',
        'checkin',
        'checkout',
        'room',
        'person',
        'category',
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

    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _matDialog: MatDialog,
    ) {}

    ngOnInit(): void {
        //this.searchPersons();
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
            });
    }

    search() {

    }
}
