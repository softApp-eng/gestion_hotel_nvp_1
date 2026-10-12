import {OnDestroy, OnInit, signal, ViewChild, ViewEncapsulation} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { ApiReservationService } from '../../reservation/api.reservation.service';
import { forkJoin, Observable, of, Subject, takeUntil } from 'rxjs';
import { UtilsService } from '../../../core/service/utils.service';
import {ApiRoomService} from "../../pavillon/api.room.service";
import {ApiPavillonService} from "../../pavillon/api.pavillon.service";
import {MatRippleModule} from "@angular/material/core";
import {FuseMediaWatcherService} from "../../../../@fuse/services/media-watcher";
import {MatDrawer, MatSidenavModule} from "@angular/material/sidenav";
import {NgClass} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import { ReservationDetailsModel } from '../../reservation/dialog-reservation-details/reservation.details.model';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
    FuseConfirmationConfig,
    FuseConfirmationService,
} from '../../../../@fuse/services/confirmation';


@Component({
    selector: 'planning-calender',
    templateUrl: './planning.calender.component.html',
    styleUrls: ['./planning.calender.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatTooltipModule,
        MatSidenavModule,
        MatRippleModule,
        MatSelectModule,
        FullCalendarModule,
        MatRippleModule,
        FormsModule,
    ],
})
export class PlanningCalenderComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    calendarOptions = signal<CalendarOptions>({
        plugins: [resourceTimelinePlugin, interactionPlugin],
        initialView: 'resourceTimelineWeek',
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
        locale: 'fr',
        handleWindowResize: true,
        windowResizeDelay: 100,
        resourceAreaWidth: '250px', // Augmenté légèrement pour accueillir l'arborescence
        resourceAreaHeaderContent: 'CMO Hôtel',

        // Ligne rouge verticale indiquant le jour / l'heure courante
        nowIndicator: true,

        // --- ÉDITION (activée uniquement sur le Planning des chambres) ---
        editable: false,
        eventStartEditable: false, // Le déplacement horizontal (dates d'arrivée) n'est pas autorisé
        eventDurationEditable: false, // Redimensionnement de la durée (bord droit) : activé en mode éditable
        eventResourceEditable: false, // Glisser-déposer entre lignes de chambres : activé en mode éditable
        eventDrop: (info: any) => this.onEventDrop(info),
        eventResize: (info: any) => this.onEventResize(info),

        // --- STYLES DYNAMIQUES (couleur par statut / par niveau de ressource) ---
        eventClassNames: (arg: any) => {
            const status =
                arg?.event?.extendedProps?.status?.code ??
                arg?.event?.extendedProps?.status ??
                'PENDING';
            return `cm-ev cm-ev-${String(status).toLowerCase()}`;
        },
        resourceLabelClassNames: (arg: any) =>
            `cm-res cm-res-${arg?.resource?.extendedProps?.level || 'room'}`,
        resourceLaneClassNames: (arg: any) =>
            `cm-lane cm-lane-${arg?.resource?.extendedProps?.level || 'room'}`,

        // --- TRI ET GRANULARITÉ ---
        slotDuration: { days: 1 },
        slotLabelFormat: [
            { weekday: 'long', day: 'numeric', month: 'short' }
        ],
        resourceOrder: 'title', // Trie automatiquement les lignes par leur titre (Nom de chambre)
        // --------------------------

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'resourceTimelineWeek'
        },
        buttonText: {
            today:    "Aujourd'hui",
            week:     "Semaine",
        },

        // TRÈS IMPORTANT : Transformation des données en arbre (Pavillon > Type > Chambre)
        resources: (info, successCallback, failureCallback) => {
            const filteredRooms = this.getFilteredRooms();
            if (filteredRooms && filteredRooms.length > 0) {
                const formattedResources = this.buildHierarchicalResources(filteredRooms);
                successCallback(formattedResources);
            } else {
                successCallback([]);
            }
        },

        events: (info, successCallback, failureCallback) => {
            this.getReservationsByRange('reservations', info.startStr, info.endStr).subscribe({
                next: (data) => {
                    console.log('res',data);
                    this.periodReservations = data;
                    const events = this.filterReservationsLocally();
                    successCallback(events);
                },
                error: (err) => failureCallback(err)
            });
        },
        eventDidMount: (info) => {
            // info.event.title contient déjà la liste des clients ("CNE EL ALAMI • LT BENNANI")
            // On l'affecte à l'attribut 'title' de l'élément HTML pour activer le tooltip natif
            info.el.setAttribute('title', info.event.title);
        },
        eventClick: (info: any) => {
            this.raiseReservationDetailsDialog(info.event.id);
        },
    });

    rooms;
    pavillons;
    selectedRoom: any = '';
    selectedPavillon: any = '';

    // Mode édition (Planning des chambres) : glisser-déposer + redimensionnement persistés
    isEditable = false;
    pageTitle = 'Occupation';
    pageSubtitle =
        "Calendrier interactif des disponibilités et suivi temporel de l'occupation des chambres par pavillon.";
    private readonly moveReason = 'Délogement via le planning des chambres';

    @ViewChild('fullCalendar') fullCalendar: any;

    private periodReservations: any[] = [];
    start;
    end;



    /**
     * Constructor
     */
    constructor(
        private _apiReservationService: ApiReservationService,
        private _apiRoomService: ApiRoomService,
        private _apiPavillonService: ApiPavillonService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
        private _utilsService: UtilsService,
        private _breakpointObserver: BreakpointObserver,
        private _route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toast: ToastrService,
    ) {}

    ngOnInit(): void {
        this.initEditMode();

        this.loadPavillons();

        this._breakpointObserver.observe([Breakpoints.Handset])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(result => {
                const isMobile = result.matches;

                this.calendarOptions.update(options => ({
                    ...options,
                    // Ajustement des largeurs pour le mobile
                    resourceAreaWidth: isMobile ? '120px' : '250px', // Réduit la colonne gauche sur mobile
                    slotMinWidth: isMobile ? 80 : 120, // Force chaque jour à faire au moins 80px (active le scroll horizontal fluide)

                    slotLabelFormat: isMobile ? [
                        { weekday: 'short', day: 'numeric' } // Format court : "lun. 16"
                    ] : [
                        { weekday: 'long', day: 'numeric', month: 'short' } // Format long sur PC
                    ]
                }));

                if (this.fullCalendar && this.fullCalendar.getApi) {
                    this.fullCalendar.getApi().render();
                }
            });
    }

    /**
     * Applique le mode défini par la route : "Planning des chambres" est éditable,
     * "Planning d'occupation" reste en lecture seule.
     */
    private initEditMode(): void {
        const data = this._route?.snapshot?.data || {};
        this.isEditable = !!data['editable'];

        if (data['title']) {
            this.pageTitle = data['title'];
        }
        if (data['subtitle']) {
            this.pageSubtitle = data['subtitle'];
        }

        this.calendarOptions.update((options) => ({
            ...options,
            editable: this.isEditable,
            eventDurationEditable: this.isEditable,
            eventResourceEditable: this.isEditable,
        }));
    }

    buildHierarchicalResources(rooms: any[]): any[] {
        const tree = [];

        // 1. Regrouper par Pavillon
        const pavillonsMap = new Map();

        rooms.forEach(room => {
            const pavillonName = room.pavillon?.name || 'Sans Pavillon';
            const typeName = room.roomType?.type || 'Standard';

            if (!pavillonsMap.has(pavillonName)) {
                pavillonsMap.set(pavillonName, {
                    id: `pav-${room.pavillon?.id || 'unknown'}`,
                    title: pavillonName,
                    extendedProps: { level: 'pavillon' },
                    childrenMap: new Map()
                });
            }

            const pavillonNode = pavillonsMap.get(pavillonName);

            // 2. Regrouper par Type de chambre à l'intérieur du Pavillon
            if (!pavillonNode.childrenMap.has(typeName)) {
                pavillonNode.childrenMap.set(typeName, {
                    id: `type-${room.pavillon?.id}-${room.roomType?.id}`,
                    title: typeName,
                    extendedProps: { level: 'type' },
                    children: []
                });
            }

            const typeNode = pavillonNode.childrenMap.get(typeName);

            // 3. Ajouter la chambre (l'élément final)
            typeNode.children.push({
                id: room.id.toString(),
                title: room.name, // Utilisé par resourceOrder: 'title' pour le tri
                extendedProps: { level: 'room' }
            });
        });

        // 4. Convertir les Maps en Tableaux ordonnés
        // Trier les Pavillons par nom
        const sortedPavillonsNames = Array.from(pavillonsMap.keys()).sort();

        sortedPavillonsNames.forEach(pName => {
            const pavNode = pavillonsMap.get(pName);
            const typesList = [];

            // Trier les Types de chambre par nom
            const sortedTypesNames = Array.from(pavNode.childrenMap.keys()).sort();

            sortedTypesNames.forEach(tName => {
                const tNode = pavNode.childrenMap.get(tName);

                // Trier explicitement les chambres par nom (sécurité en plus de resourceOrder)
                tNode.children.sort((a, b) => a.title.localeCompare(b.title, undefined, {numeric: true, sensitivity: 'base'}));

                typesList.push({
                    id: tNode.id,
                    title: tNode.title,
                    extendedProps: tNode.extendedProps,
                    children: tNode.children
                });
            });

            tree.push({
                id: pavNode.id,
                title: pavNode.title,
                extendedProps: pavNode.extendedProps,
                children: typesList
            });
        });

        return tree;
    }

    filterReservationsLocally(): any[] {
        const calendarEvents = [];

        const filteringActive =
            (this.selectedPavillon !== '' && this.selectedPavillon != null) ||
            (this.selectedRoom !== '' && this.selectedRoom != null);
        const allowedRoomIds = filteringActive
            ? new Set(this.getFilteredRooms().map(r => r.id.toString()))
            : null;

        const filteredReservations = [...this.periodReservations];

        filteredReservations.forEach(res => {
            const uniqueRoomsInRes = new Map();
            res.guests.forEach(g => {
                if (!uniqueRoomsInRes.has(g.room.id)) {
                    uniqueRoomsInRes.set(g.room.id, g.room);
                }
            });

            uniqueRoomsInRes.forEach((room, roomId) => {
                // Ignorer les chambres masquées par le filtre pavillon / n° de chambre
                if (allowedRoomIds && !allowedRoomIds.has(roomId.toString())) {
                    return;
                }

                //if (matchPavillon && matchRoom) {
                    const guestsInThisRoom = res.guests.filter(g => g.room.id === roomId);

                    /*const principal = guestsInThisRoom.find(g => g.role.code === 'PRINCIPAL')
                        || guestsInThisRoom.find(g => g.role.code === 'VICE');

                    let guestDisplay = '';
                    if (principal) {
                        const grade = principal.person.grade ? principal.person.grade.code : '';
                        guestDisplay = `${grade} ${principal.person.lastName}`.trim();
                    } else if (guestsInThisRoom.length > 0) {
                        guestDisplay = guestsInThisRoom[0].person.lastName;
                    }*/

                    guestsInThisRoom.sort((a, b) => {
                        const scoreA = a.role?.code === 'PRINCIPAL' ? 2 : (a.role?.code === 'VICE' ? 1 : 0);
                        const scoreB = b.role?.code === 'PRINCIPAL' ? 2 : (b.role?.code === 'VICE' ? 1 : 0);
                        return scoreB - scoreA; // Ordre décroissant
                    });

                    // 3. Construire la chaîne brute pour chaque client et les combiner
                    const guestsLabels = guestsInThisRoom.map(g => {
                        const grade = g.person?.grade ? g.person.grade.code : '';
                        const lastName = g.person?.lastName || '';
                        const firstName = g.person?.firstName || '';

                        // Ex: "COL KABBAJ Ahmed" ou "CIVIL ALAMI Omar"
                        return `${grade} ${lastName} ${firstName}`.trim();
                    });

                    // 4. Joindre tous les clients par un séparateur lisible
                    // Utilisation du point médian " • " ou d'une virgule ", "
                    const titleDisplay = guestsLabels.join(' • ');

                    //const othersCount = guestsInThisRoom.length - 1;
                    //const suffix = othersCount > 0 ? ` +${othersCount}` : '';

                    calendarEvents.push({
                        id: `${res.code}`,
                        // CRITICAL: Cette propriété associe l'événement à la ligne de la chambre
                        resourceId: roomId.toString(),
                        title: `${titleDisplay}`, // Plus court car le nom de la chambre est déjà sur la ligne
                        start: res.start,
                        end: res.end,
                        backgroundColor: this.getColorByStatus(res.status.code),
                        borderColor: 'transparent',
                        extendedProps: { ...res, currentRoom: room }
                    });
                //}
            });
        });

        return calendarEvents;
    }

    loadPavillons() {
        this._apiPavillonService.all().subscribe({
            next: (data) => {
                this.pavillons = data || [];
                this.selectedPavillon = '';
                this.selectedRoom = '';
                this.loadRooms();
            },
        });
    }

    loadRooms() {
        this._apiRoomService.all().subscribe({
            next: (data) => {
                this.rooms = data; // Stocke les chambres brutes
                //this.selectRoom(null);

                if (this.fullCalendar && this.fullCalendar.getApi) {
                    const api = this.fullCalendar.getApi();
                    api.refetchResources(); // Va appeler buildHierarchicalResources() automatiquement
                    api.refetchEvents();
                }
            },
        });
    }

    /**
     * Chambres correspondant aux filtres courants (pavillon + n° de chambre)
     */
    getFilteredRooms(): any[] {
        let rooms = this.rooms || [];

        if (this.selectedPavillon !== '' && this.selectedPavillon != null) {
            rooms = rooms.filter(
                r => r.pavillon?.id?.toString() === this.selectedPavillon.toString()
            );
        }

        if (this.selectedRoom !== '' && this.selectedRoom != null) {
            rooms = rooms.filter(
                r => r.id?.toString() === this.selectedRoom.toString()
            );
        }

        return rooms;
    }

    /**
     * Chambres affichables dans le sélecteur "N° de chambre" (dépend du pavillon choisi)
     */
    get roomsForSelectedPavillon(): any[] {
        const rooms = this.rooms || [];

        if (this.selectedPavillon === '' || this.selectedPavillon == null) {
            return rooms;
        }

        return rooms.filter(
            r => r.pavillon?.id?.toString() === this.selectedPavillon.toString()
        );
    }

    onPavillonChange(): void {
        // La chambre sélectionnée peut ne pas appartenir au nouveau pavillon
        this.selectedRoom = '';
        this.refreshCalendar();
    }

    onRoomChange(): void {
        this.refreshCalendar();
    }

    refreshCalendar(): void {
        if (this.fullCalendar && this.fullCalendar.getApi) {
            const api = this.fullCalendar.getApi();
            api.refetchResources();
            api.refetchEvents();
        }
    }

    /**
     * Force le rechargement des réservations depuis le serveur (après une mutation).
     */
    private reloadFromServer(): void {
        // Invalide le cache local pour forcer un nouvel appel API
        this.periodReservations = [];
        this.start = undefined;
        this.end = undefined;
        this.refreshCalendar();
    }

    private findReservation(code: any): any {
        return (this.periodReservations || []).find(
            (r) => String(r.code) === String(code)
        );
    }

    private findRoomById(roomId: any): any {
        return (this.rooms || []).find(
            (r) => String(r.id) === String(roomId)
        );
    }

    /**
     * Tarif de la grille tarifaire pour une catégorie de grade donnée.
     * (Même logique que le dialogue de changement de chambre.)
     */
    getAppliedPriceForPerson(room: any, person: any): number {
        if (!room?.roomType?.prices || !person) {
            return 0;
        }

        const categoryCode = person.grade?.category?.code;
        if (!categoryCode) {
            return 0;
        }

        const priceEntry = room.roomType.prices.find(
            (p: any) => p.category?.code === categoryCode
        );

        return priceEntry ? priceEntry.price : 0;
    }

    /**
     * Glisser-déposer d'une réservation vers une autre chambre (délogement).
     */
    onEventDrop(info: any): void {
        if (!this.isEditable) {
            return;
        }

        const oldResourceId = info.oldEvent?.resourceId;
        const newResourceId = info.event?.resourceId;

        // Un déplacement horizontal (changement de dates) n'est pas autorisé ici :
        // on annule et on oriente l'utilisateur vers le redimensionnement.
        const timeChanged =
            (info.oldEvent?.start?.getTime?.() ?? null) !==
                (info.event?.start?.getTime?.() ?? null) ||
            (info.oldEvent?.end?.getTime?.() ?? null) !==
                (info.event?.end?.getTime?.() ?? null);

        if (timeChanged) {
            info.revert();
            this._toast.warning(
                "Pour modifier les dates, redimensionnez le séjour depuis son bord droit."
            );
            return;
        }

        if (String(oldResourceId) === String(newResourceId)) {
            return;
        }

        const code = info.event.id;
        const oldRoom = this.findRoomById(oldResourceId);
        const newRoom = this.findRoomById(newResourceId);

        const config: FuseConfirmationConfig = {
            title: 'Déloger la réservation',
            message:
                `Déplacer la réservation <strong>#${code}</strong> de la chambre ` +
                `<strong>${oldRoom?.name ?? oldResourceId}</strong> vers ` +
                `<strong>${newRoom?.name ?? newResourceId}</strong> ?<br>` +
                `Le tarif appliqué sera recalculé automatiquement depuis la grille tarifaire.`,
            icon: {
                show: true,
                name: 'heroicons_outline:arrows-right-left',
                color: 'primary',
            },
            actions: {
                confirm: { show: true, label: 'Déloger', color: 'primary' },
                cancel: { show: true, label: 'Annuler' },
            },
            dismissible: true,
        };

        this._fuseConfirmationService
            .open(config)
            .afterClosed()
            .subscribe((result) => {
                if (result !== 'confirmed') {
                    info.revert();
                    return;
                }
                this.persistRoomChange(
                    code,
                    oldResourceId,
                    newResourceId,
                    info
                );
            });
    }

    /**
     * Enregistre le changement de chambre pour tous les occupants de la chambre d'origine.
     */
    private persistRoomChange(
        code: any,
        oldResourceId: any,
        newResourceId: any,
        info: any
    ): void {
        const reservation = this.findReservation(code);
        const newRoom = this.findRoomById(newResourceId);

        if (!reservation || !newRoom) {
            info.revert();
            this._toast.error('Réservation ou chambre introuvable');
            return;
        }

        const guests = (reservation.guests || []).filter(
            (g: any) => String(g.room?.id) === String(oldResourceId)
        );

        if (guests.length === 0) {
            info.revert();
            this._toast.error('Aucun occupant à déloger dans cette chambre');
            return;
        }

        const calls = guests.map((guest: any) =>
            this._apiReservationService.switchRoom({
                reservationId: String(guest.id),
                newRoomId: Number(newResourceId),
                reason: this.moveReason,
                appliedPrice: this.getAppliedPriceForPerson(
                    newRoom,
                    guest.person
                ),
            })
        );

        forkJoin(calls).subscribe({
            next: () => {
                this._toast.success('Délogement effectué avec succès');
                this.reloadFromServer();
            },
            error: (err) => {
                info.revert();
                this._toast.error(
                    err?.error?.message || 'Erreur lors du délogement'
                );
                this.reloadFromServer();
            },
        });
    }

    /**
     * Redimensionnement de la durée d'un séjour (prolongation de la date de fin).
     */
    onEventResize(info: any): void {
        if (!this.isEditable) {
            return;
        }

        const code = info.event.id;
        const oldEnd = info.oldEvent?.end;
        const newEnd = info.event?.end;

        if (!newEnd || (oldEnd && oldEnd.getTime() === newEnd.getTime())) {
            return;
        }

        const endLabel = this.formatPrintDay(newEnd);

        const config: FuseConfirmationConfig = {
            title: 'Modifier la durée du séjour',
            message:
                `Prolonger la réservation <strong>#${code}</strong> jusqu'au ` +
                `<strong>${endLabel}</strong> ?`,
            icon: {
                show: true,
                name: 'heroicons_outline:calendar-days',
                color: 'primary',
            },
            actions: {
                confirm: { show: true, label: 'Enregistrer', color: 'primary' },
                cancel: { show: true, label: 'Annuler' },
            },
            dismissible: true,
        };

        this._fuseConfirmationService
            .open(config)
            .afterClosed()
            .subscribe((result) => {
                if (result !== 'confirmed') {
                    info.revert();
                    return;
                }

                this._apiReservationService
                    .extendReservation(
                        code,
                        this._utilsService.convertToDate(newEnd)
                    )
                    .subscribe({
                        next: () => {
                            this._toast.success('Durée du séjour mise à jour');
                            this.reloadFromServer();
                        },
                        error: (err) => {
                            info.revert();
                            this._toast.error(
                                err?.error?.message ||
                                    'Erreur lors de la modification de la durée'
                            );
                        },
                    });
            });
    }

    getReservationsByRange(type, start, end): Observable<any> {
        // Si on a déjà les données pour EXACTEMENT cette période, on renvoie le cache
        if (this.periodReservations.length > 0 && this.start === start && this.end === end) {
            return of(this.periodReservations);
        }

        // Sinon, on met à jour les dates de référence et on appelle l'API
        this.start = start;
        this.end = end;
        const startDate = new Date(start);
        const endDate = new Date(end);

        return this._apiReservationService.getRangReservations(
            type,
            this._utilsService.convertToDate(startDate),
            this._utilsService.convertToDate(endDate)
        );
    }

    getColorByStatus(status: string): string {
        switch (status) {
            case 'CONFIRMED':
                return '#4f46e5';
            case 'PENDING':
                return '#64748b';
            case 'CLOSED':
                return '#10b981';
            default:
                return '#cbd5e1';
        }
    }


    /**
     * Imprime un planning d'occupation (un tableau par pavillon).
     * Respecte les filtres pavillon / n° de chambre actifs.
     */
    printOccupation(): void {
        const api = this.fullCalendar?.getApi ? this.fullCalendar.getApi() : null;
        const view = api?.view;

        const start = view ? new Date(view.activeStart) : this.startOfWeek(new Date());
        const end = view ? new Date(view.activeEnd) : this.addDays(this.startOfWeek(new Date()), 7);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const days: Date[] = [];
        for (let d = new Date(start); d < end; d = this.addDays(d, 1)) {
            days.push(new Date(d));
        }
        if (days.length === 0) {
            return;
        }

        // Chambres filtrées (pavillon + n° de chambre)
        const filteredRooms = this.getFilteredRooms();

        // Regroupement par pavillon
        const groups = new Map<string, { name: string; rooms: any[] }>();
        filteredRooms.forEach((room) => {
            const key = room.pavillon?.id?.toString() ?? 'none';
            const name = room.pavillon?.name ?? 'Sans pavillon';
            if (!groups.has(key)) {
                groups.set(key, { name, rooms: [] });
            }
            groups.get(key).rooms.push(room);
        });

        const sortedGroups = Array.from(groups.entries()).sort((a, b) =>
            a[1].name.localeCompare(b[1].name, undefined, { sensitivity: 'base' })
        );

        if (sortedGroups.length === 0) {
            return;
        }

        const html = this.buildOccupationPrintHtml(sortedGroups, days, start, end);
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

    private buildOccupationPrintHtml(
        groups: Array<[string, { name: string; rooms: any[] }]>,
        days: Date[],
        start: Date,
        end: Date
    ): string {
        const rangeLabel = `${this.formatPrintDay(start)} → ${this.formatPrintDay(this.addDays(end, -1))}`;
        const generated = new Date();
        const docTitle = this.isEditable
            ? 'Planning des chambres'
            : "Planning d'occupation";

        const sections = groups
            .map(([, group]) => {
                const rooms = [...group.rooms].sort((a, b) =>
                    (a.name || '').localeCompare(b.name || '', undefined, {
                        numeric: true,
                        sensitivity: 'base',
                    })
                );

                const head = `<tr><th class="room-col">Chambre</th>${days
                    .map((d) => {
                        const isToday = this.isSameDay(d, new Date());
                        return `<th class="${isToday ? 'today' : ''}">${this.formatPrintDayShort(d)}</th>`;
                    })
                    .join('')}</tr>`;

                const rows = rooms
                    .map((room) => {
                        const cells = days
                            .map((day) => {
                                const occ = this.getRoomDayOccupant(room.id, day);
                                const isToday = this.isSameDay(day, new Date());
                                const cls = occ.text
                                    ? `occ ${this.statusClass(occ.status)}`
                                    : 'free';
                                return `<td class="${cls}${isToday ? ' today' : ''}">${occ.text}</td>`;
                            })
                            .join('');
                        return `<tr><td class="room-col">${room.name}</td>${cells}</tr>`;
                    })
                    .join('');

                return `<section class="pavillon">
                <h2>${group.name}</h2>
                <table><thead>${head}</thead><tbody>${rows}</tbody></table>
            </section>`;
            })
            .join('');

        return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${docTitle} - CMO Hôtel</title>
<style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 16px; color: #0f172a; }
    .doc-header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #4f46e5; padding-bottom:8px; margin-bottom:16px; }
    .doc-header h1 { font-size: 20px; margin: 0; }
    .doc-header .meta { text-align:right; font-size:12px; color:#475569; }
    .pavillon { margin-bottom: 24px; page-break-after: always; }
    .pavillon:last-child { page-break-after: auto; }
    .pavillon h2 { font-size: 16px; margin: 0 0 8px; background:#eef2ff; color:#3730a3; padding:6px 10px; border-radius:6px; }
    table { width:100%; border-collapse: collapse; font-size: 10px; }
    th, td { border:1px solid #cbd5e1; padding:3px 4px; text-align:center; vertical-align:middle; }
    th.room-col, td.room-col { text-align:left; font-weight:700; width:90px; background:#f8fafc; white-space:nowrap; }
    thead th { background:#f1f5f9; }
    th.today, td.today { background:#fef2f2; }
    td.occ { color:#fff; font-weight:600; }
    td.occ.confirmed { background:#4f46e5; }
    td.occ.pending { background:#64748b; }
    td.occ.closed { background:#10b981; }
    td.free { background:#ffffff; }
    .footer { margin-top:12px; font-size:11px; color:#64748b; text-align:right; }
    @media print { body { margin: 8mm; } }
</style>
</head>
<body>
    <header class="doc-header">
        <h1>${docTitle} — CMO Hôtel</h1>
        <div class="meta">
            <div><strong>Période :</strong> ${rangeLabel}</div>
            <div>Généré le ${this.formatPrintDay(generated)} à ${generated.toLocaleTimeString('fr-FR')}</div>
        </div>
    </header>
    ${sections}
    <div class="footer">CMO Hôtel — ${docTitle} par pavillon</div>
</body>
</html>`;
    }

    /**
     * Occupant d'une chambre pour une journée donnée (issue des réservations de la période chargée).
     */
    private getRoomDayOccupant(
        roomId: any,
        dayStart: Date
    ): { text: string; status: string } {
        const roomIdStr = roomId?.toString();

        for (const res of this.periodReservations || []) {
            const resStart = new Date(res.start);
            resStart.setHours(0, 0, 0, 0);
            const resEnd = new Date(res.end);
            resEnd.setHours(0, 0, 0, 0);

            if (dayStart < resStart || dayStart >= resEnd) {
                continue;
            }

            const guests = (res.guests || []).filter(
                (g) => g.room?.id?.toString() === roomIdStr
            );
            if (guests.length === 0) {
                continue;
            }

            guests.sort((a, b) => {
                const sa =
                    a.role?.code === 'PRINCIPAL' ? 2 : a.role?.code === 'VICE' ? 1 : 0;
                const sb =
                    b.role?.code === 'PRINCIPAL' ? 2 : b.role?.code === 'VICE' ? 1 : 0;
                return sb - sa;
            });

            const text = guests
                .map((g) => `${g.person?.grade?.code || ''} ${g.person?.lastName || ''}`.trim())
                .join(' • ');

            return { text, status: res.status?.code || '' };
        }

        return { text: '', status: '' };
    }

    private statusClass(status: string): string {
        switch (status) {
            case 'CONFIRMED':
                return 'confirmed';
            case 'PENDING':
                return 'pending';
            case 'CLOSED':
                return 'closed';
            default:
                return 'pending';
        }
    }

    private isSameDay(a: Date, b: Date): boolean {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }

    private addDays(date: Date, n: number): Date {
        const d = new Date(date);
        d.setDate(d.getDate() + n);
        return d;
    }

    private startOfWeek(date: Date): Date {
        const d = new Date(date);
        const day = (d.getDay() + 6) % 7; // Lundi = 0
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    private formatPrintDay(date: Date): string {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(date);
    }

    private formatPrintDayShort(date: Date): string {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
        }).format(date);
    }

    raiseReservationDetailsDialog(code) {
        this._apiReservationService.getReservation(code).subscribe({
            next: (data) => {
                this._matDialog
                    .open(ReservationDetailsModel, {
                        data: { reservation: data},
                        disableClose: true,
                    })
                    .afterClosed()
                    .subscribe();
            }
        })
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
