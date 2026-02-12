import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseAlertComponent, FuseAlertType } from '../../../../@fuse/components/alert';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Toastr } from '../../../core/service/toastr.service';
import { ApiReservationService } from '../api.reservation.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { fuseAnimations } from '../../../../@fuse/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UtilsService } from '../../../core/service/utils.service';
import { MatDialog } from '@angular/material/dialog';
import { PersonManageModel } from '../dialog-manage-person/person-manage.model';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { AssignRoomsModel } from '../room-assign/assign-rooms.model';
import {finalize} from "rxjs";
import { ApiCommonService } from '../../../core/service/api.common.service';

@Component({
    selector: 'reservation-add',
    templateUrl: './reservation.create.component.html',
    standalone: true,
    animations: fuseAnimations,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        RouterLink,
        FuseAlertComponent,
        MatCheckboxModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatMenuModule,
        MatTooltip,
        MatOption,
        MatSelectModule,
        MatSlideToggleModule,
        FormsModule,
    ],
})
export class ReservationCreateComponent implements OnInit {
    form: UntypedFormGroup;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    isSaving: boolean = false;
    reservationId;
    //today's date
    today: Date = new Date();

    startAt: Date | null = null;
    endAt: Date | null = null;
    durationInDays: number | null = null;
    persons: any[] = [];

    groupedAction: boolean = false;
    selectedGroupedPersons = [];

    roles = [
        {
            code: 'PRINCIPAL',
            name: 'Titulaire Principal',
            description:
                "L'invité militaire titulaire de la réservation et responsable principal.",
        },
        {
            code: 'VICE',
            name: 'Mandataire / Secondant',
            description:
                "Responsable désigné agissant au nom du titulaire en cas d'absence de ce dernier.",
        },
        {
            code: 'FAMILY',
            name: 'Membre Famille',
            description:
                'Membre de la famille (conjoint, ascendant) accompagnant le titulaire.',
        },
        {
            code: 'CHILD',
            name: 'Enfant',
            description:
                'Enfant à charge du titulaire militaire bénéficiant du séjour.',
        },
    ];

    categories = [];

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _apiReservationService: ApiReservationService,
        private _apiCommonService: ApiCommonService,
        private _router: Router,
        private _toastr: Toastr,
        private _activeRoute: ActivatedRoute,
        private _utilsService: UtilsService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.loadCategories();
        this.form = this._formBuilder.group({
            category: [null, [Validators.required]],
            observation: [''],
            dateRange: this._formBuilder.group(
                {
                    start: [null, [Validators.required]],
                    end: [null, [Validators.required]],
                },
                {
                    validators: [Validators.required],
                }
            ),
        });
        // Listen for changes
        this.form.get('dateRange')?.valueChanges.subscribe((val) => {
            if (val.start && val.end) {
                this.startAt = val.start;
                this.endAt = val.end;
                this.durationInDays = this._utilsService.calculateDuration(
                    this.startAt,
                    this.endAt
                );
            }
        });

        if (this._router.url.includes('edit')) {
            this.initializeForm();
        }
    }

    loadCategories() {
        this._apiCommonService.getEnumsData('reservation-categories').subscribe({
            next: (result) => {
                this.categories = result;
            }
        })
    }

    save(){
        this.showAlert = false; // Reset l'alerte
        const errors: string[] = [];

        // 1. Validation des dates
        const dateRange = this.form.get('dateRange')?.value;
        if (!dateRange?.start || !dateRange?.end) {
            errors.push("Veuillez sélectionner une période valide (Date début et fin).");
        }

        // 2. Validation de la liste des personnes
        if (this.persons.length === 0) {
            errors.push("Veuillez ajouter au moins un invité.");
        }

        // 3. Validation des détails de chaque personne (ID, Room, Role)
        this.persons.forEach((p, index) => {
            const name = `${p.firstName} ${p.lastName}`;

            if (!p.id) {
                errors.push(`Données d'identité manquantes pour l'invité n°${index + 1}.`);
            }
            if (!p.role) {
                errors.push(`Le rôle n'a pas été défini pour ${name}.`);
            }
            if (!p.room || !p.room.id) {
                errors.push(`La chambre n'a pas été affectée pour ${name}.`);
            }
        });

        // 4. Affichage des messages d'erreur si présents
        if (errors.length > 0) {
            this.alert = {
                type: 'error',
                message: errors.join('|') // Ou une liste HTML si votre composant d'alerte le supporte
            };
            this.showAlert = true;

            // Optionnel : Scroll vers l'alerte
            setTimeout(() => {
                const alertElement = document.querySelector('fuse-alert');
                if (alertElement) {
                    alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 0);
            return;
        }

        // 5. Si tout est valide, construction du Payload
        const reservationData = {
            startDate: this._utilsService.convertToDate(dateRange.start),
            endDate: this._utilsService.convertToDate(dateRange.end),
            category:  this.form.get('category')?.value,
            observation:  this.form.get('observation')?.value,
            persons: this.persons.map(p => ({
                personId: p.id,
                role: p.role,
                roomId: p.room.id
            }))
        };

        console.log('PAYLOAD VALIDE:', reservationData);

        // Démarrage de la sauvegarde réelle
        this.isSaving = true;
        this.form.disable();

        // Appel au service
        this._apiReservationService.create(reservationData)
            .pipe(finalize(() => {
                this.isSaving = false;
                this.form.enable();
            }))
            .subscribe({
                next: (response) => {
                    this._toastr.success('Réservation enregistrée avec succès');
                    this._router.navigate(['../'], { relativeTo: this._activeRoute });
                },
                error: (err) => {
                    this.alert = { type: 'error', message: 'Erreur lors de la sauvegarde.' };
                    this.showAlert = true;
                }
            });
    }

    raisePersonAddDialog() {
        this._matDialog
            .open(PersonManageModel, {
                data: { selectedPersons: [...this.persons] },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.persons = result;
                    console.log('returned data', result);
                }
            });
    }

    raiseRoomAssignDialog() {
        this._matDialog
            .open(AssignRoomsModel, {
                data: {},
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result && result.room) {
                    // 1. Get the IDs of currently selected persons for easy lookup
                    const selectedIds = this.selectedGroupedPersons.map(
                        (p) => p.id
                    );

                    // 2. Map through the main persons array to update the room
                    this.persons = this.persons.map((person) => {
                        if (selectedIds.includes(person.id)) {
                            return {
                                ...person,
                                room: result.room, // Assign the room object/ID
                            };
                        }
                        return person;
                    });

                    // 3. Optional: Provide feedback and reset UI
                    this._toastr.success(
                        `${this.selectedGroupedPersons.length} personne(s) affectée(s) à la chambre.`
                    );
                    //this.selectedGroupedPersons = [];
                    //this.groupedAction = false;
                }
            });
    }

    initializeForm() {}

    unSelectPerson(person: any) {
        if (!person || !person.id) return;
        this.persons = this.persons.filter((p) => p.id !== person.id);
    }

    getRoleName(code: string): string {
        if (!code) return 'Choisir...';
        // Cherche le rôle dans votre tableau roles et retourne son nom
        return this.roles.find((r) => r.code === code)?.name || code;
    }

    toggleSelection(person: any, checked: boolean): void {
        if (checked) {
            this.selectedGroupedPersons.push(person);
        } else {
            this.selectedGroupedPersons = this.selectedGroupedPersons.filter(
                (p) => p.id !== person.id
            );
        }
    }

    assignRole(roleCode: string): void {
        if (this.selectedGroupedPersons.length === 0) return;

        // Update the role in the main persons array
        this.persons.forEach((p) => {
            if (
                this.selectedGroupedPersons.find(
                    (selected) => selected.id === p.id
                )
            ) {
                p.role = roleCode;
            }
        });

        // Optional: Clear selection and close toggle after bulk action
        //this.selectedGroupedPersons = [];
        //this.groupedAction = false;

        this._toastr.success('Rôles mis à jour pour la sélection');
    }

    isPersonSelected(person: any): boolean {
        return this.selectedGroupedPersons.some((p) => p.id === person.id);
    }

    selectAll(s) {
        if (s) {
            this.selectedGroupedPersons = this.persons.map((p) => p);
        } else this.selectedGroupedPersons = [];
    }
}
