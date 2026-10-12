import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToastrService } from 'ngx-toastr';
import { ApiMealTypeService } from '../../prices/meal/type/api.meal-type.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ApiRestaurationService } from '../api.restauration.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'prestation-add',
    templateUrl: './prestation-mono-create.model.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatSelectModule,
        MatButtonToggleModule,
        FormsModule,
    ],
})
export class PrestationMonoCreateModel implements OnInit {
    title = 'Enregistrer une prestation';
    form: UntypedFormGroup;
    pavillon;
    meals: any = [];
    type : 'SERVICE'|'MEAL' = "MEAL";
    prestation: any;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        public matDialogRef: MatDialogRef<PrestationMonoCreateModel>,
        public _apiRestaurationService: ApiRestaurationService,
        private _apiMealServices: ApiMealTypeService,
        private _toast: ToastrService,
        private _authService: AuthService,
        @Inject(MAT_DIALOG_DATA)
        public data: {reservation:any, prestation:any, category?:any, beneficiary?:any, room?:any, code?:any}
    ) {
        this.form = this._formBuilder.group({
            reservation: ['', [Validators.required]],
            name: ['', [Validators.required]],
            quantity: [1, [Validators.required, Validators.min(1)]],
            price: [0],
            observation: [''],
        });
        this.form.patchValue({reservation: data.reservation});
        console.log('--reservation',data.reservation);
        console.log('--prestation',data.prestation);

        //this.pavillon = data.pavillon;
        if (data.prestation){
            this.prestation = data.prestation;
            this.type = data.prestation.type;
            if (this.type == 'SERVICE') {
                this.form.patchValue({
                    name: this.prestation.name,
                    quantity: this.prestation.quantity,
                    price: this.prestation.price,
                    observation: this.prestation.observation
                });
            } else if (this.type == 'MEAL') {
                this.form.patchValue({
                    name: this.prestation.name,
                    quantity: this.prestation.quantity,
                    price: this.prestation.price ?? 0,
                    observation: this.prestation.observation
                });
            }

        }
    }

    ngOnInit(): void {
        this.loadMeals();
    }

    loadMeals() {
        this._apiMealServices.allWithPrices().subscribe({
            next: (res) => {
                console.log('meals', res);
                this.meals = res;
                // Pré-remplir le prix selon la catégorie de la personne (nouvelle prestation repas)
                if (this.type === 'MEAL' && !this.prestation) {
                    this.computeMealPrice();
                }
            },
        });
    }

    /**
     * Prix du repas sélectionné pour la catégorie de grade de la personne.
     * Le champ reste modifiable par l'utilisateur.
     */
    computeMealPrice(mealName?: string) {
        const name = mealName ?? this.form.get('name')?.value;
        const category = this.data?.category;
        // La catégorie de grade est sérialisée en objet { code, name, description }
        const categoryCode = typeof category === 'string' ? category : category?.code;
        if (!name || !categoryCode) return;

        const meal = (this.meals || []).find((m: any) => m.name === name);
        const priceEntry = (meal?.prices || []).find((p: any) => {
            const c = p?.category;
            const code = typeof c === 'string' ? c : c?.code;
            return code === categoryCode;
        });
        if (priceEntry) {
            this.form.patchValue({ price: priceEntry.price }, { emitEvent: false });
        }
    }

    onMealChange(mealName: string) {
        this.computeMealPrice(mealName);
    }

    onTypeChange() {
        if (this.type === 'MEAL') {
            this.computeMealPrice();
        }
    }

    private escapeHtml(value: any): string {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * Génère un ticket thermique (largeur 80 mm) puis lance l'impression.
     */
    printThermalTicket(payload: any): void {
        const now = new Date();
        const qty = Number(payload?.quantity) || 1;
        const unitPrice = Number(payload?.price) || 0;
        const total = qty * unitPrice;

        const person = this.data?.beneficiary;
        const room = this.data?.room;
        const code = this.data?.code ?? this.data?.reservation ?? '';

        const grade = person?.grade?.code || '';
        const beneficiary =
            `${grade} ${person?.firstName || ''} ${person?.lastName || ''}`.trim() ||
            person?.identity ||
            '—';
        const roomLabel = room?.name || room?.code || '—';
        const pavillon = room?.pavillon?.name || '';
        const typeLabel = payload?.type === 'MEAL' ? 'REPAS' : 'SERVICE';
        const user = this._authService?.username || '—';

        const dateStr = new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(now);

        const obs = payload?.observation
            ? `<div class="sep"></div><div>Observation :</div><div class="wrap">${this.escapeHtml(payload.observation)}</div>`
            : '';

        const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Ticket prestation</title>
<style>
    @page { size: 80mm 297mm; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { width: 80mm; padding: 3mm; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .center { text-align: center; }
    .brand { font-size: 17px; font-weight: bold; letter-spacing: 1px; }
    .subtitle { font-size: 11px; }
    .sep { border-top: 1px dashed #000; margin: 5px 0; }
    .row { display: flex; justify-content: space-between; gap: 6px; }
    .row .label { color: #000; }
    .row .value { text-align: right; font-weight: bold; }
    .benef { font-size: 13px; font-weight: bold; }
    .item { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
    .line { display: flex; justify-content: space-between; }
    .total { font-size: 15px; font-weight: bold; }
    .wrap { word-break: break-word; }
    .footer { margin-top: 8px; text-align: center; font-size: 11px; }
</style>
</head>
<body>
    <div class="center brand">CMO HÔTEL</div>
    <div class="center subtitle">Ticket de prestation</div>
    <div class="sep"></div>
    <div class="row"><span class="label">Ticket</span><span class="value">#${this.escapeHtml(code)}</span></div>
    <div class="row"><span class="label">Date</span><span class="value">${dateStr}</span></div>
    <div class="row"><span class="label">Utilisateur</span><span class="value">${this.escapeHtml(user)}</span></div>
    ${pavillon ? `<div class="row"><span class="label">Pavillon</span><span class="value">${this.escapeHtml(pavillon)}</span></div>` : ''}
    <div class="row"><span class="label">Chambre</span><span class="value">${this.escapeHtml(roomLabel)}</span></div>
    <div class="sep"></div>
    <div>Bénéficiaire</div>
    <div class="benef wrap">${this.escapeHtml(beneficiary)}</div>
    <div class="sep"></div>
    <div class="item wrap">${this.escapeHtml(payload?.name)}</div>
    <div class="line"><span>${typeLabel}</span><span>${qty} x ${unitPrice.toFixed(2)} DH</span></div>
    <div class="sep"></div>
    <div class="line total"><span>TOTAL</span><span>${total.toFixed(2)} DH</span></div>
    ${obs}
    <div class="sep"></div>
    <div class="footer">Merci et bonne journée</div>
</body>
</html>`;

        // Impression via iframe (pas de blocage popup, fonctionne après une requête asynchrone).
        // L'iframe est placée hors écran avec une largeur de 80mm pour mesurer la hauteur réelle du ticket.
        const iframe = document.createElement('iframe');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.style.position = 'fixed';
        iframe.style.left = '-10000px';
        iframe.style.top = '0';
        iframe.style.width = '80mm';
        iframe.style.height = '1px';
        iframe.style.border = '0';
        iframe.style.opacity = '0';
        document.body.appendChild(iframe);

        const win = iframe.contentWindow;
        if (!win) {
            document.body.removeChild(iframe);
            return;
        }

        win.document.open();
        win.document.write(html);
        win.document.close();

        setTimeout(() => {
            try {
                this.applyThermalPageSize(win);
            } catch (e) {
                // En cas d'échec de mesure, on garde le format par défaut 80mm
            }
            setTimeout(() => {
                win.focus();
                win.print();
                setTimeout(() => {
                    if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                }, 1500);
            }, 150);
        }, 300);
    }

    /**
     * Fixe dynamiquement la taille de page thermique : largeur 80mm,
     * hauteur = hauteur réelle du contenu (rouleau continu).
     */
    private applyThermalPageSize(win: Window): void {
        const doc = win.document;
        const body = doc.body;
        if (!body) {
            return;
        }

        const heightPx = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            doc.documentElement ? doc.documentElement.scrollHeight : 0
        );
        // 96 px = 1 in = 25.4 mm ; + 4mm de marge de coupe
        const heightMm = Math.ceil((heightPx * 25.4) / 96) + 4;

        let style = doc.getElementById('thermal-page-size') as HTMLStyleElement | null;
        if (!style) {
            style = doc.createElement('style');
            style.id = 'thermal-page-size';
            doc.head.appendChild(style);
        }
        style.textContent = `@page { size: 80mm ${heightMm}mm; margin: 0; }`;
    }

    save() {
        // Do nothing if the form is invalid
        if (this.form.invalid) {
            return;
        }

        // Disable the form
        this.form.disable();
        let payload = {};
        if(this.type === 'MEAL') {
            payload = {
                reservation: this.data.reservation,
                name: this.form.value.name,
                quantity: this.form.value.quantity,
                type: 'MEAL',
                price: this.form.value.price,
                observation: this.form.value.observation
            }
        } else if (this.type === 'SERVICE') {
            payload = {
                reservation: this.data.reservation,
                name: this.form.value.name,
                quantity: this.form.value.quantity,
                type: 'SERVICE',
                price: this.form.value.price,
                observation: this.form.value.observation
            }
        }

        const resuest = this.prestation ?
            this._apiRestaurationService.updatePrestation(this.prestation.prestationId, payload):
            this._apiRestaurationService.createPrestationForPerson(payload);

        resuest.pipe(
                finalize(() => {
                    // Show the alert
                    this.form.enable();
                    window.scroll({
                        top: 0,
                        left: 0,
                        behavior: 'smooth',
                    });
                })
            )
            .subscribe({
                next: (value) => {
                    this._toast.success('Prestation enregistrée');
                    // Ticket thermique : uniquement à l'ajout d'une nouvelle prestation
                    if (!this.prestation) {
                        this.printThermalTicket(payload);
                    }
                    this.matDialogRef.close({
                        reload: true,
                        update: !!this.prestation,
                        data: this.prestation ?{...payload,prestationId:this.prestation.prestationId}:null
                    });
                },
                error: (err) => {
                    this._toast.error(err?.error?.description || 'Problème de creation');
                },
            });
    }
}
