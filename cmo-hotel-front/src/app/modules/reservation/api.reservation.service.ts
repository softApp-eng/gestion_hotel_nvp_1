import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiReservationService {

    private readonly API_URL = `${environment.solidarityApi}/v1/reservations`;

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }

    search(page=0,size=20): Observable<any>{
        let params = new HttpParams().set('page', page).set('size', size);
        return this._httpClient.get(`${this.API_URL}/search`, { params });
    }

    create(payload): Observable<any>{
        return this._httpClient.post(`${this.API_URL}/create`, payload);
    }

}
