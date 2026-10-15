import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiMealTypeService {

    private readonly API_URL = `${environment.solidarityApi}/v1/meals/type`;

    constructor(private _httpClient: HttpClient) {}

    // ================= CRUD =================

    create(payload): Observable<any> {
        return this._httpClient.post(`${this.API_URL}/create`, payload);
    }

    update(id: number, payload: any): Observable<any> {
        return this._httpClient.put(
            `${this.API_URL}/update`,
            payload,
            {
                params: {
                    id: id.toString()
                }
            }
        );
    }


    delete(id): Observable<any> {
        const params = new HttpParams().set('id', id);
        return this._httpClient.delete(`${this.API_URL}/delete`, { params });
    }

    one(id): Observable<any> {
        const params = new HttpParams().set('id', id);
        return this._httpClient.get(`${this.API_URL}/one`, { params });
    }

    // ================= PRICES =================

    allWithPrices(): Observable<any> {
        return this._httpClient.get(`${this.API_URL}/all`);
    }

}
