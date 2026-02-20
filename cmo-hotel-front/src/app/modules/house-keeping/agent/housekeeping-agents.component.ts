import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {  FormBuilder, FormsModule } from '@angular/forms';
import { ApiHousekeepingService } from '../api.housekeeping.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { finalize } from 'rxjs';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { Toastr } from '../../../core/service/toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { AgentCreateModel } from './dialog-create-agent/agent-create.model';

@Component({
    standalone: true,
    selector: 'app-housekeeping-agents',
    imports: [
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatTooltipModule,
        MatSidenavModule,
        MatIconModule,
        FormsModule,
        MatTabsModule,
        MatSortModule,
        DisableIfNoPermissionDirective,
    ],
    templateUrl: './housekeeping-agents.component.html',
})
export class HousekeepingAgentsComponent implements OnInit, AfterViewInit {
    isLoading: boolean = false;
    displayedColumns: string[] = ['agents', 'tel', 'action'];
    dataSource = new MatTableDataSource<any>([]);
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

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;

    raiseSaveAgent(agent) {
        this._matDialog
            .open(AgentCreateModel, {
                data: { agent: agent },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((data) => {
                if (data?.reload) {
                    this.loadAgents();
                }
            });
    }

    deleteAgent(agent) {
        this.actionConfigDialogue.title = `Confirmer la suppression de l'agent "${agent.firstName + ' '+ agent.lastName}".`;
        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer l'agent "${agent.firstName + ' '+ agent.lastName}" ?<br> Cette action est irréversible.`;
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this.hk.deleteAgent(agent.id).subscribe({
                    next: (value) => {
                        this._toast.success('Agent supprimé');
                        this.dataSource.data = this.dataSource.data.filter(
                            (s) => s.id !== agent.id
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

    constructor(
        private hk: ApiHousekeepingService,
        private fb: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.loadAgents();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    loadAgents() {
        this.isLoading = true;
        this.hk
            .listAllAgent()
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.dataSource.data = value;
                    this.dataSource.sort = this.sort;
                    console.log(value);
                },
            });
    }

}
