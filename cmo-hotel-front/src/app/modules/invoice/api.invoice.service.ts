import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiInvoiceService {

    private readonly API_URL = `${environment.solidarityApi}/v1/invoices`;

    /**
    * Constructor
    */
    constructor(private _httpClient: HttpClient)
    {
    }

    validateInvoiceNight(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/night/validate`, payload);
    }

    lastValidatdNight(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/last-validated-night`);
    }

    payInvoice(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/pay`, payload);
    }

    search(key='',paymentModes=[],priseEnCharge=false,categories=[],status=[],start = '',end = '',page=0,size=20): Observable<any>{
        let params = new HttpParams()
            .set('key', key)
            .set('priseEnCharge', priseEnCharge)
            .set('start', start)
            .set('end', end)
            .set('page', page)
            .set('size', size);
        if (paymentModes && paymentModes.length > 0) {
            paymentModes.forEach(s => {
                params = params.append('paymentModes', s);
            });
        }
        if (status && status.length > 0) {
            status.forEach(s => {
                params = params.append('status', s);
            });
        }
        if (categories && categories.length > 0) {
            categories.forEach(s => {
                params = params.append('categories', s);
            });
        }
        return this._httpClient.get(`${this.API_URL}/search`, { params });
    }

    getEncaissement(day = ''): Observable<any>{
        let params = new HttpParams()
            .set('day', day);
        return this._httpClient.get(`${this.API_URL}/encaissement`, { params });
    }

    generateInvoicePdf(num): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/download/invoice?num=${num}`, {
            responseType: 'blob'
        });
    }

    generateEncaissementPdf(day): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/download/encaissement?day=${day}`, {
            responseType: 'blob'
        });
    }
}
