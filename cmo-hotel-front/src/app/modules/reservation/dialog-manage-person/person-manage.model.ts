import {
    ChangeDetectorRef,
    Component,
    Inject, OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { ApiPersonService } from '../../person/api.person.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { FuseMediaWatcherService } from '../../../../@fuse/services/media-watcher';
import { FuseConfirmationService } from '../../../../@fuse/services/confirmation';
import { HighlightPipe } from '../../../../@fuse/pipes/HighlightPipe';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgClass } from '@angular/common';
import { PersonCreateModel } from '../dialog-person-create/person-create.model';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { data } from 'autoprefixer';

@Component({
    selector: 'person-manage-model',
    templateUrl: './person-manage.model.html',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        HighlightPipe,
        MatCheckbox,
        MatPaginator,
        NgClass,
        MatTooltip,
        MatMenu,
        MatMenuModule
    ],
})
export class PersonManageModel implements OnInit, OnDestroy {
    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
    isLoading: boolean = false;
    displayedColumns: string[] = [
        'selection',
        'grade',
        'name',
        'identity',
        'unite',
        'matricule',
        'action',
    ];
    key = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    dataSource = new MatTableDataSource<any>([]);
    totalRows = 0;
    pageSize = 20;
    currentPage = 0;
    pageSizeOptions: number[] = [20, 50, 70, 100];

    selectedPersons: any[] = [];

    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<PersonManageModel>,
        private _apiPersonService: ApiPersonService,
        private _toast: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA)
        public data: { selectedPersons: any, category: any }
    ) {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        //this.searchPersons();
        console.log('xxx',this.data);
        this.selectedPersons = this.data.selectedPersons ? [...this.data.selectedPersons] : [];
        this._changeDetectorRef.markForCheck()
        // const people = this.data.selectedPersons || [];
        // if (people.length > 0) {
        //     people.forEach(p => this.toggleModule(p,true))
        //     console.log('xxx after',this.selectedPersons);
        //     this._changeDetectorRef.markForCheck()
        // }

        this.dataSource.paginator = this._paginator;
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

    toggleModule(person: any, checked: boolean): void {
        if (checked) {
            // Vérifier si l'objet n'est pas déjà présent par son ID
            if (!this.selectedPersons.some(p => p.id === person.id)) {
                this.selectedPersons.push(person);
            }
        } else {
            // Filtrer pour retirer l'objet
            this.selectedPersons = this.selectedPersons.filter((p) => p.id !== person.id);
        }
    }

    isModuleSelected(personId: any): boolean {
        // Comparaison basée sur l'ID à l'intérieur de la liste d'objets
        return this.selectedPersons.some(p => p.id === personId);
    }

    raisePersonCreate(person?,isFamille=false) {
        this._matDialog
            .open(PersonCreateModel, {
                data: {person:person,isFamille:isFamille},
                disableClose: true,
            })
            .afterClosed()
            .subscribe((data) => {
                if (data) {
                    // new person
                    if (data && data.status === 'create') {
                        const newPerson = data.data;
                        const currentData = this.dataSource.data;
                        this.dataSource.data = [newPerson, ...currentData];
                        if (!this.selectedPersons.some(p => p.id === newPerson.id)) {
                            this.selectedPersons.push(newPerson);
                        }
                        this.totalRows += 1;
                        this._changeDetectorRef.markForCheck();
                        this._toast.info('Invité ajouté et sélectionné');
                    }
                    if (data.status === 'update') {
                        const updatedPerson = data.data;
                        this.dataSource.data = this.dataSource.data.map((p) =>
                            p.id === updatedPerson.id ? updatedPerson : p
                        );
                        const index = this.selectedPersons.findIndex(p => p.id === updatedPerson.id);
                        if (index !== -1) {
                            this.selectedPersons[index] = updatedPerson;
                        }

                        this._toast.info('Informations mises à jour');
                    }
                }
            });
    }

    get isSelectionInvalid(): boolean {
        const count = this.selectedPersons.length;
        const category = this.data.category;

        if (category === 'SINGLE') {
            return count !== 1; // Doit être exactement 1
        }
        if (category === 'FAMILY') {
            return count < 2; // Au moins 2 personnes (Titulaire + 1 ayant droit)
        }
        if (category === 'DELEGATION') {
            return count < 1; // Au moins 1 personne
        }

        return count === 0; // Sécurité par défaut
    }

    saveAndClose() {
        /*const count = this.selectedPersons.length;
        const category = this.data.category;

        if (category === 'SINGLE' && count > 1) {
            this._toast.error('La catégorie "Individuel" ne permet qu\'un seul résident.');
            return;
        }

        if (category === 'FAMILY' && count < 2) {
            this._toast.error('La catégorie "Famille" nécessite au moins deux personnes (le titulaire et un membre de la famille).');
            return;
        }

        if (category === 'DELEGATION' && count < 1) {
            this._toast.error('Veuillez sélectionner au moins un membre pour la délégation.');
            return;
        }

        if (count === 0) {
            this._toast.error('Veuillez sélectionner au moins un invité.');
            return;
        }*/

        this.matDialogRef.close(this.selectedPersons);
    }
}
