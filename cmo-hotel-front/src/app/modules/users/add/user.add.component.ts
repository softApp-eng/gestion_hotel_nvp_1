import { Component, OnInit } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { ApiUsersService } from '../api.users.service';
import { finalize } from 'rxjs';
import { FuseAlertComponent, FuseAlertType } from '../../../../@fuse/components/alert';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';

@Component({
    selector: 'users-add',
    templateUrl: './user.add.component.html',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatSelectModule,
        RouterLink,
        FuseAlertComponent,
        MatSlideToggleModule
    ],
})
export class UserAddComponent implements OnInit {
    form: UntypedFormGroup;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _apiUsersService: ApiUsersService,
    ) {
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group(
            {
                username: ['', [Validators.required, Validators.minLength(3)]],
                password: ['', [Validators.required, Validators.minLength(4)]],
                firstName: ['', [Validators.maxLength(254)]],
                lastName: ['', [Validators.maxLength(254)]],
                status: [true, [Validators.required]],
            }
        );
    }

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        // Disable the form
        this.form.disable();

        // Hide the alert
        this.showAlert = false;

        this._apiUsersService
            .createUser(this.form.value)
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
                    this.alert.type = 'success';
                    this.alert.message = 'Compte crée';
                    this.showAlert = true;
                },
                error: (err) => {
                    // Set the alert
                    this.alert.type = 'error';
                    this.alert.message =
                        err?.error?.description ||
                        'Problème de création de compte';
                    this.showAlert = true;
                },
            });
    }

    protected readonly APP_PERMISSIONS = APP_PERMISSIONS;
}
