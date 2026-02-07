import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { APP_MODULES } from './core/data/app-modules';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: '/home'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'home'},

    // Auth routes for guests
    {
        path: 'auth',
        //canActivate: [NoAuthGuard],
        //canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
        ]
    },

    // Admin routes
    {
        path: 'admin',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        data: {
            //roles:[APP_ROLES.ADMIN],
            //module:[APP_MODULES.USERS]
        },
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {
                path: 'users',
                loadChildren: () => import('app/modules/users/users.routes'),
                data: {
                    module:[APP_MODULES.USERS]
                },
            },
            {
                path: 'roles',
                loadChildren: () => import('app/modules/roles/roles.routes'),
                data: {
                    module:[APP_MODULES.ROLES]
                },
            }
        ]
    },
    {
        path: 'settings',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {
                path: 'guests',
                loadChildren: () => import('app/modules/person/person.routes'),
                data: {
                    module:[APP_MODULES.PERSON]
                },
            }
        ]
    },

    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        //data: {accountType:[AppAccountTypes.ADMINISTRATOR]},
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'accueil', loadChildren: () => import('app/modules/dashboard/dashboard.routes')},
        ]
    },

    //match other urls
    { path: '**', redirectTo: '/accueil' }
];
