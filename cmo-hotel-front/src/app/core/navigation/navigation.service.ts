import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { FuseNavigationItem } from '../../../@fuse/components/navigation';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _httpClient = inject(HttpClient);
    private _authService = inject(AuthService);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                //console.log('it s me',this._authService.roles)
                //console.log('menu',navigation)
                Object.keys(navigation).forEach((menuType) => {
                    navigation[menuType] = this._filterRecursive(navigation[menuType]);
                });
                this._navigation.next(navigation);
            })
        );
    }
    private _filterRecursive(items: FuseNavigationItem[]): FuseNavigationItem[] {
        return items.map((item) => {
            // Associer la fonction hidden à notre checker
            item.hidden = () => !this._canDisplay(item);

            // Si l'élément a des enfants, on les filtre aussi
            if (item.children && item.children.length > 0) {
                item.children = this._filterRecursive(item.children);

                // LOGIQUE SUPPLÉMENTAIRE : Si tous les enfants d'un groupe sont cachés,
                // on cache le groupe entier automatiquement.
                const hasVisibleChildren = item.children.some(child =>
                    !child.hidden || !child.hidden(child)
                );

                if (!hasVisibleChildren && (item.type === 'group' || item.type === 'collapsable')) {
                    item.hidden = () => true;
                }
            }

            return item;
        });
    }

    /**
     * Centralisation des vérifications de sécurité
     */
    private _canDisplay(item: FuseNavigationItem): boolean {
        const data = item.data;

        // Si aucune donnée de restriction n'est présente, on affiche par défaut
        if (!data || (!data.roles && !data.permissions && !data.modules)) {
            return true;
        }

        // 1. Vérification par Rôles (ex: ROLE_ADMIN)
        if (data.roles?.length > 0) {
            if (!this._authService.rolesChecker(data.roles)) return false;
        }

        // 2. Vérification par Permissions spécifiques (ex: calls:call:list)
        if (data.permissions?.length > 0) {
            if (!this._authService.permissionChecker(data.permissions)) return false;
        }

        // 3. Vérification par Modules (ex: calls)
        if (data.modules?.length > 0) {
            if (!this._authService.hasAnyPermissionInModule(data.modules)) return false;
        }

        return true;
    }
}
