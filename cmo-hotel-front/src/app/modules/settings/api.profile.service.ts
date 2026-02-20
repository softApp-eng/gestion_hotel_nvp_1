import {Injectable} from "@angular/core";
import { HttpClient } from '@angular/common/http';
import {environment} from "../../../environments/environment.development";

@Injectable({
  providedIn: 'root'
})
export class ApiRolesService
{

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient)
  {
  }

    changePassword(payload){
        return this._httpClient.put(
            `${environment.solidarityApi}/v1/profile/password/change`,
            payload
        );
    }

    updateProfile(payload){
        return this._httpClient.put(
            `${environment.solidarityApi}/v1/profile/me`,
            payload
        );
    }

}
