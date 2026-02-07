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
import { ApiUsersService } from '../api.users.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'user-update',
    templateUrl: './user.update-mdp.model.html',
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
    ],
})
export class UserUpdateMdpModel implements OnInit {
    title = 'Changer mot de passe';
    form: UntypedFormGroup;
    userid;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<UserUpdateMdpModel>,
        public _apiUsersService: ApiUsersService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { user: any }
    ) {
        this.form = this._formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(4)]],
        });
        this.userid = data.user?.userid;
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
            .updateMdpUser(this.form.value,this.userid)
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
                    this._toast.success('Mdp changer');
                    this.matDialogRef.close();
                },
                error: (err) => {
                    this._toast.error(err?.error?.description || 'Problème de modification');
                },
            });

    }
}
