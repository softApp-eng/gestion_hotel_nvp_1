import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiPavillonService {

    private readonly API_URL = `${environment.solidarityApi}/v1/pavillons`;

    /**
    * Constructor
    */
    constructor(private _httpClient: HttpClient)
    {
    }

    create(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/create`, payload);
    }

    update(payload,id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.put(`${this.API_URL}/update`, payload, { params });
    }

    all(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/all`);
    }

    one(id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.get(`${this.API_URL}/one`, { params });
    }

}
