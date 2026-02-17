import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { DatePipe, NgClass } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ApiAuditService } from '../api.audit.service';
import { FormsModule } from '@angular/forms';

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
        NgClass,
        MatPaginator,
        MatSortModule,
        FormsModule,
        DatePipe,
    ],
})
export class AuditListComponent implements OnInit {
    displayedColumns: string[] = [
        'username',
        'ENTITE',
        'OPERATION',
        'date',
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
    key = '';

    /**
     * Constructor
     */
    constructor(private _apiAuditService: ApiAuditService) {}

    ngOnInit(): void {
        this.search();
    }

    search() {
        this.isLoading = true;
        this.dataSource.data = [];

        this._apiAuditService
            .search()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.dataSource.data = value || [];
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
}
