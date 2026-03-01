import { FuseConfirmationConfig } from '../../../@fuse/services/confirmation';

export const DIALOG_CONFIGS: FuseConfirmationConfig = {
    title: '',
    message: '',
    icon: {
        show: true,
        name: 'heroicons_outline:exclamation-triangle',
        color: 'warn',
    },
    actions: {
        confirm: {
            show: true,
            label: 'Confirmer',
            color: 'warn',
        },
        cancel: {
            show: true,
            label: 'Annuler',
        },
    },
    dismissible: true,
};
