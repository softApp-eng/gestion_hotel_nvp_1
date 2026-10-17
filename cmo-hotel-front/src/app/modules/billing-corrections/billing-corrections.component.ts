import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiInvoiceService } from '../invoice/api.invoice.service';
import {
    ConfirmCorrectionDialog,
    NightCorrectionDialog,
    PrestationCorrectionDialog,
} from './billing-corrections.dialog';

/**
 * Corrections facturation (page Administration).
 *
 * Permet, pour une facture donnée, de :
 *  - corriger (prix / observation) ou supprimer une nuitée d'hébergement facturée ;
 *  - corriger (libellé / quantité / prix) ou supprimer une prestation facturée.
 *
 * Les factures déjà réglées (PAID) restent corrigables, mais après confirmation renforcée.
 */
@Component({
    selector: 'billing-corrections',
    templateUrl: './billing-corrections.component.html',
    styleUrls: ['./billing-corrections.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        NgClass,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
    ],
})
export class BillingCorrectionsComponent implements OnInit {
    /** Clé de recherche saisie (nom, n° de séjour, n° facture, ...). */
    key = '';
    isSearching = false;
    invoices: any[] = [];

    /** Facture ouverte pour correction. */
    selectedInvoice: any = null;
    isLoadingInvoice = false;

    /** Identifiant de la ligne en cours de traitement (suppression / enregistrement). */
    processingId: string | null = null;

    constructor(
        private _apiInvoiceService: ApiInvoiceService,
        private _matDialog: MatDialog,
        private _toast: ToastrService
    ) {}

    ngOnInit(): void {}

    /* ---------------------------------------------------------------------- */
    /*                                Recherche                                */
    /* ---------------------------------------------------------------------- */

    search(): void {
        const k = (this.key || '').trim();
        if (!k) {
            this._toast.info('Saisissez une clé de recherche (nom, n° de séjour, n° facture…)');
            return;
        }

        this.isSearching = true;
        this.selectedInvoice = null;
        this._apiInvoiceService
            .search(k, '', [], false, [], [], '', '', '', '', '', '', 0, 20)
            .subscribe({
                next: (res: any) => {
                    this.invoices = res?.content || [];
                    this.isSearching = false;
                    if (this.invoices.length === 0) {
                        this._toast.info('Aucune facture trouvée pour cette clé');
                    }
                },
                error: (err) => {
                    this.isSearching = false;
                    this._toast.error(
                        err?.error?.description || err?.error?.message || 'Erreur lors de la recherche'
                    );
                },
            });
    }

    clear(): void {
        this.key = '';
        this.invoices = [];
        this.selectedInvoice = null;
    }

    /* ---------------------------------------------------------------------- */
    /*                            Ouverture facture                           */
    /* ---------------------------------------------------------------------- */

    openInvoice(row: any): void {
        const code = row?.reservationDetails?.code;
        if (!code) {
            this._toast.error('Réservation introuvable pour cette facture');
            return;
        }

        this.isLoadingInvoice = true;
        this._apiInvoiceService.getInvoiceByReservationCode(code).subscribe({
            next: (invoice: any) => {
                this.selectedInvoice = this.pickInvoice(invoice, row?.num);
                this.isLoadingInvoice = false;
            },
            error: () => {
                this.isLoadingInvoice = false;
                this._toast.error('Impossible de charger le détail de la facture');
            },
        });
    }

    /** L'API peut renvoyer une facture ou une liste : on garde celle attendue. */
    private pickInvoice(invoice: any, num?: string): any {
        if (!invoice) {
            return null;
        }
        if (Array.isArray(invoice)) {
            return invoice.find((i) => i.num === num) || invoice[0];
        }
        return invoice;
    }

    /** Recharge la facture ouverte après une correction. */
    private reloadInvoice(): void {
        const code = this.selectedInvoice?.reservationDetails?.code;
        const num = this.selectedInvoice?.num;
        if (!code) {
            this.processingId = null;
            return;
        }

        this._apiInvoiceService.getInvoiceByReservationCode(code).subscribe({
            next: (invoice: any) => {
                this.selectedInvoice = this.pickInvoice(invoice, num);
                this.syncRow();
                this.processingId = null;
            },
            error: () => {
                this.processingId = null;
            },
        });
    }

    /** Met à jour la ligne de résultat correspondante (totaux / statut). */
    private syncRow(): void {
        const row = this.invoices.find((i) => i.num === this.selectedInvoice?.num);
        if (row && this.selectedInvoice) {
            row.totalRoomPrice = this.selectedInvoice.totalRoomPrice;
            row.totalPrestationPrice = this.selectedInvoice.totalPrestationPrice;
        }
    }

    /** True si la facture affichée est déjà réglée (confirmation renforcée). */
    isPaid(): boolean {
        return this.selectedInvoice?.status === 'PAID';
    }

    /** Nuitées d'hébergement facturées de la facture ouverte. */
    get nights(): any[] {
        return this.selectedInvoice?.validatedNights || [];
    }

    /** Prestations facturées de la facture ouverte. */
    get prestations(): any[] {
        return this.selectedInvoice?.invoicePrestations || [];
    }

    /** Nuitées du séjour toujours non validées (non facturées). */
    get missingNights(): string[] {
        return this.selectedInvoice?.missingNights || [];
    }

    total(invoice: any): number {
        return (
            (invoice?.totalRoomPrice || 0) + (invoice?.totalPrestationPrice || 0)
        );
    }

    /* ---------------------------------------------------------------------- */
    /*                                 Nuitées                                */
    /* ---------------------------------------------------------------------- */

    editNight(night: any): void {
        this._matDialog
            .open(NightCorrectionDialog, {
                data: { night },
                width: '32rem',
                maxWidth: '95vw',
            })
            .afterClosed()
            .subscribe((res) => {
                if (!res) {
                    return;
                }
                this.processingId = night?.id;
                this._apiInvoiceService.updateValidatedNight(night.id, res).subscribe({
                    next: () => {
                        this._toast.success('Nuitée corrigée avec succès');
                        this.reloadInvoice();
                    },
                    error: (err) => {
                        this.processingId = null;
                        this._toast.error(
                            err?.error?.description ||
                                err?.error?.message ||
                                'Erreur lors de la correction de la nuitée'
                        );
                    },
                });
            });
    }

    deleteNight(night: any): void {
        this._matDialog
            .open(ConfirmCorrectionDialog, {
                data: {
                    title: 'Supprimer la nuitée',
                    message:
                        `La nuitée du ${night?.nightDate} (${night?.roomName || 'chambre inconnue'}) ` +
                        `sera retirée de la facture et redeviendra une nuitée non validée ` +
                        `pour cette réservation. Les totaux de la facture seront recalculés.`,
                    forced: this.isPaid(),
                },
                width: '32rem',
                maxWidth: '95vw',
            })
            .afterClosed()
            .subscribe((res) => {
                if (!res?.confirm) {
                    return;
                }
                this.processingId = night?.id;
                this._apiInvoiceService.deleteValidatedNight(night.id).subscribe({
                    next: () => {
                        this._toast.success('Nuitée supprimée avec succès');
                        this.reloadInvoice();
                    },
                    error: (err) => {
                        this.processingId = null;
                        this._toast.error(
                            err?.error?.description ||
                                err?.error?.message ||
                                'Erreur lors de la suppression de la nuitée'
                        );
                    },
                });
            });
    }

    /* ---------------------------------------------------------------------- */
    /*                               Prestations                              */
    /* ---------------------------------------------------------------------- */

    editPrestation(prestation: any): void {
        this._matDialog
            .open(PrestationCorrectionDialog, {
                data: { prestation },
                width: '32rem',
                maxWidth: '95vw',
            })
            .afterClosed()
            .subscribe((res) => {
                if (!res) {
                    return;
                }
                this.processingId = String(prestation?.id);
                this._apiInvoiceService
                    .updateInvoicePrestation(prestation.id, res)
                    .subscribe({
                        next: () => {
                            this._toast.success('Prestation corrigée avec succès');
                            this.reloadInvoice();
                        },
                        error: (err) => {
                            this.processingId = null;
                            this._toast.error(
                                err?.error?.description ||
                                    err?.error?.message ||
                                    'Erreur lors de la correction de la prestation'
                            );
                        },
                    });
            });
    }

    deletePrestation(prestation: any): void {
        this._matDialog
            .open(ConfirmCorrectionDialog, {
                data: {
                    title: 'Supprimer la prestation',
                    message:
                        `La prestation « ${prestation?.name} » sera retirée de la facture ` +
                        `et les totaux seront recalculés.`,
                    forced: this.isPaid(),
                },
                width: '32rem',
                maxWidth: '95vw',
            })
            .afterClosed()
            .subscribe((res) => {
                if (!res?.confirm) {
                    return;
                }
                this.processingId = String(prestation?.id);
                this._apiInvoiceService.deleteInvoicePrestation(prestation.id).subscribe({
                    next: () => {
                        this._toast.success('Prestation supprimée avec succès');
                        this.reloadInvoice();
                    },
                    error: (err) => {
                        this.processingId = null;
                        this._toast.error(
                            err?.error?.description ||
                                err?.error?.message ||
                                'Erreur lors de la suppression de la prestation'
                        );
                    },
                });
            });
    }

    /* ---------------------------------------------------------------------- */
    /*                                Affichage                                */
    /* ---------------------------------------------------------------------- */

    getStatusStyle(status: string): { label: string; class: string; icon: string } {
        switch (status) {
            case 'PAID':
                return {
                    label: 'Payée',
                    class: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
                    icon: 'heroicons_outline:check-circle',
                };
            case 'UNPAID':
                return {
                    label: 'Non payée',
                    class: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
                    icon: 'heroicons_outline:x-circle',
                };
            case 'IN_PROGRESS':
                return {
                    label: 'En cours',
                    class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                    icon: 'heroicons_outline:clock',
                };
            default:
                return {
                    label: status || '—',
                    class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                    icon: 'heroicons_outline:question-mark-circle',
                };
        }
    }

    isProcessing(id: string | number | null | undefined): boolean {
        return id !== null && id !== undefined && this.processingId === String(id);
    }
}
