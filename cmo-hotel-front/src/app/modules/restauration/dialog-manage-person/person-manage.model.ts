import {
    ChangeDetectorRef,
    Component,
    Inject, OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { ApiPersonService } from '../../person/api.person.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgClass } from '@angular/common';
import { MatMenu, MatMenuModule } from '@angular/material/menu';

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
        MatMenu,
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
        'unite',
        'matricule',
        //'action',
    ];
    key = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];

    selectedPersons: any[] = [];

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<PersonManageModel>,
        private _apiPersonService: ApiPersonService,
        private _toast: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
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
        this.selectedPersons = this.data.selectedPersons ? [...this.data.selectedPersons] : [];
        this._changeDetectorRef.markForCheck()

        this.dataSource.paginator = this._paginator;
        this.searchWithReservation();
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.searchWithReservation();
    }

    searchWithReservation() {
        this.isLoading = true;

        this._apiPersonService
            .searchWithReservation(this.key, this.currentPage, this.pageSize)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (value: any) => {
                    console.log('Response from backend:', value);

                    // Assurez-vous que value est bien { content: [...], totalElements: ... }
                    const data = value?.content || value || [];
                    this.dataSource = new MatTableDataSource<any>(data);

                    // Re-attacher le paginator
                    this.dataSource.paginator = this._paginator;

                    // Mettre à jour le totalRows pour le paginator
                    this.totalRows = value?.totalElements || data.length;
                },
                error: err => {
                    console.error('Error fetching persons:', err);
                }
            });
    }

    toggleModule(person: any, checked: boolean): void {

        if (checked) {
            this.selectedPersons = [person];
        } else {
            this.selectedPersons = [];
        }
    }

    isModuleSelected(personId: any): boolean {
        return this.selectedPersons.some(p => p.id === personId);
    }


    saveAndClose() {
        this.matDialogRef.close(this.selectedPersons);
    }
}
