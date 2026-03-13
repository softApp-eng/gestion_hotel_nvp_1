/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
import { APP_MODULES } from '../../../core/data/app-modules';
import { APP_ROLES } from '../../../core/data/app-roles';
import { APP_PERMISSIONS } from '../../../core/data/app-permissions';
export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Tableaux de bord',
        subtitle: 'Statistiques et État des lieux',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'dashboards.accueil',
                title: 'Vue d\'ensemble',
                type: 'basic',
                icon: 'heroicons_outline:chart-bar',
                link: '/accueil',
            },
        ],
    },
    {
        id: 'reservations',
        title: 'Opérations',
        subtitle: 'Front-desk & Séjours',
        type: 'group',
        icon: 'heroicons_outline:calendar',
        data: { modules: [APP_MODULES.RESERVATION] },
        children: [
            {
                id: 'reservations.list',
                title: 'Réservations',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-list',
                link: '/managements/reservations',
                data: { permissions: [APP_PERMISSIONS.RESERVATION_LIST] },
            },
            {
                id: 'reservations.sejours',
                title: 'Séjours en cours',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/managements/sejours',
                data: { permissions: [APP_PERMISSIONS.RESERVATION_LIST] },
            },
            {
                id: 'reservations.calender',
                title: 'Planning d\'occupation',
                type: 'basic',
                icon: 'heroicons_outline:calendar-days',
                link: '/managements/calender',
                data: { permissions: [APP_PERMISSIONS.RESERVATION_LIST] },
            },
        ],
    },
    {
        id: 'housekeeping',
        title: 'Gouvernance',
        subtitle: 'Hygiène & Maintenance',
        type: 'group',
        icon: 'heroicons_outline:sparkles',
        data: { modules: [APP_MODULES.HOUSEKEEPING] },
        children: [
            {
                id: 'housekeeping.manage',
                title: 'État des Chambres',
                type: 'basic',
                icon: 'heroicons_outline:check-badge',
                link: '/managements/housekeeping/manage',
            },
            {
                id: 'housekeeping.history',
                title: 'Historique d\'entretien',
                type: 'basic',
                icon: 'heroicons_outline:clock',
                link: '/managements/housekeeping/history'
            },
            {
                id: 'housekeeping.agents',
                title: 'Équipe de ménage',
                type: 'basic',
                icon: 'heroicons_outline:identification',
                link: '/managements/housekeeping/agents',
                data: { permissions: [APP_PERMISSIONS.HOUSE_KEEPING_AGENT_LIST] },
            },
        ],
    },
    {
        id: 'prestation',
        title: 'Prestations & Services',
        subtitle: 'Restauration & Extras',
        type: 'group',
        icon: 'mat_outline:fastfood',
        children: [
            {
                id: 'managements.restaurationList',
                title: 'Prestations & Services',
                type: 'basic',
                icon: 'mat_outline:fastfood',
                link: '/managements/restauration',
                data: { permissions: [APP_PERMISSIONS.PRESTATION_FOR_RESIDENTS] },
            },
        ],
    },
    {
        id: 'configuration',
        title: 'Configuration',
        subtitle: 'Référentiels & Tarifs',
        type: 'group',
        icon: 'heroicons_outline:cog-6-tooth',
        //data: { roles: [APP_ROLES.ADMIN] },
        children: [
            {
                id: 'settings.persons',
                title: 'Annuaire Clients',
                type: 'basic',
                icon: 'heroicons_outline:users',
                link: '/settings/guests',
                data: { permissions: [APP_PERMISSIONS.PERSON_LIST] },
            },
            {
                id: 'settings.Hébergement',
                title: 'Parc Hôtelier',
                type: 'basic',
                icon: 'heroicons_outline:building-office',
                link: '/settings/pavillon',
                data: { permissions: [APP_PERMISSIONS.PAVILLON_LIST] },
            },
            {
                id: 'settings.prices',
                title: 'Grilles Tarifaires',
                type: 'collapsable',
                icon: 'heroicons_outline:currency-dollar',
                children: [
                    {
                        id: 'settings.prices.rooms',
                        title: 'Tarifs Chambres',
                        type: 'basic',
                        link: '/settings/prices/room/types',
                        data: { permissions: [APP_PERMISSIONS.ROOM_TYPE_LIST] },
                    },
                    {
                        id: 'settings.prices.meals',
                        title: 'Tarifs Repas',
                        type: 'basic',
                        link: '/settings/prices/meals/types',
                        data: { permissions: [APP_PERMISSIONS.MEAL_TYPES_LIST] },
                    },
                ],
            },
        ],
    },
    {
        id: 'Administration',
        title: 'Système',
        subtitle: 'Sécurité & Contrôle',
        type: 'group',
        icon: 'heroicons_outline:shield-check',
        data: { roles: [APP_ROLES.ADMIN] },
        children: [
            {
                id: 'user.list',
                title: 'Comptes Utilisateurs',
                type: 'basic',
                icon: 'heroicons_outline:user-circle',
                link: '/admin/users',
            },
            {
                id: 'role.list',
                title: 'Rôles & Permissions',
                type: 'basic',
                icon: 'heroicons_outline:key',
                link: '/admin/roles',
            },
            {
                id: 'audit.logs',
                title: 'Journal d\'Audit',
                type: 'basic',
                icon: 'heroicons_outline:eye',
                link: '/admin/audit/logs',
            },
            {
                id: 'settings.plateforme',
                title: 'Paramètres Plateforme',
                type: 'basic',
                icon: 'heroicons_outline:adjustments-vertical',
                link: '/admin/configurations/manage',
            }
        ],
    },
];
export const defaultNavigation2: FuseNavigationItem[] = [
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
        id: 'restauration',
        title: 'Restauration',
        subtitle: 'gestion de restauration',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'managements.restaurationList',
                title: 'Restauration',
                type: 'basic',
                icon: 'mat_outline:fastfood',
                link: '/managements/restauration',
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
                    {
                        id: 'settings.prices.meals',
                        title: 'Repas',
                        type: 'basic',
                        link: '/settings/prices/meals/types',
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
