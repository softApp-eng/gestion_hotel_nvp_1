import { TextFieldModule } from '@angular/cdk/text-field';
import {
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Toastr } from '../../../core/service/toastr.service';
import { ApiConfigurationService } from '../api.configuration.service';

@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TextFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
    ],
})
export class ConfigurationComponent implements OnInit {

    cronSaved: boolean = false;
    checkoutSaved: boolean = false;

    scheduledTime;
    checkout;
    isLoading: boolean = false;
    initialConfigs;

    /**
     * Constructor
     */
    constructor(
        private _apiConfigurationService: ApiConfigurationService,
        private _toastr: Toastr
    ) {}

    /**
     * On init
     */
    ngOnInit(): void {
        this._apiConfigurationService.loadCurrentConfigs().subscribe({
            next: (data) => {
                this.initialConfigs = data;
                this.scheduledTime = this.convertCronToTimeSafe(data.autoCleaningRoomTimeCronExpression);
                this.checkout = data.checkoutTime;
                console.log(data);
            },
        });
    }

    convertCronToTimeSafe(cron: string): string {
        // Regex pour extraire les minutes et heures d'un cron standard
        const match = cron.match(/^\S+\s+(\d+)\s+(\d+)/);
        if (match) {
            const h = match[2].padStart(2, '0');
            const m = match[1].padStart(2, '0');
            return `${h}:${m}`;
        }
        return '08:00'; // Fallback
    }

    saveCronSettings(): void {
        if (!this.scheduledTime) return;

        this.isLoading = true;

        this._apiConfigurationService.updateRoomCleaningCron(this.scheduledTime).subscribe({
            next: () => {
                this.isLoading = false;
                this.cronSaved = true;
                this._toastr.success('Planification mise à jour avec succès');
            },
            error: (err) => {
                this.isLoading = false;
                this._toastr.error('Erreur lors de la mise à jour');
            }
        });
    }

    saveCheckoutSettings(): void {
        if (!this.checkout) return;

        this.isLoading = true;
        this._apiConfigurationService.updateCheckout(this.checkout).subscribe({
            next: () => {
                this.isLoading = false;
                this.checkoutSaved = true;
                this._toastr.success('Mise à jour avec succès');
            },
            error: (err) => {
                this.isLoading = false;
                this._toastr.error('Erreur lors de la mise à jour');
            }
        });
    }
}
