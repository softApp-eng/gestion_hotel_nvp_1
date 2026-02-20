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
import { ToastrService } from 'ngx-toastr';
import { ApiHousekeepingService } from '../../api.housekeeping.service';

@Component({
    selector: 'agent-model',
    templateUrl: './agent-create.model.html',
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
export class AgentCreateModel implements OnInit {
    title = 'Enregistrer un agent';
    form: UntypedFormGroup;
    agent;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<AgentCreateModel>,
        public _apiHousekeepingService: ApiHousekeepingService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { agent: any }
    ) {
        this.form = this._formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            phone: [''],
        });
        this.agent = data.agent;
        console.log('rec data',data);
        if (this.agent){
            //initialize
            this.form.patchValue({
                firstName: this.agent.firstName,
                lastName: this.agent.lastName,
                phone: this.agent.phone
            });
        }

    }

    ngOnInit(): void {}

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        // Disable the form
        this.form.disable();
        let payload = this.form.value;

        if (!this.agent){
            // create new pavillon
            this._apiHousekeepingService
                .createAgent(payload)
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
                        this._toast.success('Agent crée');
                        this.matDialogRef.close({reload: true});
                    },
                    error: (err) => {
                        this._toast.error(err?.error?.description || 'Problème de creation');
                    },
                });
        } else {
            // update pavillon
            this._apiHousekeepingService
                .updateAgent(payload,this.agent.id)
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
                        this._toast.success('agent modifié');
                        this.matDialogRef.close({reload: true});
                    },
                    error: (err) => {
                        this._toast.error(err?.error?.description || 'Problème de modification');
                    },
                });
        }
    }
}
