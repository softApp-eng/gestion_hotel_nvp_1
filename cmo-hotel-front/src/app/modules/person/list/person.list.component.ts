import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { NgClass, TitleCasePipe } from '@angular/common';
import { ApiPersonService } from '../api.person.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HasPermissionDirective } from '../../../core/auth/HasPermissionDirective';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { MatDrawer, MatDrawerContainer, MatSidenavModule } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '../../../../@fuse/services/media-watcher';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DisableIfNoPermissionDirective } from '../../../core/auth/DisableIfNoPermissionDirective';
import { FuseConfirmationConfig, FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { Toastr } from '../../../core/service/toastr.service';

@Component({
    selector: 'person-list',
    templateUrl: './person.list.component.html',
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
        MatDrawerContainer,
        MatSidenavModule,
        MatIconModule,
        FormsModule,
        MatTabsModule,
        TitleCasePipe,
        RouterLink,
        HasPermissionDirective,
        DisableIfNoPermissionDirective,
    ],
})
export class PersonListComponent implements OnInit, OnDestroy {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'grade',
        'name',
        'identity',
        'unite',
        'matricule',
        'action',
    ];
    key = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    selectedItem;
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];
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
        private _apiPersonService: ApiPersonService,
        private _matDialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: Toastr,
    ) {}

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        //this.searchPersons();
        this.dataSource.paginator = this._paginator;
        // Subscribe to media query change
        this._fuseMediaWatcherService
            .onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {
                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.search();
    }

    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.search();
    }

    search() {
        this.isLoading = true;
        this.dataSource.data = [];
        this._apiPersonService
            .search(this.key, this.currentPage, this.pageSize)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.dataSource.data = value?.content || [];
                    this.totalRows = value?.totalElements || 0;

                    setTimeout(() => {
                        if (this._paginator) {
                            this._paginator.pageIndex = this.currentPage;
                            this._paginator.length = this.totalRows;
                        }
                    });
                },
            });
    }

    openDrawer(item) {
        this.selectedItem = item;
        this.matDrawer.open();
    }

    closeDrawer() {
        this.matDrawer.close();
    }

    deletePerson() {
        if (!this.selectedItem?.id)
            return;
        this.actionConfigDialogue.title = `Confirmer la suppression du client "${this.selectedItem.firstName + ' '+ this.selectedItem.lastName}".`;
        this.actionConfigDialogue.message = `Êtes-vous sûr de vouloir supprimer le client "${this.selectedItem.firstName + ' '+ this.selectedItem.lastName}" ?<br> Cette action est irréversible.`;
        const dialogRef = this._fuseConfirmationService.open(
            this.actionConfigDialogue
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed')
                this._apiPersonService.delete(this.selectedItem?.id).subscribe({
                    next: (value) => {
                        this._toast.success('Client supprimé');
                        this.dataSource.data = this.dataSource.data.filter(
                            (s) => s.id !== this.selectedItem?.id
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

}
