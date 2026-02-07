import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ApiUsersService } from '../api.users.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'user-update',
    templateUrl: './user-update.html',
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
        MatSlideToggle,
    ],
})
export class UserUpdateModel implements OnInit {
    title = 'Modifier compte';
    form: UntypedFormGroup;
    userid;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<UserUpdateModel>,
        public _apiUsersService: ApiUsersService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { user: any }
    ) {
        console.log('received data', data);
        this.form = this._formBuilder.group({
            username: ['', [Validators.required, Validators.minLength(4)]],
            firstName: ['', [Validators.maxLength(254)]],
            lastName: ['', [Validators.maxLength(254)]],
            status: [true, [Validators.required]],
        });
        this.userid = data.user?.userid;
        this.form.patchValue({ username: data.user?.username });
        this.form.patchValue({ firstName: data.user?.firstName });
        this.form.patchValue({ lastName: data.user?.lastName });
        this.form.patchValue({ status: data.user?.status });
    }

    ngOnInit(): void {}

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        // Disable the form
        this.form.disable();

        this._apiUsersService
            .updateUser(this.form.value,this.userid)
            .pipe(
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
                    this._toast.success('Utilisateur modifié');
                    this.matDialogRef.close({...this.form.value,userid:this.userid});
                },
                error: (err) => {
                    this._toast.error(err?.error?.description || 'Problème de modification');
                },
            });

    }
}
