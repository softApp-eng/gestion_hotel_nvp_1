import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiHousekeepingService } from '../api.housekeeping.service';
import { User } from '../../../core/user/user.types';
import { UserService } from '../../../core/user/user.service';
import { PermanenceCreateModel } from './permanence-create-model/permanence-create.model';

interface PermanenceItem {
    id: number;
    date: Date;
    agent: { id: any; firstName: string; lastName: string; phone?: string } | null;
}

interface DayColumn {
    date: Date;
    key: string;
    label: string;
    short: string;
    isToday: boolean;
    isWeekend: boolean;
    items: PermanenceItem[];
}

@Component({
    selector: 'permanence-femmes-chambre',
    templateUrl: './permanence-femmes-chambre.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        FormsModule,
        CommonModule,
        NgClass,
    ],
})
export class PermanenceFemmesChambreComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    user: User;

    weekStart: Date = new Date();
    permanences: PermanenceItem[] = [];
    agents: any[] = [];

    selectedAgent = '';
    searchKey = '';

    isLoading = false;

    constructor(
        private _apiHousekeepingService: ApiHousekeepingService,
        private _userService: UserService,
        private _matDialog: MatDialog,
        private _toast: ToastrService
    ) {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });
        this.weekStart = this.startOfWeek(new Date());
    }

    ngOnInit(): void {
        this.loadAgents();
        this.loadPermanences();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // ------------------------------------------------------------------
    //  Dates
    // ------------------------------------------------------------------

    private pad(n: number): string {
        return n < 10 ? '0' + n : '' + n;
    }

    fmtDate(d: Date): string {
        return `${this.pad(d.getDate())}/${this.pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }

    private startOfDay(d: Date): Date {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    }

    private startOfWeek(date: Date): Date {
        const d = this.startOfDay(date);
        const day = d.getDay(); // 0 = dimanche
        const diff = day === 0 ? -6 : 1 - day; // lundi comme premier jour
        d.setDate(d.getDate() + diff);
        return d;
    }

    addDays(d: Date, n: number): Date {
        const x = new Date(d);
        x.setDate(x.getDate() + n);
        return x;
    }

    private parseFrDate(value: any): Date | null {
        if (!value) {
            return null;
        }
        if (value instanceof Date) {
            return value;
        }
        const m = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) {
            return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        }
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }

    // ------------------------------------------------------------------
    //  Navigation semaine
    // ------------------------------------------------------------------

    prevWeek(): void {
        this.setWeek(this.addDays(this.weekStart, -7));
    }

    nextWeek(): void {
        this.setWeek(this.addDays(this.weekStart, 7));
    }

    thisWeek(): void {
        this.setWeek(new Date());
    }

    private setWeek(date: Date): void {
        this.weekStart = this.startOfWeek(date);
        this.loadPermanences();
    }

    get weekLabel(): string {
        return `Semaine du ${this.fmtDate(this.weekStart)} au ${this.fmtDate(this.addDays(this.weekStart, 6))}`;
    }

    // ------------------------------------------------------------------
    //  Chargement
    // ------------------------------------------------------------------

    loadAgents(): void {
        this._apiHousekeepingService.listAllAgent().subscribe({
            next: (data) => {
                this.agents = data || [];
            },
        });
    }

    loadPermanences(): void {
        this.isLoading = true;
        const start = this.fmtDate(this.weekStart);
        const end = this.fmtDate(this.addDays(this.weekStart, 6));
        this._apiHousekeepingService.listPermanences(start, end).subscribe({
            next: (data) => {
                this.permanences = (data || []).map((p) => ({
                    id: p.id,
                    date: this.parseFrDate(p.date) || new Date(),
                    agent: p.agent || null,
                }));
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    // ------------------------------------------------------------------
    //  Vue
    // ------------------------------------------------------------------

    get filteredPermanences(): PermanenceItem[] {
        let data = this.permanences;
        if (this.selectedAgent) {
            data = data.filter((p) => p.agent?.id?.toString() === this.selectedAgent);
        }
        if (this.searchKey) {
            const k = this.searchKey.toLowerCase().trim();
            data = data.filter((p) =>
                `${p.agent?.firstName || ''} ${p.agent?.lastName || ''}`.toLowerCase().includes(k)
            );
        }
        return data;
    }

    get days(): DayColumn[] {
        const today = this.startOfDay(new Date()).getTime();
        return Array.from({ length: 7 }, (_, i) => {
            const date = this.addDays(this.weekStart, i);
            const items = this.filteredPermanences
                .filter((p) => this.startOfDay(p.date).getTime() === date.getTime())
                .sort((a, b) =>
                    `${a.agent?.lastName || ''} ${a.agent?.firstName || ''}`.localeCompare(
                        `${b.agent?.lastName || ''} ${b.agent?.firstName || ''}`
                    )
                );
            return {
                date,
                key: this.fmtDate(date),
                label: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
                short: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                isToday: date.getTime() === today,
                isWeekend: date.getDay() === 0 || date.getDay() === 6,
                items,
            };
        });
    }

    get totalPermanences(): number {
        return this.filteredPermanences.length;
    }

    get agentsOnDuty(): number {
        const set = new Set<string>();
        this.filteredPermanences.forEach((p) => {
            if (p.agent?.id != null) {
                set.add(p.agent.id.toString());
            }
        });
        return set.size;
    }

    agentName(a: any): string {
        return a ? `${a.lastName || ''} ${a.firstName || ''}`.trim() : 'Non assignée';
    }

    isAgentOnDay(agentId: any, day: DayColumn): boolean {
        return day.items.some((i) => i.agent?.id?.toString() === agentId?.toString());
    }

    // ------------------------------------------------------------------
    //  Actions
    // ------------------------------------------------------------------

    addPermanence(day?: DayColumn): void {
        this.openDialog(day ? day.date : this.weekStart, null);
    }

    editPermanence(item: PermanenceItem): void {
        this.openDialog(item.date, item);
    }

    private openDialog(date: Date, permanence: PermanenceItem | null): void {
        const ref = this._matDialog.open(PermanenceCreateModel, {
            width: '520px',
            maxWidth: '95vw',
            autoFocus: false,
            data: {
                agents: this.agents,
                date,
                permanence,
            },
        });

        ref.afterClosed().subscribe((saved) => {
            if (saved) {
                this.loadPermanences();
            }
        });
    }

    removePermanence(item: PermanenceItem): void {
        const label = this.agentName(item.agent);
        if (!confirm(`Supprimer la permanence de ${label} le ${this.fmtDate(item.date)} ?`)) {
            return;
        }
        this._apiHousekeepingService.deletePermanence(item.id).subscribe({
            next: () => {
                this._toast.success('Permanence supprimée');
                this.loadPermanences();
            },
            error: () => this._toast.error('Impossible de supprimer la permanence'),
        });
    }

    // ------------------------------------------------------------------
    //  Impression (planning de la semaine + récapitulatif par agent)
    // ------------------------------------------------------------------

    printPermanence(): void {
        const days = this.days;
        const generated = new Date();
        const userName = this.user?.username || 'Système';

        // --- Planning de la semaine : un jour par ligne ---
        const dayRows = days
            .map((d, i) => {
                const cell = d.items.length
                    ? d.items.map((it) => this.agentName(it.agent)).join(' • ')
                    : '<span class="none">—</span>';
                return `<tr class="${d.isWeekend ? 'weekend' : ''}">
                    <td class="c-day">${d.label}</td>
                    <td class="c-date">${d.short}</td>
                    <td>${cell}</td>
                </tr>`;
            })
            .join('');

        // --- Récapitulatif par femme de chambre ---
        const map = new Map<string, { agent: any; dates: Date[] }>();
        this.filteredPermanences.forEach((p) => {
            const key = p.agent?.id?.toString() ?? '__none__';
            if (!map.has(key)) {
                map.set(key, { agent: p.agent, dates: [] });
            }
            map.get(key)!.dates.push(p.date);
        });
        const groups = Array.from(map.values()).sort((a, b) => {
            if (!a.agent) return 1;
            if (!b.agent) return -1;
            return `${a.agent.lastName} ${a.agent.firstName}`.localeCompare(
                `${b.agent.lastName} ${b.agent.firstName}`,
                undefined,
                { sensitivity: 'base' }
            );
        });

        const agentRows = groups
            .map((g) => {
                const dates = [...g.dates]
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((d) => `${d.toLocaleDateString('fr-FR', { weekday: 'long' })} ${this.fmtDate(d)}`)
                    .join(' • ');
                const count = g.dates.length;
                return `<tr>
                    <td class="c-agent">${this.agentName(g.agent)}</td>
                    <td class="c-count">${count} jour${count > 1 ? 's' : ''}</td>
                    <td>${dates}</td>
                </tr>`;
            })
            .join('');

        const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Permanence Femmes de Chambre — ${this.weekLabel}</title>
<style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 14px; color: #0f172a; }
    .doc-header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #ea580c; padding-bottom:8px; margin-bottom:16px; }
    .doc-header h1 { font-size: 18px; margin: 0; }
    .doc-header .meta { text-align:right; font-size:12px; color:#475569; }
    h2.section { font-size: 13px; margin: 18px 0 6px; background:#fff7ed; color:#9a3412; padding:6px 10px; border-radius:6px; text-transform:uppercase; }
    table { width:100%; border-collapse: collapse; font-size: 11px; }
    th, td { border:1px solid #cbd5e1; padding:5px 8px; text-align:left; vertical-align:middle; }
    th { background:#f8fafc; font-size:10px; text-transform:uppercase; letter-spacing:.4px; color:#475569; }
    tr.weekend td { background:#f8fafc; }
    td.c-day { text-transform:capitalize; font-weight:700; width:120px; }
    td.c-date { width:80px; color:#475569; }
    td.c-agent { font-weight:700; }
    td.c-count { width:90px; color:#9a3412; font-weight:700; }
    .none { color:#94a3b8; }
    .footer { margin-top:14px; font-size:10px; color:#94a3b8; text-align:right; }
    @media print { body { margin: 8mm; } }
</style>
</head>
<body>
    <header class="doc-header">
        <h1>PERMANENCE FEMMES DE CHAMBRE</h1>
        <div class="meta">
            <div><strong>${this.weekLabel}</strong></div>
            <div>Généré le ${this.fmtDate(generated)} à ${generated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} par ${userName}</div>
        </div>
    </header>

    <h2 class="section">Planning de la semaine</h2>
    <table>
        <thead>
            <tr><th>Jour</th><th>Date</th><th>Femme(s) de chambre</th></tr>
        </thead>
        <tbody>${dayRows}</tbody>
    </table>

    <h2 class="section">Récapitulatif par femme de chambre</h2>
    <table>
        <thead>
            <tr><th>Femme de chambre</th><th>Jours</th><th>Détail</th></tr>
        </thead>
        <tbody>${agentRows || '<tr><td colspan="3" class="none">Aucune permanence sur la période</td></tr>'}</tbody>
    </table>

    <div class="footer">CMO Hôtel — Service d'étage — Permanence femmes de chambre</div>
</body>
</html>`;

        const win = window.open('', '_blank', 'width=1200,height=800');
        if (!win) {
            return;
        }
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 400);
    }
}
