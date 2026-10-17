import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ApiInvoiceService {
    private readonly API_URL = `${environment.solidarityApi}/v1/invoices`;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    validateInvoiceNight(payload): Observable<any> {
        return this._httpClient.post(`${this.API_URL}/night/validate`, payload);
    }

    lastValidatdNight(): Observable<any> {
        return this._httpClient.get(`${this.API_URL}/last-validated-night`);
    }

    payInvoice(payload): Observable<any> {
        return this._httpClient.post(`${this.API_URL}/pay`, payload);
    }

    changePaymentMode(payload): Observable<any> {
        return this._httpClient.put(`${this.API_URL}/payment-mode`, payload);
    }

    search(
        key = '',
        room = '',
        paymentModes = [],
        priseEnCharge = false,
        categories = [],
        status = [],
        start = '',
        end = '',
        checkinFrom = '',
        checkinTo = '',
        checkoutFrom = '',
        checkoutTo = '',
        page = 0,
        size = 20
    ): Observable<any> {
        let params = new HttpParams()
            .set('key', key)
            .set('room', room)
            .set('priseEnCharge', priseEnCharge)
            .set('start', start)
            .set('end', end)
            .set('checkinFrom', checkinFrom)
            .set('checkinTo', checkinTo)
            .set('checkoutFrom', checkoutFrom)
            .set('checkoutTo', checkoutTo)
            .set('page', page)
            .set('size', size);
        if (paymentModes && paymentModes.length > 0) {
            paymentModes.forEach((s) => {
                params = params.append('paymentModes', s);
            });
        }
        if (status && status.length > 0) {
            status.forEach((s) => {
                params = params.append('status', s);
            });
        }
        if (categories && categories.length > 0) {
            categories.forEach((s) => {
                params = params.append('categories', s);
            });
        }
        return this._httpClient.get(`${this.API_URL}/search`, { params });
    }

    getEncaissement(day = ''): Observable<any> {
        let params = new HttpParams().set('day', day);
        return this._httpClient.get(`${this.API_URL}/encaissement`, { params });
    }

    getInvoiceByReservationCode(code): Observable<any> {
        let params = new HttpParams().set('code', code);
        return this._httpClient.get(`${this.API_URL}/get-by-reservation`, {
            params,
        });
    }

    generateInvoicePdf(num): Observable<any> {
        return this._httpClient.get(
            `${this.API_URL}/download/invoice?num=${num}`,
            {
                responseType: 'blob',
            }
        );
    }

    generateEtatExplicatifPdf(num): Observable<any> {
        return this._httpClient.get(
            `${this.API_URL}/download/etat-explicatif?num=${num}`,
            {
                responseType: 'blob',
            }
        );
    }

    generateEncaissementPdf(day): Observable<any> {
        return this._httpClient.get(
            `${this.API_URL}/download/encaissement?day=${day}`,
            {
                responseType: 'blob',
            }
        );
    }

    /**
     * Correction d'une nuitée d'hébergement facturée (prix et/ou observation).
     */
    updateValidatedNight(id: string, payload): Observable<any> {
        return this._httpClient.put(
            `${this.API_URL}/night/update?id=${encodeURIComponent(id)}`,
            payload
        );
    }

    /**
     * Suppression d'une nuitée d'hébergement facturée.
     */
    deleteValidatedNight(id: string): Observable<any> {
        return this._httpClient.delete(
            `${this.API_URL}/night/delete?id=${encodeURIComponent(id)}`
        );
    }

    /**
     * Correction d'une prestation facturée (libellé, quantité et/ou prix unitaire).
     */
    updateInvoicePrestation(id: number | string, payload): Observable<any> {
        return this._httpClient.put(
            `${this.API_URL}/prestation/update?id=${encodeURIComponent(String(id))}`,
            payload
        );
    }

    /**
     * Suppression d'une prestation facturée.
     */
    deleteInvoicePrestation(id: number | string): Observable<any> {
        return this._httpClient.delete(
            `${this.API_URL}/prestation/delete?id=${encodeURIComponent(String(id))}`
        );
    }
}
