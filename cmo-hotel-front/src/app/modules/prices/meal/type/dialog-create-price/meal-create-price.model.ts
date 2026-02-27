import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiMealPriceService } from '../api.meal-price.service';
import { ApiCommonService } from '../../../../../core/service/api.common.service';

@Component({
    selector: 'meal-price-create-dialog',
    templateUrl: './meal-create-price.model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule
    ]
})
export class MealPriceCreateDialogComponent {

    form: UntypedFormGroup;
    price;
    type;

    //categories = [
        'OFFICIER_SUPERIEUR'
        'OFFICIER_SUBALTERNE'
        'CIVIL'
    //];
    categories;
    isLoading = false;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        public _apiCommonService: ApiCommonService,
        private fb: FormBuilder,
        private api: ApiMealPriceService,
        private toast: ToastrService,
        protected dialogRef: MatDialogRef<MealPriceCreateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { type: any, price?: any }
    ) {

        this.loadGradeCategories();
        this.form = this._formBuilder.group({
            mealTypeId: ['', [Validators.required]],
            category: ['', [Validators.required]],
            price: ['', [Validators.required]],
        });
        this.price = data.price;
        this.type = data.type;
        this.form.patchValue({ mealTypeId: this.type.id });
        console.log('data', this.data);
        if (this.price){
            //initialize
            this.form.patchValue({
                category: this.price.category.code,
                price: this.price.price
            });
        }
    }

    ngOnInit(): void {}

    loadGradeCategories() {
        this._apiCommonService.getEnumsData('grade-categories').subscribe(res => {
            console.log(res);
            this.categories = res;
        })
    }

    save() {
        if (this.form.invalid) return;

        this.isLoading = true;

        const payload = {
            ...this.form.value,
            mealTypeId: this.data.type.id
        };

        const request = this.data.price
            ? this.api.update(payload, this.data.price.id)
            : this.api.create(payload);

        request
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: () => {
                    this.toast.success('Prix enregistré');
                    this.dialogRef.close({ reload: true });
                },
                error: err => {
                    this.toast.error('Categorie déjas existe');
                }
            });
    }
}
