import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { DatePipe, NgClass, SlicePipe, UpperCasePipe } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ApiAuditService } from '../api.audit.service';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule, MatDateRangeInput } from '@angular/material/datepicker';
import { MatSelect, MatSelectModule, MatSelectTrigger } from '@angular/material/select';
import { MatDrawerContainer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { ExtractGuestDataPipe } from '../../reservation/list/extract-guest-data-pipe';
import { MatOption } from '@angular/material/core';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { UtilsService } from '../../../core/service/utils.service';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';

@Component({
    selector: 'audit',
    templateUrl: './audit.list.component.html',
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
        MatPaginator,
        MatSortModule,
        FormsModule,
        DatePipe,
        MatDateRangeInput,
        MatSelectModule,
        MatDatepickerModule,
        NgClass,
        UpperCasePipe,
    ],
})
export class AuditListComponent implements OnInit {
    displayedColumns: string[] = [
        'username',
        'date',
        'target',
        'OPERATION',
        'ip',
        'message',
    ];
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;

    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];
    isLoading: boolean = true;

    targets = [];
    operations = [];
    accounts = [];

    filters = {
        key: '',
        targets: [],
        usernames: [],
        operations: [],
        startDate: null,
        endDate: null,
    };

    /**
     * Constructor
     */
    constructor(
        private _apiAuditService: ApiAuditService,
        private _utilsService: UtilsService
    ) {}

    ngOnInit(): void {
        this.loadTargets();
        this.loadOperations();
        this.loadAccounts();
        this.search();
    }

    get activeFiltersCount(): number {
        let count = 0;
        if (this.filters.key?.length > 0) count++;
        if (this.filters.usernames.length > 0) count++;
        if (this.filters.targets.length > 0) count++;
        if (this.filters.operations.length > 0) count++;
        if (this.filters.startDate || this.filters.endDate) count++;
        return count;
    }

    applyFilters(trigger?: MatMenuTrigger) {
        if (trigger) {
            trigger.closeMenu();
        }

        this.currentPage = 0;
        this.search();
    }

    resetFilters(trigger?: MatMenuTrigger) {
        if (trigger) {
            trigger.closeMenu();
        }
        this.filters = {
            key: '',
            usernames: [],
            targets: [],
            operations: [],
            startDate: null,
            endDate: null,
        };
        this.applyFilters();
    }

    getSelectedFilterLabels(
        target: 'targets' | 'operations' | 'usernames'
    ): string {
        let labels;
        if (target == 'targets')
            labels = this.filters.targets
                .map(
                    (code) =>
                        this.targets.find((item) => item.code === code)?.name
                )
                .filter((name) => !!name)
                .join(', ');

        if (target == 'operations')
            labels = this.filters.operations
                .map(
                    (code) =>
                        this.operations.find((item) => item.code === code)?.name
                )
                .filter((name) => !!name)
                .join(', ');
        if (target == 'usernames') labels = this.filters.usernames.join(', ');

        return labels;
    }

    removeSpecificFilter(filter: string) {
        if (filter == 'key') this.filters.key = '';
        if (filter == 'targets') this.filters.targets = [];
        if (filter == 'operations') this.filters.operations = [];
        if (filter == 'usernames') this.filters.usernames = [];

        if (filter == 'range') {
            this.filters.startDate = null;
            this.filters.endDate = null;
        }

        this.search();
    }

    loadTargets() {
        this._apiAuditService.getActionTargets().subscribe({
            next: (data) => {
                this.targets = data;
            },
        });
    }

    loadOperations() {
        this._apiAuditService.getActionOperations().subscribe({
            next: (data) => {
                this.operations = data;
            },
        });
    }

    loadAccounts() {
        this._apiAuditService.getAccounts().subscribe({
            next: (data) => {
                this.accounts = data;
            },
        });
    }

    search() {
        this.isLoading = true;
        this.dataSource.data = [];

        this._apiAuditService
            .search(
                this.filters.key,
                this.filters.usernames,
                this.filters.targets,
                this.filters.operations,
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

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.search();
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
