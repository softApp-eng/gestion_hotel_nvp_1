import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { ApiMealTypeService } from '../../prices/meal/type/api.meal-type.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ApiRestaurationService } from '../api.restauration.service';

@Component({
    selector: 'prestation-add',
    templateUrl: './prestation-mono-create.model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatSelectModule,
        MatButtonToggleModule,
        FormsModule,
    ],
})
export class PrestationMonoCreateModel implements OnInit {
    title = 'Enregistrer une prestation';
    form: UntypedFormGroup;
    pavillon;
    meals: any = [];
    type : 'SERVICE'|'MEAL' = "MEAL";
    prestation: any;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<PrestationMonoCreateModel>,
        public _apiRestaurationService: ApiRestaurationService,
        private _apiMealServices: ApiMealTypeService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: {reservation:any, prestation:any, category?:any}
    ) {
        this.form = this._formBuilder.group({
            reservation: ['', [Validators.required]],
            name: ['', [Validators.required]],
            quantity: [1, [Validators.required, Validators.min(1)]],
            price: [0],
            observation: [''],
        });
        this.form.patchValue({reservation: data.reservation});
        console.log('--reservation',data.reservation);
        console.log('--prestation',data.prestation);

        //this.pavillon = data.pavillon;
        if (data.prestation){
            this.prestation = data.prestation;
            this.type = data.prestation.type;
            if (this.type == 'SERVICE') {
                this.form.patchValue({
                    name: this.prestation.name,
                    quantity: this.prestation.quantity,
                    price: this.prestation.price,
                    observation: this.prestation.observation
                });
            } else if (this.type == 'MEAL') {
                this.form.patchValue({
                    name: this.prestation.name,
                    quantity: this.prestation.quantity,
                    price: this.prestation.price ?? 0,
                    observation: this.prestation.observation
                });
            }

        }
    }

    ngOnInit(): void {
        this.loadMeals();
    }

    loadMeals() {
        this._apiMealServices.allWithPrices().subscribe({
            next: (res) => {
                console.log('meals', res);
                this.meals = res;
                // Pré-remplir le prix selon la catégorie de la personne (nouvelle prestation repas)
                if (this.type === 'MEAL' && !this.prestation) {
                    this.computeMealPrice();
                }
            },
        });
    }

    /**
     * Prix du repas sélectionné pour la catégorie de grade de la personne.
     * Le champ reste modifiable par l'utilisateur.
     */
    computeMealPrice(mealName?: string) {
        const name = mealName ?? this.form.get('name')?.value;
        const category = this.data?.category;
        // La catégorie de grade est sérialisée en objet { code, name, description }
        const categoryCode = typeof category === 'string' ? category : category?.code;
        if (!name || !categoryCode) return;

        const meal = (this.meals || []).find((m: any) => m.name === name);
        const priceEntry = (meal?.prices || []).find((p: any) => {
            const c = p?.category;
            const code = typeof c === 'string' ? c : c?.code;
            return code === categoryCode;
        });
        if (priceEntry) {
            this.form.patchValue({ price: priceEntry.price }, { emitEvent: false });
        }
    }

    onMealChange(mealName: string) {
        this.computeMealPrice(mealName);
    }

    onTypeChange() {
        if (this.type === 'MEAL') {
            this.computeMealPrice();
        }
    }

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        // Disable the form
        this.form.disable();
        let payload = {};
        if(this.type === 'MEAL') {
            payload = {
                reservation: this.data.reservation,
                name: this.form.value.name,
                quantity: this.form.value.quantity,
                type: 'MEAL',
                price: this.form.value.price,
                observation: this.form.value.observation
            }
        } else if (this.type === 'SERVICE') {
            payload = {
                reservation: this.data.reservation,
                name: this.form.value.name,
                quantity: this.form.value.quantity,
                type: 'SERVICE',
                price: this.form.value.price,
                observation: this.form.value.observation
            }
        }

        const resuest = this.prestation ?
            this._apiRestaurationService.updatePrestation(this.prestation.prestationId, payload):
            this._apiRestaurationService.createPrestationForPerson(payload);

        resuest.pipe(
                finalize(() => {
                    // Show the alert
                    this.form.enable();
                    window.scroll({
                        top: 0,
                        left: 0,
                        behavior: 'smooth',
                    });
                })
            )
            .subscribe({
                next: (value) => {
                    this._toast.success('Prestation enregistrée');
                    this.matDialogRef.close({
                        reload: true,
                        update: !!this.prestation,
                        data: this.prestation ?{...payload,prestationId:this.prestation.prestationId}:null
                    });
                },
                error: (err) => {
                    this._toast.error(err?.error?.description || 'Problème de creation');
                },
            });
    }
}
