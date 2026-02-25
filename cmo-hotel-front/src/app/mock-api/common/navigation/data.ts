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
        icon: 'heroicons_outline:chart-pie',
        children: [
            {
                id: 'dashboards.accueil',
                title: 'Accueil',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/accueil',
            },
        ],
    },
    {
        id: 'reservations',
        title: 'Reservations',
        subtitle: 'Gérer les reservations',
        type: 'group',
        icon: 'heroicons_outline:clipboard-document-check',
        data: {
            modules:[APP_MODULES.RESERVATION]
        },
        children: [
            {
                id: 'reservations.list',
                title: 'Réservations',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/managements/reservations',
                data: {
                    permissions:[APP_PERMISSIONS.RESERVATION_LIST]
                },
            },
            {
                id: 'reservations.sejours',
                title: 'Séjours',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/managements/sejours',
                data: {
                    permissions:[APP_PERMISSIONS.RESERVATION_LIST]
                },
            },{
                id: 'reservations.calender',
                title: 'Occupation',
                type: 'basic',
                icon: 'heroicons_outline:calendar-days',
                link: '/managements/calender',
                data: {
                    permissions:[APP_PERMISSIONS.RESERVATION_LIST]
                },
            },
        ],
    },
    {
        id: 'housekeeping',
        title: 'Gouvernance',
        subtitle: 'Maintenance & Entretien',
        type: 'group',
        icon: 'mat_outline:layers',
        data: {
            modules:[APP_MODULES.HOUSEKEEPING]
        },
        children: [
            {
                id: 'housekeeping.housekeeping',
                title: 'Gouvernance',
                type: 'collapsable',
                icon: 'mat_outline:layers',
                children: [
                    {
                        id: 'housekeeping.housekeeping.rooms',
                        title: 'Statut des Chambres',
                        type: 'basic',
                        link: '/managements/housekeeping/manage',
                    },
                    {   id: 'housekeeping.Housekeeping.anomalies',
                        title: 'Historiques',
                        type: 'basic',
                        link: '/managements/housekeeping/history'
                    },
                    {
                        id: 'housekeeping.housekeeping.agents',
                        title: 'Agents de ménage',
                        type: 'basic',
                        link: '/managements/housekeeping/agents',
                        data: {
                            permissions:[APP_PERMISSIONS.HOUSE_KEEPING_AGENT_LIST]
                        },
                    },


                ],
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
            },{
                id: 'settings.Hébergement',
                title: 'Hébergement',
                type: 'basic',
                icon: 'mat_outline:local_hotel',
                link: '/settings/pavillon',
            },
            {
                id: 'settings.prices',
                title: 'Tarrifs',
                type: 'collapsable',
                icon: 'mat_outline:attach_money',
                children: [
                    {
                        id: 'settings.prices.rooms',
                        title: 'Chambres',
                        type: 'basic',
                        link: '/settings/prices/room/types',
                    },
                ],
            },
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
            },
            {
                id: 'audit.logs',
                title: 'Audit',
                type: 'basic',
                icon: 'mat_outline:history',
                link: '/admin/audit/logs',
            },{
                id: 'settings.plateforme',
                title: 'Paramétres',
                type: 'basic',
                icon: 'mat_outline:settings',
                link: '/admin/configurations/manage',
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
