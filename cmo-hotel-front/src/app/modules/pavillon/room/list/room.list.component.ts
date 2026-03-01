import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HighlightPipe } from '../../../../../@fuse/pipes/HighlightPipe';
import { ApiRoomService } from '../../api.room.service';
import { ApiPavillonService } from '../../api.pavillon.service';
import { APP_PERMISSIONS } from '../../../../core/data/app-permissions';
import { DisableIfNoPermissionDirective } from '../../../../core/auth/DisableIfNoPermissionDirective';
import { FuseConfirmationService } from '../../../../../@fuse/services/confirmation';
import { Toastr } from '../../../../core/service/toastr.service';
import { DIALOG_CONFIGS } from '../../../../core/data/dialogConfig';

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
        RouterLink,
        MatPaginator,
        MatSortModule,
        DisableIfNoPermissionDirective,
    ],
})
export class RoomListComponent implements OnInit, AfterViewInit {
    rooms;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'name',
        'code',
        'type',
        'capacity',
        'floor',
        'description',
        'action',
    ];
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
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
    ) {}

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this._paginator;
        this.sort.sortChange.subscribe(() => (this._paginator.pageIndex = 0));
    }

    ngOnInit(): void {
        this.loadCurrentPavillonRooms();
    }

    loadCurrentPavillonRooms() {
        const pavillonId = this._activeRoute.snapshot.params['pavillonId'];
        this._apiPavillonService.one(pavillonId).subscribe({
            next: (data) => {
                this.pavillon = data;
                this.loadRooms(this.pavillon.id);
            },
        });
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

    deleteRoom(room) {
        if (!room?.id)
            return;
        const dialogRef = this._fuseConfirmationService.open(
            {
                ...DIALOG_CONFIGS,
                title: `Confirmer la suppression de la chambre "${room.code}".`,
                message: `Êtes-vous sûr de vouloir supprimer la chambre "${room.code}" ?<br> Cette action est irréversible.`
            }
        );

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this._apiRoomService.delete(room?.id).subscribe({
                    next: (value) => {
                        this._toast.success('Chambre supprimée');
                        this.dataSource.data = this.dataSource.data.filter(
                            (s) => s.id !== room?.id
                        );
                    },
                    error: (err) =>
                        this._toast.error(
                            err?.error?.description ||
                            "Une erreur s'est produit"
                        ),
                });
        });
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
