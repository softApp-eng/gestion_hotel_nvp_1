import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HighlightPipe } from '../../../../../@fuse/pipes/HighlightPipe';
import { HasPermissionDirective } from '../../../../core/auth/HasPermissionDirective';
import { ApiRoomService } from '../../api.room.service';
import { ApiPavillonService } from '../../api.pavillon.service';
import { APP_PERMISSIONS } from '../../../../core/data/app-permissions';

@Component({
    selector: 'room-list',
    templateUrl: './room.list.component.html',
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
        MatSortModule,
        HasPermissionDirective,
    ],
})
export class RoomListComponent implements OnInit, AfterViewInit {
    rooms;
    isLoading: boolean = false;
    displayedColumns: string[] = ['name', 'code', 'type',  'capacity','floor','description','action'];
    dataSource = new MatTableDataSource<any>([]);
    key = '';

    @ViewChild('paginator') _paginator: MatPaginator;
    totalRows = 0;
    currentPage = 0;
    @ViewChild(MatSort) sort: MatSort;
    pavillon;

    /**
     * Constructor
     */
    constructor(
        private _apiRoomService: ApiRoomService,
        private _apiPavillonService: ApiPavillonService,
        private _activeRoute: ActivatedRoute,
    ) {}

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this._paginator;
        this.sort.sortChange.subscribe(() => (this._paginator.pageIndex = 0));
    }

    ngOnInit(): void {
        this.loadCurrentPavillonRooms()
    }

    loadCurrentPavillonRooms(){
        const pavillonId = this._activeRoute.snapshot.params['pavillonId'];
        this._apiPavillonService.one(pavillonId).subscribe({
            next: data => {
                this.pavillon = data;
                this.loadRooms(this.pavillon.id);
            }
        })
    }

    loadRooms(pavillonId) {
        this.isLoading = true;
        this._apiRoomService
            .all(pavillonId)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    console.log(value);
                    this.dataSource.data = this.rooms = value;
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this._paginator;
                },
            });
    }

    search(key: string) {
        this.key = key;
        this.dataSource.data = this.rooms?.filter(
            (s) =>
                s?.name?.toLowerCase()?.includes(key?.toLowerCase()) ||
                s?.category?.toLowerCase()?.includes(key?.toLowerCase()) ||
                s?.type?.toLowerCase()?.includes(key?.toLowerCase())
        );
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
