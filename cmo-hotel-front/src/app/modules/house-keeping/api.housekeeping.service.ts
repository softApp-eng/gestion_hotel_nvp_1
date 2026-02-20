import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiHousekeepingService {

    private readonly API_URL = `${environment.solidarityApi}/v1/house-keeping`;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    listAllAgent(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/agents/all`);
    }

    createAgent(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/agents/create`, payload);
    }

    updateAgent(payload,id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.put(`${this.API_URL}/agents/update`, payload, { params });
    }



    deleteAgent(id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.delete(`${this.API_URL}/agents/delete`, { params });
    }

}
