import {Injectable} from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({providedIn:'root'})
export class SnackbarService {
    /**
     * Constructor
     */
    constructor( private _snackBar: MatSnackBar ) {
    }

    showSuccess(message: string) {
        this._snackBar.open(message, 'Fermer', {
            //panelClass: ['custom-snackbar', 'success'],
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
        });
    }

    showError(message: string) {
        this._snackBar.open(message, 'Réessayer', {
           // panelClass: ['custom-snackbar', 'error'],
            duration: 6000,
        });
    }
}
