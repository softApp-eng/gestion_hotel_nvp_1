import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, ReplaySubject, tap } from 'rxjs';
import { ApiInvoiceService } from '../../modules/invoice/api.invoice.service';

@Injectable({ providedIn: 'root' })
export class LastValidatedNightService {
    private _apiInvoiceService = inject(ApiInvoiceService);

    private _lastNight: BehaviorSubject<Date | null> = new BehaviorSubject<Date | null>(null);

    /**
     * Getter pour exposer la nuit validée sous forme d'Observable
     */
    get lastNight$(): Observable<Date | null> {
        return this._lastNight.asObservable();
    }

    /**
     * Méthode pour récupérer la date depuis la base de données au démarrage
     */
    getFromServer(): Observable<Date> {
        return this._apiInvoiceService.lastValidatdNight().pipe(
            map((data) => new Date(data)),
            tap((date: Date) => {
                this._lastNight.next(date);
            })
        );
    }

    /**
     * Récupère la valeur actuelle de manière synchrone
     */
    getLatestValue(): Date | null {
        return this._lastNight.getValue();
    }

    /**
     * Méthode pour mettre à jour manuellement le service après une validation réussie
     * @param newDate La date de la nuit qui vient d'être validée
     */
    updateLastNight(): void {
        this.getFromServer().subscribe();
    }
}
