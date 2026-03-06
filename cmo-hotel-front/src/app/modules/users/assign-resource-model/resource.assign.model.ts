import {
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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { MatCheckbox } from '@angular/material/checkbox';
import { ApiRoomService } from '../../pavillon/api.room.service';
import { ApiUsersService } from '../api.users.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Toastr } from '../../../core/service/toastr.service';

@Component({
    selector: 'users-rersources',
    templateUrl: './resource.assign.model.html',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatTableModule,
        HighlightPipe,
        MatCheckbox,
        MatPaginator,
        MatSortModule
    ],
})
export class ResourceAssignModel implements OnInit, OnDestroy {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    @ViewChild(MatSort) _sort: MatSort;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'selection',
        'pavillon',
        'code',
        'name',
        'type'
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    pageSizeOptions: number[] = [20, 50, 70, 100];

    rooms: any[] = [];
    grantedRooms: any[] = [];
    selection = new SelectionModel<any>(true, []);

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<ResourceAssignModel>,
        private _apiRoomService: ApiRoomService,
        private _apiUsersService: ApiUsersService,
        private _toast: Toastr,
        @Inject(MAT_DIALOG_DATA)
        public data: { selectedPersons: any, category: any, user:any }
    ) {
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        console.log('data',this.data);
        this.loadRooms()
    }

    loadRooms() {
        this.isLoading = true;
        this._apiRoomService.all().pipe(
            finalize(() => this.isLoading = false)
        ).subscribe({
            next: data => {
                this.rooms = data || [];
                this.dataSource.data = this.rooms;
                //this.totalRows = this.rooms.length;

                // Une fois les chambres chargées, on récupère les droits pour cocher
                this.loadGrantedRooms(this.data.user.userid);

                // Configurer le tri et pagination
                setTimeout(() => {
                    this.dataSource.sort = this._sort;
                    this.dataSource.paginator = this._paginator;
                });
            }
        });
    }

    loadGrantedRooms(userid: string) {
        this._apiUsersService.getUserResources(userid).subscribe({
            next: (res: any) => {
                this.grantedRooms = res?.rooms || [];
                this._preSelectRooms();
            }
        });
    }

    private _preSelectRooms() {
        // On coche les lignes dont l'ID est présent dans grantedRooms
        const grantedIds = this.grantedRooms.map(r => r.id);
        this.dataSource.data.forEach(row => {
            if (grantedIds.includes(row.id)) {
                this.selection.select(row);
            }
        });
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    saveAndClose() {
        // On renvoie la liste des IDs sélectionnés au composant parent
        const selectedIds = this.selection.selected.map(room => room.id);
        this._apiUsersService.assignRoomsResource(this.data.user.userid, selectedIds)
            .subscribe({
                next: data => {
                    this._toast.success("Ressources assignées");
                    this.matDialogRef.close(selectedIds);
                },error: err => {
                    this._toast.success(err?.error?.description || 'Problème');
                }
            })

    }
}
