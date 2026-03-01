import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { ApiMealTypeService } from '../api.meal-type.service';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiCommonService } from '../../../../../core/service/api.common.service';

@Component({
    standalone: true,
    selector: 'app-meal-type-save-dialog',
    templateUrl: './meal-create-type.model.html',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatToolbarModule,
        MatIconModule
    ]
})
export class MealTypeSaveDialogComponent implements OnInit {

    form!: FormGroup;
    title = 'Type de repas';
    isLoading = false;
    constructor(
        private fb: FormBuilder,
        private api: ApiMealTypeService,
        private toast: ToastrService,
        public matDialogRef: MatDialogRef<MealTypeSaveDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

    }

    ngOnInit(): void {

        this.form = this.fb.group({
            id: [null],
            name: ['', Validators.required],
            description: ['']
        });
        if (this.data && this.data.id) {
            this.form.patchValue({
                id: this.data.id,
                name: this.data.name,
                description: this.data.description,
            })
        }
    }

    save() {
        if (this.form.invalid) return;

        this.isLoading = true;

        const payload = {
            name: this.form.value.name,
            description: this.form.value.description
        };

        const request = this.form.value.id
            ? this.api.update(this.form.value.id, payload)
            : this.api.create(payload);

        request
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: () => {
                    this.toast.success('type enregistré');
                    this.matDialogRef.close(true);
                },
                error: err => {
                    this.toast.error(err?.error?.description || 'Problème de creation');
                }
            });
    }

}
