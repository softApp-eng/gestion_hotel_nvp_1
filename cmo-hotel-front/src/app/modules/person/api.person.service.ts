import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiPersonService {

    private readonly API_URL = `${environment.solidarityApi}/v1/persons`;

    /**
    * Constructor
    */
    constructor(private _httpClient: HttpClient)
    {
    }

    create(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/create`, payload);
    }

    update(payload,personId): Observable<any>{
        let params = new HttpParams().set('personId', personId);
        return this._httpClient.put(`${this.API_URL}/update`, payload, { params });
    }

    search(key='',page=0,size=20): Observable<any>{
        let params = new HttpParams().set('key', key).set('page', page).set('size', size);
        return this._httpClient.get(`${this.API_URL}/search`, { params });
    }

    one(personId): Observable<any>{
        let params = new HttpParams().set('personId', personId);
        return this._httpClient.get(`${this.API_URL}/one`, { params });
    }

    delete(personId): Observable<any>{
        let params = new HttpParams().set('personId', personId);
        return this._httpClient.delete(`${this.API_URL}/delete`, { params });
    }

}
