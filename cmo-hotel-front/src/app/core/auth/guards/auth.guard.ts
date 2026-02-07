import {inject} from '@angular/core';
import {CanActivateChildFn,
    CanActivateFn,
    Router,
} from '@angular/router';
import { of } from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {AuthService} from "../auth.service";
import {APP_ROUTES} from "../../data/app-routes";
import { Toastr } from '../../service/toastr.service';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const _router: Router = inject(Router);
    const _authService: AuthService = inject(AuthService);
    const _toast: Toastr = inject(Toastr);
    const redirectUrl:string = APP_ROUTES.auth.signin;

    // Check the authentication status
    return _authService
        .check()
        .pipe(
            catchError(() =>
                _router.navigateByUrl(redirectUrl)
            ),
            switchMap((authenticated) => {
                // If the user is not authenticated...
                if (!authenticated) {
                    _router.navigateByUrl(redirectUrl);
                    // Prevent the access
                    return of(false);
                }
                if (route.data['roles']) {
                    if (!_authService.rolesChecker(route.data['roles'])) {
                        _toast.warning('Action non autorisée!');
                        _router.navigateByUrl(redirectUrl);
                    }
                }

                if (route.data['module']) {
                    if (!_authService.hasAnyPermissionInModule(route.data['module'])) {
                        _toast.warning('Action non autorisée!');
                        _router.navigateByUrl(redirectUrl);
                    }
                }

                if (route.data['permissions']) {
                    if (!_authService.permissionChecker(route.data['permissions'])) {
                        _toast.warning('Action non autorisée!');
                        _router.navigateByUrl(redirectUrl);
                    }
                }

                // Allow the access
                return of(true);
            })
        );
};
