import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    ReactiveFormsModule,
    UntypedFormBuilder,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';

@Component({
    selector: 'accept-reservation',
    templateUrl: './accept.reservation.model.html',
    styleUrls: ['./accept.reservation.model.scss'],
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
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
    ],
})
export class AcceptReservationModel implements OnInit {
    title = 'Accepter la reservation #';
    code;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<AcceptReservationModel>,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { code: any }
    ) {
        this.code = data.code;
    }

    ngOnInit(): void {}

    /*save() {
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

    }*/
}
