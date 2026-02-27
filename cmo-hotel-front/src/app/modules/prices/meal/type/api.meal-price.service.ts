import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ApiMealPriceService {

    private readonly API_URL = `${environment.solidarityApi}/v1/meals/price`;

    constructor(private _httpClient: HttpClient) {}

    // GET PRICES BY TYPE
    findByType(typeId: number): Observable<any[]> {
        const params = new HttpParams().set('id', typeId.toString());
        return this._httpClient.get<any[]>(`${this.API_URL}/byType`, { params });
    }

    // GET ONE PRICE
    getOne(id: number): Observable<any> {
        const params = new HttpParams().set('id', id);
        return this._httpClient.get(`${this.API_URL}/one`, { params });
    }

    // CREATE
    create(payload: any): Observable<any> {
        return this._httpClient.post(`${this.API_URL}/create`, payload);
    }

    // UPDATE
    update(payload: any, id: number): Observable<any> {
        const params = new HttpParams().set('id', id.toString());
        return this._httpClient.put(`${this.API_URL}/update`, payload, { params });
    }

    // DELETE
    delete(id: number): Observable<any> {
        const params = new HttpParams().set('id', id);
        return this._httpClient.delete(`${this.API_URL}/delete`, { params });
    }
}
