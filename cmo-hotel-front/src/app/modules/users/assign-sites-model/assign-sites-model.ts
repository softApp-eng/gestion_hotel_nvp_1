import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckbox } from '@angular/material/checkbox';
import { ApiUsersService } from '../api.users.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { finalize } from 'rxjs';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';

@Component({
    selector: 'model-sites-assign',
    templateUrl: './assign-sites-model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatCheckbox,
        MatPaginator,
        MatSortModule,
        MatTableModule,
        HighlightPipe,
        MatTooltip,
        NgClass,
    ],
})
export class AssignSitesModel implements OnInit, AfterViewInit {
    selectedSites: string[] = [];
    sites;
    isLoading: boolean = false;
    displayedColumns: string[] = ['name', 'type', 'isNational', 'action'];
    dataSource = new MatTableDataSource<any>([]);
    key = '';

    @ViewChild('paginator') _paginator: MatPaginator;
    totalRows = 0;
    currentPage = 0;
    @ViewChild(MatSort) sort: MatSort;

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<AssignSitesModel>,
        private _apiUsersService: ApiUsersService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { user: any }
    ) {
        this.selectedSites = data.user?.sites?.map((s) => s.id);
        console.log('actual sites selected',this.selectedSites);
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this._paginator;
        this.sort.sortChange.subscribe(() => (this._paginator.pageIndex = 0));
    }

    ngOnInit(): void {
        this.loadSites();
    }

    loadSites() {
        this.isLoading = true;
        this._apiUsersService
            .getAllSites()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.dataSource.data = this.sites = value;
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this._paginator;
                },
            });
    }

    search(key: string) {
        this.key = key;
        this.dataSource.data = this.sites?.filter(
            (s) =>
                s?.name?.toLowerCase()?.includes(key?.toLowerCase()) ||
                s?.type?.toLowerCase()?.includes(key?.toLowerCase())
        );
    }

    toggleModule(r: string, checked: boolean): void {
        if (checked) {
            // Add if not already present
            this.selectedSites.push(r);
        } else {
            // Remove if unchecked
            this.selectedSites = this.selectedSites.filter((m) => m !== r);
        }
    }

    isModuleSelected(rid: string): boolean {
        return this.selectedSites.includes(rid);
    }

    save() {
        // Do nothing if the form is invalid
        if (!this.data.user.userid) {
            return;
        }

        this._apiUsersService
            .assignSites(this.data.user.userid, this.selectedSites)
            .subscribe({
                next: (value) => {
                    this._toast.success('implantations changés"');
                    this.matDialogRef.close({ reload: true });
                },
                error: (err) => {
                    this._toast.error(
                        err?.error?.description || 'Problème de modification'
                    );
                },
            });
    }
}
