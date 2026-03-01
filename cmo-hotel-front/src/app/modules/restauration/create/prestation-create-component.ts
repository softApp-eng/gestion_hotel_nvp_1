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
import { Router, RouterLink } from '@angular/router';
import { FuseAlertComponent, FuseAlertType } from '../../../../@fuse/components/alert';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Toastr } from '../../../core/service/toastr.service';
import { ApiRestaurationService } from '../api.restauration.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { fuseAnimations } from '../../../../@fuse/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { finalize } from "rxjs";
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

    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    isSaving: boolean = false;

    selectedPersons: any = [];
    meals: any = [];




    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _apiReservationService: ApiRestaurationService,
        private _router: Router,
        private _toastr: Toastr,
        private _matDialog: MatDialog,
        private _apiMealServices: ApiMealTypeService,
    ) {}

    ngOnInit(): void {
        this.loadMeals();
        this.form = this._formBuilder.group({
            mealId: [null, [Validators.required]],
            observation: ['']
        });
    }

    loadMeals(){
        this._apiMealServices
            .allWithPrices()
            .subscribe({
                next: (res) => {
                    console.log('meals',res);
                    this.meals=res;
                },
            });
    }

    raisePersonAddDialog() {
        this._matDialog
            .open(PersonManageModel, {
                data: { selectedPersons: this.selectedPersons || [] },
                disableClose: true,
            })
            .afterClosed()
            .subscribe((result) => {
                console.log('selected reservations',result);
                if (result && result.length > 0) {
                    //this.selectedPersons = result;
                    this.selectedPersons = result.map(p => ({
                        ...p,
                        qte: p.qte || 1
                    }));
                }
            });
    }

    removeSelectedPerson(person) {
        if (!person || !person.id) return;
        this.selectedPersons = this.selectedPersons.filter((p) => p.id !== person.id);
    }

    save() {

        if (!this.selectedPersons || this.selectedPersons.length === 0) {
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
            //reservations: this.selectedPersons?.map(r=> r.id),
            reservations: this.selectedPersons.reduce((map, p) => {
                map[p.id] = p.qte || 1;
                return map;
            }, {}),
            mealId: this.form.get('mealId')?.value,
            observation: this.form.get('observation')?.value
        };

        this.isSaving = true;

        this._apiReservationService.createPrestation(data)
            .pipe(finalize(() => this.isSaving = false))
            .subscribe({
                next: () => {
                    this._toastr.success("Préstation enregistrée avec succès");
                    this._router.navigateByUrl('/managements/restauration');
                },
                error: (err) => {
                    this._toastr.error(err?.error?.description || "Erreur lors de l'enregistrement");
                }
            });
    }

}
