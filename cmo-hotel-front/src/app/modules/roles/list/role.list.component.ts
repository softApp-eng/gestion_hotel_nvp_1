import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { NgClass } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ApiRolesService } from '../api.roles.service';
import { SlicePipe } from '@angular/common';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { Toastr } from '../../../core/service/toastr.service';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';

@Component({
    selector: 'site-list',
    templateUrl: './role.list.component.html',
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
        SlicePipe,
        DisableIfNoPermissionDirective,
    ],
})
export class RoleListComponent implements OnInit, AfterViewInit {
    roles;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'title',
        'isSystem',
        'description',
        'permissions',
        'action',
    ];
    dataSource = new MatTableDataSource<any>([]);
    key = '';

    @ViewChild('paginator') _paginator: MatPaginator;
    totalRows = 0;
    currentPage = 0;
    @ViewChild(MatSort) sort: MatSort;

    actionConfigDialogue: FuseConfirmationConfig = {
        title: '',
        message: '',
        icon: {
            show: true,
            name: 'heroicons_outline:exclamation-triangle',
            color: 'warn',
        },
        actions: {
            confirm: {
                show: true,
                label: 'Confirmer',
                color: 'warn',
            },
            cancel: {
                show: true,
                label: 'Annuler',
            },
        },
        dismissible: true,
    };

    /**
     * Constructor
     */
    constructor(
        private _apiRolesService: ApiRolesService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
        private _matDialog: MatDialog
    ) {}

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this._paginator;
        this.sort.sortChange.subscribe(() => (this._paginator.pageIndex = 0));
    }

    ngOnInit(): void {
        this.loadRoles();
    }

    loadRoles() {
        this.isLoading = true;
        this._apiRolesService
            .getRoles()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    //this.dataSource.paginator = this._paginator;
                    this.dataSource.data = this.roles = value;
                    this.dataSource.sort = this.sort;
                    this.dataSource.paginator = this._paginator;
                    console.log(value);
                },
            });
    }

    search(key: string) {
        this.key = key;
        this.dataSource.data = this.roles?.filter(
            (s) =>
                s?.name?.toLowerCase()?.includes(key?.toLowerCase()) ||
                s?.type?.toLowerCase()?.includes(key?.toLowerCase())
        );
    }

    cloneRole(role) {
        this.actionConfigDialogue.title = `Confirmer la duplication du rôle "${role.title}".`;
        this.actionConfigDialogue.message = `Vous êtes sur le point de créer une copie conforme du rôle "${role.title}".<br>Toutes les permissions associées seront dupliquées.<br>Vous pourrez ensuite modifier ce nouveau rôle indépendamment de l'original.`;
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this._apiRolesService.clone(role.id).subscribe({
                    next: (value) => {
                        this._toast.success('Role dupliqué');
                        this.loadRoles();
                    },
                    error: (err) =>
                        this._toast.error(
                            err?.error?.description ||
                                "Une erreur s'est produit"
                        ),
                });
        });
    }

    deleteRole(role) {
        this.actionConfigDialogue.title = `Confirmer la suppression du rôle "${role.title}".`;
        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer le rôle "${role.title}" ?<br> Cette action est irréversible. Tous les utilisateurs associés à ce rôle perdront immédiatement les permissions correspondantes.`;
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this._apiRolesService.delete(role.id).subscribe({
                    next: (value) => {
                        this._toast.success('Role supprimé');
                        this.roles = this.roles.filter((s) => s.id !== role.id);
                        this.dataSource.data = this.roles;

                        if (this.dataSource.paginator) {
                            this.dataSource.paginator.length =
                                this.roles.length;
                        }
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
