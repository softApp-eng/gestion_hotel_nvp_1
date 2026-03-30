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
import { DatePipe, DecimalPipe, NgClass, SlicePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { DisableIfNoPermissionDirective } from '../../core/auth/DisableIfNoPermissionDirective';
import { APP_PERMISSIONS } from '../../core/data/app-permissions';
import { ApiReservationService } from '../reservation/api.reservation.service';

@Component({
    selector: 'main-courante',
    templateUrl: './main-courante.list.component.html',
    styleUrls: ['./main-courante.list.component.scss'],
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
    ],
})
export class MainCouranteListComponent implements OnInit {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'checkin',
        'reservationCode',
        'categ',
        'client',
        'room',
        'roomPrice',
        'nights',
        'pc',
        'unite'
    ];

    reservations;

    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];
    key = '';
    today = new Date();

    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.dataSource.paginator = this._paginator;
        this.getSejour();
    }

    getSejour() {
        this.isLoading = true;
        this.dataSource.data = [];
        this._apiReservationService
            .getMainCourante()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    console.log(value);
                    this.reservations = this.dataSource.data = value || [];
                },
            });
    }
}
