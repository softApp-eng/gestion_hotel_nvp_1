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
import { DatePipe, DecimalPipe } from '@angular/common';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
import { MatStepperModule } from '@angular/material/stepper';
import { MatOptionModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

interface RoomGroup {
    room: any;
    persons: any[];
}

@Component({
    selector: 'reservation-add',
    templateUrl: './reservation.create.component.html',
    styleUrls: ['./reservation.create.component.scss'],
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
        DecimalPipe,

        MatStepperModule,
        MatOptionModule,
        MatRadioModule,
        DatePipe,
    ],
})
export class ReservationCreateComponent implements OnInit {
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    isSaving: boolean = false;
    today: Date = new Date();

    startAt: Date | null = null;
    endAt: Date | null = null;
    durationInDays: number | null = null;
    persons: any[] = [];

    groupedAction: boolean = false;
    selectedGroupedPersons = [];

    roles = [];
    relationships = [];

    categories = [];

    estimatedPayment;

    horizontalStepperForm: UntypedFormGroup;
    reservationCode: any;

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
        this.loadRoles();
        this.loadRelationships();
        this.horizontalStepperForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                dateRange: this._formBuilder.group(
                    {
                        start: [null, [Validators.required]],
                        end: [null, [Validators.required]],
                    },
                    {
                        validators: [Validators.required],
                    }
                ),
                category: [null, [Validators.required]],
                priseEnCharge: [''],
                priseEnChargeReference: [''],
            }),
            step2: this._formBuilder.group({}),
            step3: this._formBuilder.group({
                observation: [''],
            }),
        });
        if (this._router.url.includes('edit')) {
            this.initializeForm();
        }
        // Listen for changes
        this.horizontalStepperForm
            .get('step1.dateRange')
            ?.valueChanges.subscribe((val) => {
            if (val && (val.start || val.end)) {
                // Si les dates changent, on invalide les chambres assignées
                // car la disponibilité n'est plus garantie pour la nouvelle période
                this.persons = this.persons.map(p => ({
                    ...p,
                    room: null // On retire la chambre
                }));

                // Optionnel : Notification utilisateur
                if (this.persons.some(p => p.id)) {
                    this._toastr.info('La période a changé : les chambres assignées ont été réinitialisées.');
                }
            }
                if (val && val.start && val.end) {
                    this.startAt = val.start;
                    this.endAt = val.end;
                    this.durationInDays = this._utilsService.calculateDuration(
                        this.startAt,
                        this.endAt
                    );
                    if (this.durationInDays > 0) {
                        this.durationInDays--;
                    }
                }
            });

        this.horizontalStepperForm
            .get('step1.category')
            ?.valueChanges.subscribe((category) => {
            if (category && this.persons.some(p => p.id)) {
                // On vide complètement la liste des personnes
                this.persons = [];
                this.selectedGroupedPersons = [];

                // On réinitialise les prix estimés
                this.estimatedPayment = [];

                this._toastr.info('Catégorie modifiée : la liste des invités a été réinitialisée.');
            }
        });
        this.horizontalStepperForm
            .get('step1.priseEnCharge')
            ?.valueChanges.subscribe((isCharged) => {
            if (!isCharged) {
                // On vide le champ et on peut aussi supprimer les erreurs de validation
                this.horizontalStepperForm.get('step1.priseEnChargeReference')?.setValue('', { emitEvent: false });
            }
        });

    }

    loadCategories() {
        this._apiCommonService
            .getEnumsData('reservation-categories')
            .subscribe({
                next: (result) => {
                    this.categories = result;
                },
            });
    }

    loadRoles() {
        this._apiCommonService.getEnumsData('guest-roles').subscribe({
            next: (result) => {
                this.roles = result;
            },
        });
    }

    loadRelationships() {
        this._apiCommonService.getEnumsData('relationships').subscribe({
            next: (result) => {
                this.relationships = result;
            },
        });
    }

    get estimatedTotal(): number {
        return this.estimatedPayment?.reduce((sum, detail) => sum + detail.totalPrice, 0) || 0;
    }
    get filteredRoles(): any[] {
        const category =
            this.horizontalStepperForm.get('step1.category')?.value;
        if (category === 'SINGLE') {
            return this.roles.filter(
                (r) => r.code === 'PRINCIPAL' || r.code === 'VICE'
            );
        }
        if (category === 'DELEGATION') {
            return this.roles.filter((r) => r.code === 'PRINCIPAL');
        }
        return this.roles;
    }



    /**
     * Vérifie si la liste des résidents est valide pour passer à l'étape suivante
     */
    get isStepResidentsValid(): boolean {
        if (!this.persons || this.persons.length === 0) return false;

        // 1. Vérification de base : ID, Rôle et Chambre pour tout le monde
        const basicCheck = this.persons.every(p => p.id && p.role && p.room?.id);
        if (!basicCheck) return false;

        const category = this.horizontalStepperForm.get('step1.category')?.value;

        // 2. Logique spécifique pour FAMILY
        if (category === 'FAMILY') {
            // Compter les responsables (Principal ou Vice)
            const leads = this.persons.filter(p => p.role === 'PRINCIPAL' || p.role === 'VICE');

            // Vérifier qu'il n'y a qu'UN SEUL responsable
            if (leads.length !== 1) return false;

            // Vérifier que tous les autres sont soit FAMILY soit CHILD
            const othersAreValid = this.persons.every(p => {
                if (p.role === 'PRINCIPAL' || p.role === 'VICE') return true;
                return p.role === 'SPOUSE'
                    || p.role === 'SON'
                    || p.role === 'DAUGHTER'
                    || p.role === 'FATHER'
                    || p.role === 'MOTHER'
                    || p.role === 'BROTHER'
                    || p.role === 'SISTER'
                    || p.role === 'LEGAL_WARD'
                    || p.role === 'CHILD';
            });

            if (!othersAreValid) return false;
        }

        return true;
    }

    countLeads(): number {
        return this.persons.filter(p => p.role === 'PRINCIPAL' || p.role === 'VICE').length;
    }
    get isStepResidentsValid_old(): boolean {
        // 1. Il doit y avoir au moins une personne
        if (!this.persons || this.persons.length === 0) {
            return false;
        }
        // 2. Chaque personne doit avoir un rôle ET une chambre assignée
        return this.persons.every(p =>
            p.id &&
            p.role &&
            p.room &&
            p.room.id
        );
    }

    save() {
        this.showAlert = false; // Reset l'alerte
        const errors: string[] = [];

        // 1. Validation des dates
        const dateRange = this.horizontalStepperForm.get('step1.dateRange')?.value;
        if (!dateRange?.start || !dateRange?.end) {
            errors.push(
                'Veuillez sélectionner une période valide (Date début et fin).'
            );
        }

        // 2. Validation de la liste des personnes
        if (this.persons.length === 0) {
            errors.push('Veuillez ajouter au moins un invité.');
        }

        // 3. Validation des détails de chaque personne (ID, Room, Role)
        this.persons.forEach((p, index) => {
            const name = `${p.firstName} ${p.lastName}`;

            if (!p.id) {
                errors.push(
                    `Données d'identité manquantes pour l'invité n°${index + 1}.`
                );
            }
            if (!p.role) {
                errors.push(`Le rôle n'a pas été défini pour ${name}.`);
            }
            if (!p.room || !p.room.id) {
                errors.push(`La chambre n'a pas été affectée pour ${name}.`);
            }
        });

        if (this.horizontalStepperForm.get('step1.category')?.value === 'FAMILY') {
            const leadsCount = this.countLeads();
            if (leadsCount !== 1) {
                errors.push("Pour une catégorie FAMILLE, il doit y avoir exactement un responsable (Principal ou Mandataire).");
            }
        }

        // 4. Affichage des messages d'erreur si présents
        if (errors.length > 0) {
            this.alert = {
                type: 'error',
                message: errors.join('|'), // Ou une liste HTML si votre composant d'alerte le supporte
            };
            this.showAlert = true;

            // Optionnel : Scroll vers l'alerte
            setTimeout(() => {
                const alertElement = document.querySelector('fuse-alert');
                if (alertElement) {
                    alertElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }
            }, 0);
            return;
        }
        const reservationData = {
            startDate: this._utilsService.convertToDate(dateRange.start),
            endDate: this._utilsService.convertToDate(dateRange.end),
            category: this.horizontalStepperForm.get('step1.category')?.value,
            observation: this.horizontalStepperForm.get('step3.observation')?.value,
            priseEnCharge: this.horizontalStepperForm.get('step1.priseEnCharge')?.value,
            priseEnChargeReference: this.horizontalStepperForm.get('step1.priseEnChargeReference')?.value,
            persons: this.persons.map((p) => ({
                personId: p.id,
                role: p.role,
                roomId: p.room.id,
            })),
        };

        console.log('PAYLOAD VALIDE:', reservationData);

        // Démarrage de la sauvegarde réelle
        this.isSaving = true;
        this.horizontalStepperForm.disable({ emitEvent: false });

        if (this.reservationCode)
            this._apiReservationService.update(reservationData, this.reservationCode);

        const request = this.reservationCode
            ? this._apiReservationService.update(reservationData, this.reservationCode)
            : this._apiReservationService.create(reservationData);

        // Appel au service
        request.pipe(
                finalize(() => {
                    this.isSaving = false;
                    this.horizontalStepperForm.enable({ emitEvent: false });
                })
            )
            .subscribe({
                next: (response) => {
                    this._toastr.success('Réservation enregistrée avec succès');
                    this._router.navigateByUrl('/managements/reservations');
                },
                error: (err) => {
                    this.alert = {
                        type: 'error',
                        message: err?.error?.description || 'Erreur lors de la sauvegarde.',
                    };
                    this.showAlert = true;
                },
            });
    }

    getGroupedRooms(): RoomGroup[] {
        const map = new Map<number, RoomGroup>();

        this.persons.forEach((person) => {
            const roomId = person.room?.id;
            if (!roomId) return;

            if (!map.has(roomId)) {
                map.set(roomId, {
                    room: person.room,
                    persons: [],
                });
            }

            map.get(roomId).persons.push(person);
        });
        return Array.from(map.values());
    }

    calculateRoomPrices() {
        const groupedData = this.getGroupedRooms();
        const duration = this.durationInDays || 0;

        this.estimatedPayment = groupedData.map((group) => {
            const payer = group.persons.reduce((highest, current) => {
                return current.grade?.rating < highest.grade?.rating
                    ? current
                    : highest;
            });

            const payerCategoryCode = payer.grade?.category?.code;
            const priceEntry = group.room.roomType.prices.find(
                (p) => p.category.code === payerCategoryCode
            );

            const unitPrice = priceEntry ? priceEntry.price : 0;

            return {
                roomName: `${group.room.roomType.type} / ${group.room.name}`, //group.room.name,
                unitPrice: unitPrice,
                totalPrice: unitPrice * duration,
            };
        });
    }

    private calculateAge(birthDate: string): number {
        if (!birthDate) return 0;
        const timeDiff = Math.abs(Date.now() - new Date(birthDate).getTime());
        return Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
    }

    raisePersonAddDialog() {
        this._matDialog
            .open(PersonManageModel, {
                data: {
                    selectedPersons: [...this.persons],
                    category: this.horizontalStepperForm.get('step1.category').value,
                },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.persons = result;
                }
            });
    }

    raiseRoomAssignDialog() {
        const dateRange = this.horizontalStepperForm.get('step1.dateRange').value;
        const currentOccupations = this.getExistingOccupations();
        this._matDialog
            .open(AssignRoomsModel, {
                data: {
                    start: dateRange.start,
                    end: dateRange.end,
                    existingOccupations: currentOccupations,
                },
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
                }
            });
    }

    initializeForm() {
        this.horizontalStepperForm.disable({ emitEvent: false });
        this.reservationCode = this._activeRoute.snapshot.params['code'];

        this._apiReservationService.getReservation(this.reservationCode).subscribe({
            next: (data: any) => {
                if (data) {
                    // 1. Remplissage du Step 1 (Dates et Catégorie)
                    // Note: On extrait le code de la catégorie car l'API renvoie un objet complet
                    this.horizontalStepperForm.get('step1').patchValue({
                        dateRange: {
                            start: new Date(data.plannedStart),
                            end: new Date(data.plannedEnd)
                        },
                        category: data.category?.code,
                        priseEnCharge: data.priseEnCharge,
                        priseEnChargeReference: data.priseEnChargeReference
                    }, { emitEvent: true });

                    // 2. Remplissage du Step 3
                    this.horizontalStepperForm.get('step3.observation').setValue(data.observation);

                    // 3. Mapping des Guests vers le tableau "persons"
                    // On aplatit la structure pour que p.firstName, p.role et p.room soient accessibles
                    this.persons = data.guests.map(guest => ({
                        ...guest.person,       // Contient id, firstName, lastName, grade, etc.
                        role: guest.role.code, // On stocke uniquement le code pour la validation/formulaire
                        room: guest.room       // Objet room complet pour l'affichage et les calculs
                    }));

                    // 4. Recalcul des variables de durée
                    this.startAt = new Date(data.plannedStart);
                    this.endAt = new Date(data.plannedEnd);
                    this.durationInDays = this._utilsService.calculateDuration(this.startAt, this.endAt);

                    // Correction de la durée si nécessaire (selon votre logique métier)
                    if (this.durationInDays > 0) {
                        this.durationInDays--;
                    }

                    // 5. Calcul immédiat des prix pour l'affichage
                    //this.calculateRoomPrices();
                }

                this.horizontalStepperForm.enable({ emitEvent: false });
            },
            error: (err) => {
                this._toastr.error('Erreur lors du chargement de la réservation');
                this._router.navigate(['../'], { relativeTo: this._activeRoute });
            }
        });
    }

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

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;

    onStepChange(event: StepperSelectionEvent) {
        if (event.selectedIndex === 3) {
            this.calculateRoomPrices();
        }
    }

    private getExistingOccupations(): any[] {
        const occupationsMap = new Map<number, { roomId: number, rangeOccupation: any, numberOfPersons: number }>();
        const dateRange = this.horizontalStepperForm.get('step1.dateRange').value;

        this.persons.forEach(p => {
            if (p.room && p.room.id) {
                const roomId = p.room.id;
                if (!occupationsMap.has(roomId)) {
                    occupationsMap.set(roomId, {
                        roomId: roomId,
                        rangeOccupation: {
                            start: this.formatToISO(dateRange.start),
                            end: this.formatToISO(dateRange.end)
                        },
                        numberOfPersons: 0
                    });
                }
                occupationsMap.get(roomId).numberOfPersons++;
            }
        });

        return Array.from(occupationsMap.values());
    }

    private formatToISO(dateInput: any): string {
        if (!dateInput) return '';

        const date = new Date(dateInput);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day} 12:00`;
    }
}
