import {Injectable} from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiRestaurationService {

    private readonly API_URL = `${environment.solidarityApi}/v1/prestations`;

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }

    createPrestation(data: any) {
        return this._httpClient.post(`${this.API_URL}/create`, data);
    }

    createPrestationForPerson(data: any) {
        return this._httpClient.post(`${this.API_URL}/reservation/create`, data);
    }

    getPrestationsForResidents(): Observable<any[]> {
        return this._httpClient.get<any[]>(`${this.API_URL}/residents`);
    }

    getPrestationsForReservation(code): Observable<any[]> {
        return this._httpClient.get<any[]>(`${this.API_URL}/reservation?code=${code}`);
    }

    deletePrestation(id, reason?: string): Observable<void> {
        let params = new HttpParams().set('id', id);
        if (reason && reason.trim().length > 0) {
            params = params.set('reason', reason.trim());
        }
        return this._httpClient.delete<void>(`${this.API_URL}/delete`, { params });
    }


    updatePrestation(id: string, prestation: any): Observable<any> {
        return this._httpClient.put<any>(
            `${this.API_URL}/update?id=${id}`,
            prestation
        );
    }

}
