import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatDrawerContainer, MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
 import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CommonModule, DecimalPipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { ApiRestaurationService } from '../api.restauration.service';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { RouterLink } from '@angular/router';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PrestationManageModel } from '../dialog-manage-prestation/prestation-manage-model';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { Toastr } from '../../../core/service/toastr.service';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';

@Component({
    selector: 'app-restauration-list',
    templateUrl: './prestation-list-component.html',
    imports: [
        MatPaginator,
        MatIcon,
        DecimalPipe,
        MatDrawer,
        MatDrawerContainer,
        MatTable,
        MatSidenavModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatPaginatorModule,
        MatSortModule,
        RouterLink,
        DisableIfNoPermissionDirective,
        MatFormField,
        MatInput,
        MatPrefix,
        MatTooltip,
        NgClass,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
        CommonModule,
        HighlightPipe,
    ],
    standalone: true,
})
export class PrestationListComponent implements OnInit {
    @ViewChild('matDrawer') matDrawer: MatDrawer;
    @ViewChild(MatPaginator) paginator: MatPaginator;
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

    displayedColumns: string[] = ['grade', 'name','identity','totalPrice', 'action'];
    dataSource = new MatTableDataSource<any>([]);
    selectedItem: any;

    pageSize = 20;
    pageSizeOptions = [20, 50, 100];
    totalRows = 0;
    currentPage = 0;
    drawerMode: MatDrawerMode;

    prestations = [];
    key = '';

    constructor(
        private apiService: ApiRestaurationService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.loadPrestations();
    }
    loadPrestations() {
        this.apiService.getPrestationsForResidents().subscribe({
            next: (res) => {
                this.prestations = this.dataSource.data = this.dataSource.data = res;
                this.totalRows = res.length;
                if (this.paginator) {
                    this.dataSource.paginator = this.paginator;
                }
                console.log('Prestations chargées:', res);
            },
            error: (err) => console.error(err),
        });
    }

    search(key: string): void {
        this.key = key?.trim().toLowerCase();

        // Si la clé est vide, on réinitialise avec toutes les données originales
        if (!this.key) {
            this.dataSource.data = this.prestations;
            return;
        }

        this.dataSource.data = this.prestations?.filter((item) => {
            const person = item?.person;

            // On crée un tableau des champs dans lesquels on veut chercher
            const searchFields = [
                person?.identity,
                person?.matricule,
                person?.firstName,
                person?.lastName,
                person?.grade?.name
            ];

            // On vérifie si au moins un des champs contient la clé
            return searchFields.some(field =>
                field?.toLowerCase().includes(this.key)
            );
        });
    }

    totalAmount(p): number {
        if (!p || !p.prestations) {
            return 0;
        }
        return p.prestations.reduce((acc, p) => {
            return acc + (p.price * p.quantity);
        }, 0);
    }

    totalQuantities(p): number {
        if (!p || !p.prestations) {
            return 0;
        }

        return p.prestations.reduce((acc, p) => {
            return acc + (p.quantity || 0);
        }, 0);
    }

    openDrawer(item: any) {
        this.selectedItem = item;
        this.matDrawer.open();
    }

    closeDrawer() {
        this.matDrawer.close();
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
    }

    raiseSavePrestation(row: any) {
        const dialogRef = this.dialog.open(PrestationManageModel, {
            width: '400px',
            data: row,
        });

        dialogRef.afterClosed().subscribe((updated) => {
            if (updated) {
                this.snackBar.open(
                    'Prestation modifiée avec succès',
                    'Fermer',
                    { duration: 2000 }
                );
                this.loadPrestations();
            }
        });
    }
    deletePrestation(row: any): void {
        this.actionConfigDialogue.title = `Confirmer la suppression de la prestation`;

        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer la prestation de
        "<strong>${row.person.firstName} ${row.person.lastName}</strong>" ?
        <br> Cette action est irréversible.`;

        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.apiService.deletePrestation(row.id).subscribe({
                    next: () => {
                        this._toast.success('Prestation supprimée avec succès');
                        this.loadPrestations();
                    },
                    error: (err) =>
                        this._toast.error(
                            err?.error?.description ||
                                "Une erreur s'est produite"
                        ),
                });
            }
        });
    }
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    protected readonly Date = Date;
}
