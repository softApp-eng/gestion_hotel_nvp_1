import {
    ChangeDetectorRef,
    Component,
    Inject, OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, Subject } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { MatPaginator } from '@angular/material/paginator';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgClass } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { ApiReservationService } from '../../reservation/api.reservation.service';

@Component({
    selector: 'person-manage-model',
    templateUrl: './person-manage.model.html',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        HighlightPipe,
        MatCheckbox,
        MatPaginator,
        NgClass,
        MatTooltip,
        MatMenuModule
    ],
})
export class PersonManageModel implements OnInit, OnDestroy {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'selection',
        'grade',
        'name',
        'identity',
    ];
    key = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];

    selectedReservations: any[] = [];
    reservations: any[] = [];

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<PersonManageModel>,
        private _apiReservationService: ApiReservationService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA)
        public data: { selectedPersons: any }
    ) {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        //this.searchPersons();
        console.log('xxx',this.data);
        this.selectedReservations = this.data.selectedPersons ? [...this.data.selectedPersons] : [];
        this._changeDetectorRef.markForCheck()

        this.dataSource.paginator = this._paginator;
        this.loadResidents();
    }

    loadResidents() {
        this.isLoading = true;

        this._apiReservationService
            .getResidentReservations()
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (value: any) => {
                    console.log('Response from backend:', value);
                    this.reservations = value || [];
                    this.dataSource = new MatTableDataSource<any>(this.reservations);

                    // Re-attacher le paginator
                    this.dataSource.paginator = this._paginator;
                },
                error: err => {
                    console.error('Error fetching persons:', err);
                }
            });
    }

    toggleModule(reservation: any, checked: boolean): void {

        if (checked) {
            if (!this.selectedReservations.some(p => p.id === reservation.id)) {
                this.selectedReservations.push(reservation);
            }
        } else {
            this.selectedReservations = this.selectedReservations.filter((p) => p.id !== reservation.id);
        }
    }

    isModuleSelected(reservationId: any): boolean {
        return this.selectedReservations.some(p => p.id === reservationId);
    }


    saveAndClose() {
        this.matDialogRef.close(this.selectedReservations);
    }

    search(key: string) {
        this.key = key;
        this.dataSource.data = this.reservations?.filter(
            (r) =>
                r?.person?.identity?.toLowerCase()?.includes(key?.toLowerCase()) ||
                r?.person?.matricule?.toLowerCase()?.includes(key?.toLowerCase()) ||
                r?.person?.firstName?.toLowerCase()?.includes(key?.toLowerCase()) ||
                r?.person?.lastName?.toLowerCase()?.includes(key?.toLowerCase())
        );
    }
}
