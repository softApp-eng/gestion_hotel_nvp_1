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
import { ApiRestaurationService } from '../api.restauration.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { fuseAnimations } from '../../../../@fuse/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UtilsService } from '../../../core/service/utils.service';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { finalize } from "rxjs";
import { ApiCommonService } from '../../../core/service/api.common.service';
import { DecimalPipe } from '@angular/common';
import { ApiMealTypeService } from '../../prices/meal/type/api.meal-type.service';
import { PersonManageModel } from '../dialog-manage-person/person-manage.model';

@Component({
    selector: 'reservation-add',
    templateUrl: './prestation-create-component.html',
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
        MatOption,
        MatSelectModule,
        MatSlideToggleModule,
        FormsModule,
    ],
})
export class PrestationCreateComponent implements OnInit {

    form: UntypedFormGroup;

    mealTypes: string[] = [];

    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    isSaving: boolean = false;

    selectedPerson: any = null;

    selectedReservation: any = null;
    reservationLoading = false;
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _apiReservationService: ApiRestaurationService,
        private _apiCommonService: ApiCommonService,
        private _router: Router,
        private _toastr: Toastr,
        private _activeRoute: ActivatedRoute,
        private _utilsService: UtilsService,
        private _matDialog: MatDialog,
        private api: ApiMealTypeService,
    ) {}

    ngOnInit(): void {

        this.form = this._formBuilder.group({
            mealType: [null, [Validators.required]],
            quantity: [1, Validators.required],
            price: [0],
            totalPrice: [0],
            observation: ['']
        });

        // total price auto
        this.form.get('quantity')?.valueChanges.subscribe(qty => {
            const unit = this.form.get('price')?.value || 0;
            const total = (qty || 0) * unit;
            this.form.get('totalPrice')?.setValue(total, { emitEvent: false });
        });

        // load enums mealTypes
        this._apiCommonService.getEnumsData('meal-types').subscribe(res => {
            this.mealTypes = res;
        });

        // reload price when mealType changes
        this.form.get('mealType')?.valueChanges.subscribe(() => {
            if (this.selectedPerson) {
                this.loadMealPrice(this.selectedPerson);
            }
        });

        if (this.selectedPerson) {
            this.loadActiveReservation(this.selectedPerson);
        }
    }

    loadMealPrice(person: any) {

        const mealType = this.form.get('mealType')?.value;

        if (!mealType || !person) {
            this.form.get('price')?.setValue(0);
            this.form.get('totalPrice')?.setValue(0);
            return;
        }

        this._apiReservationService.getMealPrice(mealType, person.id).subscribe({
            next: (res) => {
                this.form.get('price')?.setValue(res);

                const qty = this.form.get('quantity')?.value || 0;
                this.form.get('totalPrice')?.setValue(qty * res);
            },
            error: () => {
                this.form.get('price')?.setValue(0);
                this.form.get('totalPrice')?.setValue(0);
            }
        });
    }

    raisePersonAddDialog() {
        this._matDialog
            .open(PersonManageModel, {
                data: { selectedPersons: this.selectedPerson ? [this.selectedPerson] : [] },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                if (result && result.length > 0) {
                    this.selectedPerson = result[0];

                    this.loadMealPrice(this.selectedPerson);

                    this.loadActiveReservation(this.selectedPerson);
                }
            });
    }

    removeSelectedPerson() {
        this.selectedPerson = null;
        this.form.get('price')?.setValue(0);
        this.form.get('totalPrice')?.setValue(0);
    }

    save() {

        if (!this.selectedPerson) {
            this.showAlert = true;
            this.alert = {
                type: 'error',
                message: 'Veuillez sélectionner un client'
            };
            return;
        }

        if (this.form.invalid) {
            this.showAlert = true;
            this.alert = {
                type: 'error',
                message: 'Veuillez remplir tous les champs obligatoires'
            };
            return;
        }

        const data = {
            personId: this.selectedPerson.id,
            mealType: this.form.get('mealType')?.value,
            quantity: this.form.get('quantity')?.value,
            observation: this.form.get('observation')?.value
        };

        this.isSaving = true;

        this._apiReservationService.createPrestation(data)
            .pipe(finalize(() => this.isSaving = false))
            .subscribe({
                next: () => {
                    this._toastr.success("Prestation enregistrée avec succès");
                    this._router.navigate(['../'], { relativeTo: this._activeRoute });
                },
                error: () => {
                    this._toastr.error("Erreur lors de l'enregistrement");
                }
            });
    }
    loadActiveReservation(person: any) {

        if (!person) {
            this.selectedReservation = null;
            return;
        }

        this.reservationLoading = true;

        this._apiReservationService
            .getActiveReservationByPerson(person.id)
            .pipe(finalize(() => this.reservationLoading = false))
            .subscribe({
                next: (res) => {

                    console.log("Reservation API Response =", res);

                    this.selectedReservation = res || null;

                },
                error: () => {
                    this.selectedReservation = null;
                }
            });
    }


}
