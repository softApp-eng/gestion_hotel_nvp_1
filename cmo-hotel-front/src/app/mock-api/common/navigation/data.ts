/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
import { APP_MODULES } from '../../../core/data/app-modules';
import { APP_ROLES } from '../../../core/data/app-roles';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Dashboards',
        subtitle: 'Unique dashboard designs',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'dashboards.accueil',
                title: 'Accueil',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/accueil',
            },
        ],
    },
    {
        id: 'paramètres',
        title: 'Paramètres',
        subtitle: 'paramètres de la plateforme',
        type: 'group',
        icon: 'heroicons_outline:home',
        data: {
            roles:[APP_ROLES.ADMIN]
        },
        children: [
            {
                id: 'settings.persons',
                title: 'Clients',
                type: 'basic',
                icon: 'mat_outline:person_search',
                link: '/settings/guests',
            }
        ],
    },
    {
        id: 'Administration',
        title: 'Administration',
        subtitle: 'paramètres de la plateforme',
        type: 'group',
        icon: 'heroicons_outline:home',
        data: {
            roles:[APP_ROLES.ADMIN]
        },
        children: [
            {
                id: 'user.list',
                title: 'Utilisateurs',
                type: 'basic',
                icon: 'heroicons_outline:user',
                link: '/admin/users',
            },{
                id: 'role.list',
                title: 'Roles',
                type: 'basic',
                icon: 'mat_outline:vpn_key',
                link: '/admin/roles',
            }
        ],
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
