import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiRoomPriceService {

    private readonly API_URL = `${environment.solidarityApi}/v1/rooms/prices`;

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

    delete(id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.delete(`${this.API_URL}/delete`, { params });
    }

    all(): Observable<any>{
        return this._httpClient.get(`${this.API_URL}/all`);
    }

    findByType(typeId): Observable<any>{
        let params = new HttpParams().set('id', typeId);
        return this._httpClient.get(`${this.API_URL}/byType`, { params });
    }

    one(id): Observable<any>{
        let params = new HttpParams().set('id', id);
        return this._httpClient.get(`${this.API_URL}/one`, { params });
    }

}
