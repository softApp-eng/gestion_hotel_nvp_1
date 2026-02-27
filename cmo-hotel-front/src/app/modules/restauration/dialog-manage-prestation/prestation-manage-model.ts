import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ApiRestaurationService } from '../api.restauration.service';
import { ToastrService } from 'ngx-toastr';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-prestation-save-dialog',
    templateUrl: './prestation-manage-model.html',
    imports: [
        MatFormField,
        MatToolbar,
        MatIcon,
        ReactiveFormsModule,
        MatSelect,
        MatOption,
        MatIconButton,
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatToolbarModule,
        MatIconModule
    ],
    standalone: true,
})
export class PrestationManageModel implements OnInit {

    form!: FormGroup;
    mealTypes: string[] = ['PETIT_DEJEUNER', 'DEJEUNER', 'DINER']; // ou récupérer depuis API
    title = 'Modifier prestation';
    price: number = 0;
    totalPrice: number = 0;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiRestaurationService,
        private toast: ToastrService,
        public matDialogRef: MatDialogRef<PrestationManageModel>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            id: [this.data?.id],
            mealType: [this.data?.mealType || '', Validators.required],
            quantity: [this.data?.quantity || 1, Validators.required],
            observation: [this.data?.observation || '']
        });

        if (this.data) {
            this.updatePrice();
            this.updateTotalPrice();
        }
    }

    updatePrice() {
        const mealType = this.form.value.mealType;
        const personId = this.data.person.id;

        if (mealType) {
            this.apiService.getMealPrice(mealType, personId).subscribe({
                next: (res: number) => {
                    this.price = res;
                    this.updateTotalPrice();
                },
                error: err => this.toast.error('Erreur récupération prix')
            });
        }
    }

    updateTotalPrice() {
        const qty = this.form.value.quantity || 1;
        this.totalPrice = this.price * qty;
    }

    save() {
        if (this.form.invalid) return;

        const payload = {
            personId: this.data.person.id,
            mealType: this.form.value.mealType,
            quantity: this.form.value.quantity,
            observation: this.form.value.observation
        };

        this.apiService.updatePrestation(this.data.id, payload).subscribe({
            next: () =>{
                this.toast.success('Prestation modifiée avec succès');
                this.matDialogRef.close(true)
            },

            error: err => this.toast.error('Erreur lors de la modification')
        });

    }
}

