import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DatePipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { ApiReservationService } from '../reservation/api.reservation.service';
import { UtilsService } from '../../core/service/utils.service';

/**
 * Taux d'occupation : page dédiée (extraite de la Main courante).
 * Affiche, par pavillon et par type de chambre, le nombre de chambres,
 * la répartition ESP / PEC, les occupants, les chambres libres et le taux.
 */
@Component({
    selector: 'occupation-rate',
    templateUrl: './occupation-rate.component.html',
    styleUrls: ['./occupation-rate.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatDatepickerModule,
        MatNativeDateModule,
        DecimalPipe,
        DatePipe,
        NgForOf,
        NgIf,
    ],
})
export class OccupationRateComponent implements OnInit {
    occupations: any[] = [];
    isLoading = false;
    today = new Date();

    /** Date dont on affiche le taux d'occupation (par défaut : aujourd'hui). */
    selectedDate: Date = new Date();

    constructor(
        private _apiReservationService: ApiReservationService,
        private _utils: UtilsService
    ) {}

    ngOnInit(): void {
        this.getOccupation();
    }

    getOccupation(): void {
        this.isLoading = true;
        const day = this._utils.convertToDate(this.selectedDate);
        this._apiReservationService
            .getMainCouranteOccupation(day)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (value: any) => {
                    this.occupations = value || [];
                },
            });
    }

    /** Applique le filtre date choisi et recharge le taux d'occupation. */
    onDateChange(newDate: Date): void {
        if (!newDate) {
            return;
        }
        this.selectedDate = newDate;
        this.getOccupation();
    }

    /** Imprime le rapport de taux d'occupation de la date affichée. */
    printReport(): void {
        const area = document.getElementById('occupation-print-area');
        if (!area) {
            return;
        }

        const win = window.open('', '_blank', 'width=1200,height=800');
        if (!win) {
            return;
        }

        // On n'embarque AUCUNE feuille de style de la page (évite la confusion CSS
        // liée à Tailwind/Material) : seul le bloc <style> ci-dessous est appliqué.
        const day = new DatePipe('fr-FR').transform(this.selectedDate, 'dd/MM/yyyy');
        const printDate = new DatePipe('fr-FR').transform(new Date(), 'dd/MM/yyyy HH:mm');

        win.document.open();
        win.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Taux d'occupation — ${day}</title>
<style>
    @page { size: A4 landscape; margin: 10mm; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    html, body { background: #ffffff !important; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 1.3; color: #000000; padding: 8px; }
    .print-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1.5px solid #1e3a8a; }
    .print-header .title { font-size: 16px; font-weight: bold; color: #1e3a8a; }
    .print-header .date-info { font-size: 10px; color: #111827; text-align: right; }
    #occupation-print-area { padding: 0; }
    #occupation-print-area .mb-10 { page-break-inside: avoid; margin-bottom: 12px; padding: 8px; }
    #occupation-print-area .bg-white { background: #ffffff !important; box-shadow: none !important; border: none !important; }
    #occupation-print-area .rounded-lg { border-radius: 0 !important; }
    #occupation-print-area .overflow-x-auto { overflow: visible !important; }
    #occupation-print-area .min-w-full { min-width: 100% !important; }
    table { border-collapse: collapse !important; width: 100%; font-size: 9px; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th, td { border: 1px solid #9ca3af !important; padding: 2px 3px !important; font-size: 9px; }
    thead th { background-color: #e5e7eb !important; font-weight: bold; }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .font-medium { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .w-48 { width: 12rem; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .border-b { border-bottom: 1px solid #9ca3af !important; }
    .border-r { border-right: 1px solid #9ca3af !important; }
    .p-0 { padding: 0 !important; }
    .p-1 { padding: 2px !important; }
    .p-2 { padding: 2px 3px !important; }
    .p-4 { padding: 8px !important; }
    .mb-4 { margin-bottom: 6px; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .bg-blue-50 { background-color: #eff6ff !important; }
    .bg-green-50 { background-color: #ecfdf5 !important; }
    .bg-orange-50 { background-color: #fff7ed !important; }
    .bg-gray-50 { background-color: #f9fafb !important; }
    .text-blue-700 { color: #1d4ed8 !important; }
    .text-blue-800 { color: #1e40af !important; }
    .text-blue-900 { color: #1e3a8a !important; }
    .text-green-700 { color: #047857 !important; }
    .text-orange-700 { color: #c2410c !important; }
    .text-red-600 { color: #dc2626 !important; }
    .border-blue-100 { border-color: #bfdbfe !important; }
    .pavillon-title { font-size: 12px !important; font-weight: bold !important; color: #1e3a8a !important; margin-bottom: 6px !important; padding-bottom: 2px !important; border-bottom: 1px solid #bfdbfe !important; }
    .text-xl { font-size: 12px !important; }
    .text-md { font-size: 9px !important; }
    .text-[10px] { font-size: 8px !important; }
</style>
</head>
<body>
<div class="print-header">
    <div class="title">Taux d'occupation</div>
    <div class="date-info">
        Date du rapport : ${day}<br>
        Imprimé le : ${printDate}
    </div>
</div>
<div id="occupation-print-area">${area.innerHTML}</div>
</body>
</html>`);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
        }, 400);
    }

    // Calculer le total Espèces (Direct Pay) pour un pavillon
    getTotalDirect(pavillon: any): number {
        return pavillon.roomTypeStats.reduce(
            (acc, curr) => acc + curr.occupantsDirectPay,
            0
        );
    }

    // Calculer le total Prise en Charge pour un pavillon
    getTotalPEC(pavillon: any): number {
        return pavillon.roomTypeStats.reduce(
            (acc, curr) => acc + curr.occupantsPriseEnCharge,
            0
        );
    }

    // Pourcentage par type de chambre
    getPercent(val: number, type: any): string {
        const total = type.occupantsDirectPay + type.occupantsPriseEnCharge;
        return total > 0 ? ((val / total) * 100).toFixed(1) : '0';
    }

    // Pourcentage global par pavillon
    getGlobalPercent(pavillon: any, mode: 'ESP' | 'PEC'): string {
        const totalDirect = this.getTotalDirect(pavillon);
        const totalPEC = this.getTotalPEC(pavillon);
        const total = totalDirect + totalPEC;

        if (total === 0) return '0';
        return mode === 'ESP'
            ? ((totalDirect / total) * 100).toFixed(1)
            : ((totalPEC / total) * 100).toFixed(1);
    }
}
