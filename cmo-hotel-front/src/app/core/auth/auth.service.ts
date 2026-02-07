import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {Router} from "@angular/router";
import {catchError, finalize, Observable, of, switchMap, throwError} from "rxjs";

import {UserService} from "../user/user.service";
import {environment} from "../../../environments/environment.development";
import {APP_ROUTES} from "../data/app-routes";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _authenticated: boolean = false;
    jwtHelper = new JwtHelperService();
    private readonly accessTokenName:string='cmo-accessToken';
    private readonly refreshTokenName:string='cmo-refreshToken';
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _router:Router,
        private _userService:UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem(this.accessTokenName, token);
    }

    get accessToken(): string
    {
        return localStorage.getItem(this.accessTokenName) ?? '';
    }

    set refreshToken(token: string)
    {
        localStorage.setItem(this.refreshTokenName, token);
    }

    get refreshToken(): string
    {
        return localStorage.getItem(this.refreshTokenName) ?? '';
    }

    get roles(): string[]
    {
        return this.jwtHelper.decodeToken(this.accessToken)?.roles || null;
    }

    get permissions(): string[]
    {
        return this.jwtHelper.decodeToken(this.accessToken)?.permissions || null;
    }

    get accountType(): string
    {
        return this.jwtHelper.decodeToken(this.accessToken)?.account_type || null;
    }

    get accessTokenExpiration()
    {
        return this.jwtHelper.decodeToken(this.accessToken).exp || 0;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { token:string, email:string, photoUrl?:string, firstName?:string, lastName?:string}): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError(()=>new Error('User is already logged in.'));
        }
        return this._httpClient.post(environment.solidarityApi+'/v1/auth/login', credentials).pipe(
            switchMap((response: any) => {
                // Store the access token in the local storage
                this.accessToken = response.accessToken;
                this.refreshToken = response.refreshToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     * private String accessToken;
     * private String refreshToken;
     */
    signInUsingRefreshToken(): Observable<boolean>
    {
        console.log('signInUsingRefreshToken');
        // Sign in using the token
        return this._httpClient.post(environment.solidarityApi+'/v1/auth/refreshtoken', {
            refreshToken: this.refreshToken
        }).pipe(
            catchError(() =>
                //throwError(()=>new Error("error refresh token"))
                of(false)
            ),
            switchMap((response: any) => {
                if ( response )
                {
                    this.accessToken = response.accessToken;
                    this.refreshToken = response.refreshToken;
                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Return true
                    return of(true);
                } else {
                    // Set the authenticated flag to true
                    this._authenticated = false;

                    // Return true
                    return of(false);
                }

            })
        );
    }

    /**
     * Sign out
     */
    signOut(): void
    {
        this._httpClient.get(environment.solidarityApi+'/logout')
            .pipe(
                finalize(() => {
                    // Remove the access token from the local storage
                    localStorage.removeItem(this.refreshTokenName);
                    localStorage.removeItem(this.accessTokenName);
                    this._userService.user = null;
                    // Set the authenticated flag to false
                    this._authenticated = false;
                    this._router.navigateByUrl(APP_ROUTES.auth.signin);
                })
            ).subscribe({
            next:()=>{console.log('log out from backend')},
            error:()=>{console.error('error log out from backend')},
        });

    }

    rolesChecker(authorizedRoles:string[]):boolean{
        if (authorizedRoles == null || authorizedRoles.length == 0) return false;
        let roles = this.roles;
        if (roles == null){
            this.signOut()
            return false;
        }

        let result = false;
        authorizedRoles?.forEach(ar=>{
            if( roles?.includes(ar) ) result = true;
        });
        return result;
    }

    permissionChecker(authorizedPermissions: string[]): boolean {
        if (!authorizedPermissions?.length) return false;

        const permissions = this.permissions;
        if (!permissions) {
            this.signOut();
            return false;
        }

        return authorizedPermissions.some(ar => permissions.includes(ar));
    }

    hasAnyPermissionInModule(modules: string[]): boolean {
        if (!modules?.length) return false;

        const permissions = this.permissions;
        if (!permissions) {
            this.signOut();
            return false;
        }

        return modules.some(m =>
            permissions.some(p => p.split(':')[0] === m)
        );
    }

    accountTypeChecker(accountTypes:string[]):boolean{
        if (accountTypes == null || accountTypes.length == 0) return false;
        const index: number = accountTypes.indexOf(this.accountType);
        return (index !== -1)
    }

    /*accountTypeChecker(accountTypeCheck:string):boolean{
        return (accountTypeCheck === this.accountType)
    }*/
    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check the access token availability
        if ( !this.accessToken || !this.refreshToken ) return of(false);
        // Check if the user is logged in
        if ( this._authenticated ) return of(true);
        // Check the access token expire date
        if ( this.isAccessTokenExpired() ) return this.signInUsingRefreshToken();
        return of(true);
    }

    isAccessTokenExpired(){
        return ((new Date().getTime() - (this.accessTokenExpiration * 1000)) > 0);
    }

    addTokenHeader(request: HttpRequest<any>) {
        if (request.url.startsWith(environment.solidarityApi) && !request.url.includes('auth'))
            return request.clone({
                headers: request.headers.set(
                    'Authorization',
                    'aitkhmim_' + this.accessToken
                ),
            });
        else return request;
    }

}
