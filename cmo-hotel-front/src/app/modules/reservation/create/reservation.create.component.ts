import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FuseAlertComponent, FuseAlertType } from '../../../../@fuse/components/alert';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Toastr } from '../../../core/service/toastr.service';
import { ApiReservationService } from '../api.reservation.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { fuseAnimations } from '../../../../@fuse/animations';
import { APP_MODULES } from '../../../core/data/app-modules';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UtilsService } from '../../../core/service/utils.service';
import { PavillonCreateModel } from '../../pavillon/create/pavillon-create.model';
import { MatDialog } from '@angular/material/dialog';
import { PersonManageModel } from '../dialog-manage-person/person-manage.model';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { JsonPipe } from '@angular/common';
import { AssignRoomsModel } from '../room-assign/assign-rooms.model';

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

    groupedAction:boolean = false;
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

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _apiReservationService: ApiReservationService,
        private _router: Router,
        private _toastr: Toastr,
        private _activeRoute: ActivatedRoute,
        private _utilsService: UtilsService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.form = this._formBuilder.group({
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
                this.calculateDuration();
            }
        });

        if (this._router.url.includes('edit')) {
            this.initializeForm();
        }
    }

    calculateDuration() {
        console.log('calculate days', this.startAt, this.endAt);

        if (this.startAt && this.endAt) {
            // Conversion en objets Date valides
            const start = new Date(this.startAt);
            const end = new Date(this.endAt);

            // Calcul de la différence en millisecondes
            const diffInMs = end.getTime() - start.getTime();

            // Conversion Ms -> Jours
            // (1000ms * 60s * 60m * 24h) = 86,400,000
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

            // On arrondit et on ajoute +1 pour inclure le jour de départ
            this.durationInDays = Math.round(diffInDays) + 1;

            console.log('Nombre de jours:', this.durationInDays);
        } else {
            this.durationInDays = null;
        }
    }

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        const dateRange = this.form.get('dateRange').value;

        const reservationData = {
            startDate: dateRange.start,
            endDate: dateRange.end,
            persons: this.persons.map(p => ({
                id: p.id,
                role: p.role || 'FAMILY', // Fallback
                roomId: p.room?.id || null
            }))
        };

        console.log('PAYLOAD:', reservationData);

        //console.log('OBJET FINAL À ENREGISTRER :', reservationData);
        return;

        // Disable the form
        this.form.disable();
        this.isSaving = true;
        //const payload = {...this.form.value, permissions: this.getFinalSelection()};
        // Hide the alert
        this.showAlert = false;
        console.log('SAVED!!!');
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
                data: { },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                    if (result && result.room) {

                        // 1. Get the IDs of currently selected persons for easy lookup
                        const selectedIds = this.selectedGroupedPersons.map(p => p.id);

                        // 2. Map through the main persons array to update the room
                        this.persons = this.persons.map(person => {
                            if (selectedIds.includes(person.id)) {
                                return {
                                    ...person,
                                    room: result.room // Assign the room object/ID
                                };
                            }
                            return person;
                        });

                        // 3. Optional: Provide feedback and reset UI
                        this._toastr.success(`${this.selectedGroupedPersons.length} personne(s) affectée(s) à la chambre.`);
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
        return this.roles.find(r => r.code === code)?.name || code;
    }

    toggleSelection(person: any, checked: boolean): void {
        if (checked) {
            this.selectedGroupedPersons.push(person);
        } else {
            this.selectedGroupedPersons = this.selectedGroupedPersons.filter(p => p.id !== person.id);
        }
    }

    assignRole(roleCode: string): void {
        if (this.selectedGroupedPersons.length === 0) return;

        // Update the role in the main persons array
        this.persons.forEach(p => {
            if (this.selectedGroupedPersons.find(selected => selected.id === p.id)) {
                p.role = roleCode;
            }
        });

        // Optional: Clear selection and close toggle after bulk action
        this.selectedGroupedPersons = [];
        this.groupedAction = false;

        this._toastr.success('Rôles mis à jour pour la sélection');
    }

    isPersonSelected(person: any): boolean {
        return this.selectedGroupedPersons.some(p => p.id === person.id);
    }

    selectAll(s) {
        if (s){
            this.selectedGroupedPersons = this.persons.map(p => p);
        } else
            this.selectedGroupedPersons = [];

    }
}
