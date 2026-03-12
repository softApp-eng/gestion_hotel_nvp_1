import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    FormControl,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { ApiHousekeepingService } from '../../api.housekeeping.service';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { NgIf } from '@angular/common';
import { UtilsService } from '../../../../core/service/utils.service';
import { NgxAngularTimePickerLibraryModule } from 'ngx-angular-time-picker-library';

@Component({
    selector: 'room-status-model',
    templateUrl: './room-update-clean-status.model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatDatepicker,
        MatDatepickerInput,
        MatDatepickerToggle,
        NgIf,
        MatSelectModule,
    ],
})
export class RoomUpdateCleanStatusModel implements OnInit {
    title = 'Ménage des chambres';
    form: UntypedFormGroup;
    agents;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<RoomUpdateCleanStatusModel>,
        public _apiHousekeepingService: ApiHousekeepingService,
        public _utilsService: UtilsService,
        private _toast: ToastrService,
        @Inject(MAT_DIALOG_DATA)
        public data: { room: any, history:any }
    ) {
        this.loadAgents();
        this.form = this._formBuilder.group({
            agentId: ['', [Validators.required]],
            date: [new Date(), [Validators.required]],
            timeStart: ['', [Validators.required]],
            timeEnd: ['', [Validators.required]],
            comment: [''],
        });
        if (data.history){
            const start = new Date(data.history.startAt);
            const end = new Date(data.history.endAt);

            this.form.patchValue({
                agentId: data.history.agent.id,
                comment: data.history.comment,
                // Initialise le DatePicker (partie Date uniquement)
                date: start,
                // Initialise les inputs d'heure (Format HH:mm)
                timeStart: this.formatTime(start),
                timeEnd: this.formatTime(end)
            });
        }
    }

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    ngOnInit(): void {}

    loadAgents() {
        this._apiHousekeepingService.listAllAgent().subscribe({
            next: (data) => {
                this.agents = data;
            },
        });
    }

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        // Disable the form
        this.form.disable();
        //date: [new Date(), [Validators.required]],
        //             timeStart: ['', [Validators.required]],
        //             timeEnd: ['', [Validators.required]],
        const rawDate = this.form.get('date').value;
        const rawTimeStart = this.form.get('timeStart').value;
        const rawTimeEnd = this.form.get('timeEnd').value;

        // Conversion au format attendu par le backend : "16/02/2026 18:30"
        const formattedDateTimeStart = this._utilsService.convertToLocalDateTime(
            rawDate,
            rawTimeStart
        );

        const formattedDateTimeEnd = this._utilsService.convertToLocalDateTime(
            rawDate,
            rawTimeEnd
        );

        let payload = {
            roomId: (this.data.history)? this.data.history.room.id: this.data.room.id,
            clean:true,
            comment:this.form.get('comment').value,
            agentId:this.form.get('agentId').value,
            startAt:formattedDateTimeStart,
            endAt:formattedDateTimeEnd,
        };

        if (this.data.history){
            this._apiHousekeepingService
                .updateHistory(this.data.history.id,payload)
                .pipe(
                    finalize(() => {
                        this.form.enable();
                    })
                )
                .subscribe({
                    next: (value) => {
                        this._toast.success('Enregistré');
                        this.matDialogRef.close({reload: true});
                    },
                    error: (err) => {
                        this._toast.error(err?.error?.description || 'Problème de creation');
                    },
                });
        } else
        this._apiHousekeepingService
            .updateClean(payload)
            .pipe(
                finalize(() => {
                    this.form.enable();
                })
            )
            .subscribe({
                next: (value) => {
                    this._toast.success('Etat de chambre modifiée');
                    this.matDialogRef.close({reload: true});
                },
                error: (err) => {
                    this._toast.error(err?.error?.description || 'Problème de creation');
                },
            });
    }
}
