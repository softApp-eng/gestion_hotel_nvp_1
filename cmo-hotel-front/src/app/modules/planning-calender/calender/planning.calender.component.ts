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
import { forkJoin, Observable, of, Subject, takeUntil, concat } from 'rxjs';
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
        resourceAreaWidth: '200px', // Colonne des chambres (type de chambre à gauche)
        resourceAreaHeaderContent: 'Type Chambre',

        // Ligne rouge verticale indiquant le jour / l'heure courante
        nowIndicator: true,

        // --- ÉDITION (activée uniquement sur le Planning des chambres) ---
        editable: false,
        eventStartEditable: false, // Glisser horizontal (dates du séjour) : activé en mode éditable
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
        resourceLabelClassNames: (arg: any) => {
            const level = arg?.resource?.extendedProps?.level || 'room';
            const blocked =
                arg?.resource?.extendedProps?.available === false
                    ? ' room-blocked'
                    : '';
            return `cm-res cm-res-${level}${blocked}`;
        },
        resourceLaneClassNames: (arg: any) =>
            `cm-lane cm-lane-${arg?.resource?.extendedProps?.level || 'room'}`,

        // --- TRI ET GRANULARITÉ ---
        slotDuration: { days: 1 },
        slotLabelFormat: [
            { weekday: 'long', day: 'numeric', month: 'short' }
        ],
        // Rendu selon l'échelle choisie (Jour / Semaine / Mois)
        views: {
            resourceTimelineDay: {
                slotDuration: { hours: 1 },
                slotLabelFormat: [{ hour: '2-digit', minute: '2-digit' }],
                slotMinWidth: 55,
            },
            resourceTimelineMonth: {
                slotDuration: { days: 1 },
                slotMinWidth: 38,
                slotLabelFormat: [
                    { weekday: 'narrow' },
                    { day: 'numeric' },
                ],
            },
        },
        // L'ordre des lignes est défini explicitement via `extendedProps.order`
        // (types de chambre de Chellah en premier). FullCalendar trie par défaut
        // sur `id,title`, donc on le remplace par notre champ `order`.
        resourceOrder: 'order,title',
        // --------------------------

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth'
        },
        buttonText: {
            today:    "Aujourd'hui",
            day:      'Jour',
            week:     'Semaine',
            month:    'Mois',
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
            // Mémorise la période affichée pour positionner les barres « BLOQUÉ »
            this.currentViewStart = new Date(info.startStr);
            this.currentViewEnd = new Date(info.endStr);
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
            // Les barres « BLOQUÉ » (chambres hors service) ne sont pas des réservations
            if (info?.event?.extendedProps?.blocked) {
                return;
            }
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
    private currentViewStart: Date | null = null;
    private currentViewEnd: Date | null = null;
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
                    resourceAreaWidth: isMobile ? '140px' : '174px', // Colonne « Type Chambre » (comme la référence)
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

        // Échelles Jour / Semaine / Mois : uniquement sur le « Planning des
        // chambres ». Le « Planning d'occupation » conserve son échelle
        // d'origine (semaine).
        const editableToolbar: Partial<CalendarOptions> = {
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth',
            },
            buttonText: {
                today: "Aujourd'hui",
                day: 'Jour',
                week: 'Semaine',
                month: 'Mois',
            },
            // Rendu spécifique selon l'échelle choisie (jour / semaine / mois)
            views: {
                resourceTimelineDay: {
                    slotDuration: { hours: 1 },
                    slotLabelFormat: [{ hour: '2-digit', minute: '2-digit' }],
                    slotMinWidth: 55,
                },
                resourceTimelineMonth: {
                    slotDuration: { days: 1 },
                    slotMinWidth: 38,
                    slotLabelFormat: [
                        { weekday: 'narrow' },
                        { day: 'numeric' },
                    ],
                },
            },
        };

        this.calendarOptions.update((options) => ({
            ...options,
            editable: this.isEditable,
            eventStartEditable: this.isEditable, // Glisser horizontal : décalage des dates du séjour
            eventDurationEditable: this.isEditable,
            eventResourceEditable: this.isEditable,
            ...(this.isEditable ? editableToolbar : {}),
        }));
    }

    /** Vrai si le pavillon correspond à « Chellah ». */
    private isChellahPavillon(pavillon: any): boolean {
        return (pavillon?.name || '').toLowerCase().includes('chellah');
    }

    buildHierarchicalResources(rooms: any[]): any[] {
        const tree = [];

        // Regroupement par TYPE DE CHAMBRE. Les types (et chambres) du pavillon
        // « Chellah » sont placés en premier.
        const typesMap = new Map<
            string,
            {
                id: string;
                title: string;
                extendedProps: any;
                children: any[];
                hasChellah: boolean;
            }
        >();

        rooms.forEach((room) => {
            const typeName = room.roomType?.type || 'Standard';
            const isChellah = this.isChellahPavillon(room.pavillon);

            if (!typesMap.has(typeName)) {
                typesMap.set(typeName, {
                    id: `type-${room.roomType?.id || 'unknown'}`,
                    title: typeName,
                    extendedProps: { level: 'type' },
                    children: [],
                    hasChellah: false,
                });
            }

            const node = typesMap.get(typeName);
            node.hasChellah = node.hasChellah || isChellah;

            // Chambre (élément final de l'arborescence)
            node.children.push({
                id: room.id.toString(),
                title: room.name,
                extendedProps: {
                    level: 'room',
                    available: room.available,
                    pavillon: room.pavillon?.name,
                    chellah: isChellah,
                },
            });
        });

        // Tri des types : ceux de Chellah d'abord, puis ordre alphabétique
        const sortedTypes = Array.from(typesMap.values()).sort((a, b) => {
            if (a.hasChellah !== b.hasChellah) {
                return a.hasChellah ? -1 : 1;
            }
            return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        });

        sortedTypes.forEach((node, typeIndex) => {
            // Chambres de Chellah d'abord, puis tri naturel (numérique) par nom
            node.children.sort((a, b) => {
                const ac = !!a.extendedProps?.chellah;
                const bc = !!b.extendedProps?.chellah;
                if (ac !== bc) {
                    return ac ? -1 : 1;
                }
                return a.title.localeCompare(b.title, undefined, {
                    numeric: true,
                    sensitivity: 'base',
                });
            });

            // `order` est lu par `resourceOrder` de FullCalendar (tri explicite).
            node.children.forEach((child, roomIndex) => {
                child.extendedProps = { ...child.extendedProps, order: roomIndex };
            });

            tree.push({
                id: node.id,
                title: node.title,
                extendedProps: { ...node.extendedProps, order: typeIndex },
                children: node.children,
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
                        // La couleur est pilotée par les classes CSS `cm-ev-<statut>`
                        // (voir le thème « planning-room » dans le SCSS).
                        extendedProps: { ...res, currentRoom: room }
                    });
                //}
            });
        });

        // Chambres bloquées / hors service : barre ROUGE sur toute la période affichée
        const blockedRooms = this.getFilteredRooms().filter(
            (r) => r.available === false
        );
        if (blockedRooms.length > 0) {
            const now = new Date();
            const viewStart = this.currentViewStart ?? now;
            const viewEnd = this.currentViewEnd ?? this.addDays(now, 1);

            blockedRooms.forEach((room) => {
                calendarEvents.push({
                    id: `blocked-${room.id}`,
                    resourceId: room.id.toString(),
                    title: 'BLOQUÉ',
                    start: viewStart,
                    end: viewEnd,
                    // Une chambre bloquée n'est ni déplaçable ni redimensionnable
                    startEditable: false,
                    durationEditable: false,
                    resourceEditable: false,
                    classNames: ['cm-blocked'],
                    extendedProps: {
                        blocked: true,
                        status: { code: 'BLOCKED' },
                    },
                });
            });
        }

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
     * Glisser-déposer d'une réservation : déplacement vertical (changement de chambre)
     * et/ou horizontal (décalage des dates du séjour).
     */
    onEventDrop(info: any): void {
        if (!this.isEditable) {
            info.revert();
            return;
        }

        const code = info.event.id;
        const oldResourceId = info.oldEvent?.resourceId;
        const newResourceId = info.event?.resourceId;

        const oldStart = info.oldEvent?.start;
        const newStart = info.event?.start;
        const oldEnd = info.oldEvent?.end;
        const newEnd = info.event?.end;

        const datesChanged =
            (oldStart?.getTime?.() ?? null) !== (newStart?.getTime?.() ?? null) ||
            (oldEnd?.getTime?.() ?? null) !== (newEnd?.getTime?.() ?? null);

        const roomChanged = String(oldResourceId) !== String(newResourceId);

        if (!datesChanged && !roomChanged) {
            info.revert();
            return;
        }

        const oldRoom = this.findRoomById(oldResourceId);
        const newRoom = this.findRoomById(newResourceId);

        let summary = '';
        if (roomChanged) {
            summary +=
                `<br>Chambre : <strong>${oldRoom?.name ?? oldResourceId}</strong> → ` +
                `<strong>${newRoom?.name ?? newResourceId}</strong>`;
        }
        if (datesChanged) {
            const oldRange =
                oldStart && oldEnd
                    ? `${this.formatPrintDay(oldStart)} → ${this.formatPrintDay(oldEnd)}`
                    : '—';
            const newRange =
                newStart && newEnd
                    ? `${this.formatPrintDay(newStart)} → ${this.formatPrintDay(newEnd)}`
                    : '—';
            summary += `<br>Dates : <strong>${oldRange}</strong> devient <strong>${newRange}</strong>`;
        }

        const config: FuseConfirmationConfig = {
            title: 'Déplacer la réservation',
            message:
                `Déplacer la réservation <strong>#${code}</strong> ?${summary}` +
                (roomChanged
                    ? `<br>Le tarif appliqué sera recalculé automatiquement depuis la grille tarifaire.`
                    : ''),
            icon: {
                show: true,
                name: 'heroicons_outline:arrows-right-left',
                color: 'primary',
            },
            actions: {
                confirm: { show: true, label: 'Déplacer', color: 'primary' },
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
                this.persistDrop(
                    code,
                    oldResourceId,
                    newResourceId,
                    info,
                    datesChanged,
                    roomChanged
                );
            });
    }

    /**
     * Enregistre le déplacement : changement de chambre (tous les occupants de la
     * chambre d'origine) et/ou décalage des dates du séjour.
     */
    private persistDrop(
        code: any,
        oldResourceId: any,
        newResourceId: any,
        info: any,
        datesChanged: boolean,
        roomChanged: boolean
    ): void {
        let roomCall$: Observable<any> = of(null);

        if (roomChanged) {
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

            roomCall$ = forkJoin(
                guests.map((guest: any) =>
                    this._apiReservationService.switchRoom({
                        reservationId: String(guest.id),
                        newRoomId: Number(newResourceId),
                        reason: this.moveReason,
                        appliedPrice: this.getAppliedPriceForPerson(
                            newRoom,
                            guest.person
                        ),
                    })
                )
            );
        }

        const dateCall$: Observable<any> =
            datesChanged && info.event?.start && info.event?.end
                ? this._apiReservationService.shiftReservation(
                      code,
                      this._utilsService.convertToDate(info.event.start),
                      this._utilsService.convertToDate(info.event.end)
                  )
                : of(null);

        // Séquentiel : on déplace d'abord la chambre, puis on décale les dates
        // (la vérification de disponibilité côté serveur tiendra compte de la nouvelle chambre).
        concat(roomCall$, dateCall$).subscribe({
            next: () => {
                this._toast.success('Réservation déplacée avec succès');
                this.reloadFromServer();
            },
            error: (err) => {
                info.revert();
                this._toast.error(
                    err?.error?.message ||
                        'Erreur lors du déplacement de la réservation'
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
            case 'BLOCKED':
            case 'BLOQUE':
                return '#dc2626';
            default:
                return '#cbd5e1';
        }
    }


    /**
     * Imprime le planning d'occupation « par semaine » (grille avec une
     * colonne par jour de la période affichée).
     * Respecte les filtres pavillon / n° de chambre actifs.
     */
    printOccupation(): void {
        this.printOccupationByWeek();
    }

    /**
     * Impression « par semaine » : grille chambres × jours (une colonne
     * par jour de la période affichée dans le calendrier).
     */
    printOccupationByWeek(): void {
        this.printWeeklyGrid();
    }

    /**
     * Impression « par jour » : feuille journalière avec une colonne par
     * chambre, groupée par pavillon puis par étage.
     */
    printOccupationByDay(): void {
        this.printDailySheet();
    }

    /** Ouvre une fenêtre et lance l'impression du document HTML fourni. */
    private openPrintWindow(html: string): void {
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

    /**
     * Chambres filtrées (pavillon + n° de chambre) regroupées par PAVILLON
     * puis par TYPE DE CHAMBRE. Structure réutilisée par les impressions
     * semaine et jour.
     */
    private buildRoomGroups(): Map<
        string,
        {
            name: string;
            types: Map<string, { name: string; rooms: any[] }>;
        }
    > {
        const groups = new Map<
            string,
            {
                name: string;
                types: Map<string, { name: string; rooms: any[] }>;
            }
        >();

        this.getFilteredRooms().forEach((room) => {
            const pavKey = room.pavillon?.id?.toString() ?? 'none';
            const pavName = room.pavillon?.name ?? 'Sans pavillon';
            const typeKey = room.roomType?.id?.toString() ?? 'none';
            const typeName = room.roomType?.type ?? 'Sans type de chambre';

            if (!groups.has(pavKey)) {
                groups.set(pavKey, { name: pavName, types: new Map() });
            }

            const pav = groups.get(pavKey);
            if (!pav.types.has(typeKey)) {
                pav.types.set(typeKey, { name: typeName, rooms: [] });
            }
            pav.types.get(typeKey).rooms.push(room);
        });

        return groups;
    }

    /** Impression « par semaine » : une colonne par jour affiché. */
    private printWeeklyGrid(): void {
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

        const groups = this.buildRoomGroups();
        if (groups.size === 0) {
            return;
        }

        this.openPrintWindow(
            this.buildOccupationPrintHtml(groups, days, start, end)
        );
    }

    /** Impression « par jour » : feuille journalière groupée par étage. */
    private printDailySheet(): void {
        const api = this.fullCalendar?.getApi ? this.fullCalendar.getApi() : null;
        const view = api?.view;

        // Jour imprimé : le jour affiché si la vue est quotidienne, sinon aujourd'hui.
        let day: Date = new Date();
        if (view && view.type === 'resourceTimelineDay') {
            day = new Date(view.currentStart);
        }
        day.setHours(0, 0, 0, 0);

        const groups = this.buildRoomGroups();
        if (groups.size === 0) {
            return;
        }

        this.openPrintWindow(this.buildDailyPrintHtml(groups, day));
    }

    private buildOccupationPrintHtml(
        groups: Map<
            string,
            {
                name: string;
                types: Map<string, { name: string; rooms: any[] }>;
            }
        >,
        days: Date[],
        start: Date,
        end: Date
    ): string {
        const rangeLabel = `${this.formatPrintDay(start)} → ${this.formatPrintDay(this.addDays(end, -1))}`;
        const generated = new Date();
        const docTitle = this.isEditable
            ? 'Planning des chambres'
            : "Planning d'occupation";

        const dayDowFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
        const dayShortFormatter = new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
        });

        // En-tête des jours (jour abrégé sur 2 lignes + date)
        const head = `<tr><th class="room-col">Chambre</th>${days
            .map((d) => {
                const isToday = this.isSameDay(d, new Date());
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const cls = [isToday ? 'today' : '', isWeekend ? 'weekend' : '']
                    .filter(Boolean)
                    .join(' ');
                return `<th class="${cls}"><span class="dow">${dayDowFormatter.format(
                    d
                )}</span><span class="dnum">${dayShortFormatter.format(d)}</span></th>`;
            })
            .join('')}</tr>`;

        // Un seul tableau : regroupé par PAVILLON, puis par TYPE DE CHAMBRE.
        // Le pavillon « Chellah » est affiché en premier.
        const sortedPavillons = Array.from(groups.entries()).sort((a, b) => {
            const ac = this.isChellahPavillon({ name: a[1].name });
            const bc = this.isChellahPavillon({ name: b[1].name });
            if (ac !== bc) {
                return ac ? -1 : 1;
            }
            return a[1].name.localeCompare(b[1].name, undefined, { sensitivity: 'base' });
        });

        let body = '';
        sortedPavillons.forEach(([, pav]) => {
            const pavRoomCount = Array.from(pav.types.values()).reduce(
                (acc, t) => acc + t.rooms.length,
                0
            );

            body += `<tr class="group-row pavillon-row"><td colspan="${
                days.length + 1
            }">Pavillon : ${pav.name} <span class="rooms-count">(${pavRoomCount} chambre${
                pavRoomCount > 1 ? 's' : ''
            })</span></td></tr>`;

            const sortedTypes = Array.from(pav.types.entries()).sort((a, b) =>
                a[1].name.localeCompare(b[1].name, undefined, { sensitivity: 'base' })
            );

            sortedTypes.forEach(([, type]) => {
                const rooms = [...type.rooms].sort((a, b) =>
                    (a.name || '').localeCompare(b.name || '', undefined, {
                        numeric: true,
                        sensitivity: 'base',
                    })
                );

                body += `<tr class="group-row type-row"><td colspan="${
                    days.length + 1
                }">Type de chambre : ${type.name} <span class="rooms-count">(${rooms.length} chambre${
                    rooms.length > 1 ? 's' : ''
                })</span></td></tr>`;

                rooms.forEach((room) => {
                    // Chambre bloquée / hors service : signalée en rouge
                    if (room.available === false) {
                        body += `<tr><td class="room-col">${room.name}</td><td class="cell blocked" colspan="${days.length}"><span class="badge badge-blocked">B</span>BLOQUÉ — chambre hors service</td></tr>`;
                        return;
                    }

                    const cells = days
                        .map((day) => {
                            const occ = this.getRoomDayOccupant(room.id, day);
                            const isToday = this.isSameDay(day, new Date());
                            if (!occ.text) {
                                return `<td class="cell free${
                                    isToday ? ' today' : ''
                                }"></td>`;
                            }
                            const marker = this.statusMarker(occ.status);
                            return `<td class="cell occ ${this.statusClass(
                                occ.status
                            )}${isToday ? ' today' : ''}"><span class="badge">${marker}</span><span class="guest">${occ.text}</span></td>`;
                        })
                        .join('');
                    body += `<tr><td class="room-col">${room.name}</td>${cells}</tr>`;
                });
            });
        });

        const table = `<table><thead>${head}</thead><tbody>${body}</tbody></table>`;

        return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${docTitle} (par semaine) - CMO Hôtel</title>
<style>
    /* Design pensé pour l'impression en NOIR & BLANC : texte noir, bordures
       noires, statuts distingués par badge + nuances de gris. Aucune info ne
       dépend d'une couleur vive, donc lisible même sans fond imprimé. */
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #000;
        background: #fff;
        margin: 10mm;
        font-size: 11px;
    }

    /* ---------- En-tête ---------- */
    .doc-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 16px;
        border-bottom: 2px solid #000;
        padding-bottom: 8px;
        margin-bottom: 12px;
    }
    .doc-header h1 { font-size: 18px; margin: 0; letter-spacing: .2px; }
    .doc-header .meta { text-align: right; font-size: 11px; line-height: 1.5; }
    .doc-header .meta strong { font-weight: 700; }

    /* ---------- Légende ---------- */
    .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
        margin: 0 0 14px;
        font-size: 11px;
    }
    .legend .item { display: inline-flex; align-items: center; gap: 6px; }
    .legend .badge {
        display: inline-block;
        min-width: 14px;
        padding: 0 3px;
        border: 1px solid #000;
        font-size: 9px;
        font-weight: 700;
        line-height: 13px;
        text-align: center;
    }
    .legend .swatch {
        display: inline-block;
        width: 16px;
        height: 12px;
        border: 1px solid #000;
    }
    .legend .swatch.free { background: #fff; }
    .legend .swatch.today { border-width: 2px; }
    .legend .badge-blocked { color: #fff; border-color: #dc2626; background: #dc2626; }

    /* ---------- Lignes de regroupement (pavillon / type de chambre) ---------- */
    .group-row td {
        text-align: left;
        font-weight: 700;
        border: 1px solid #000;
        word-break: normal;
    }
    .pavillon-row td {
        font-size: 13px;
        padding: 5px 8px;
        background: #d9d9d9;
        border-left: 5px solid #000;
    }
    .type-row td {
        font-size: 11px;
        padding: 4px 8px 4px 22px;
        background: #efefef;
        font-style: italic;
    }
    .group-row .rooms-count { font-size: 10.5px; font-weight: 400; font-style: normal; }
    tbody td.room-col { padding-left: 18px; }

    /* ---------- Tableau ---------- */
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td {
        border: 1px solid #000;
        padding: 3px 4px;
        text-align: center;
        vertical-align: middle;
        color: #000;
        word-break: break-word;
    }
    thead th { background: #d9d9d9; font-size: 10px; line-height: 1.25; }
    thead th .dow { display: block; text-transform: capitalize; font-weight: 700; }
    thead th .dnum { display: block; font-weight: 600; }
    th.room-col, td.room-col {
        width: 88px;
        text-align: left;
        font-weight: 700;
        white-space: nowrap;
        background: #f2f2f2;
    }
    thead th.weekend { background: #cfcfcf; }
    thead th.today { background: #bdbdbd; }
    th.today, td.today { border-left: 2px solid #000; border-right: 2px solid #000; }

    td.cell { font-size: 9.5px; line-height: 1.2; }
    td.free { background: #fff; }

    /* Chambre bloquée / hors service : signalée en rouge */
    td.cell.blocked {
        background: #fee2e2;
        color: #dc2626;
        font-weight: 700;
        text-align: left;
        letter-spacing: .3px;
    }
    td.cell.blocked .badge-blocked { color: #fff; border-color: #dc2626; background: #dc2626; }

    /* Statuts : lisibles en noir & blanc (badge + teinte de gris) */
    td.occ { font-weight: 600; }
    td.occ.confirmed { background: #d0d0d0; }
    td.occ.pending { background: #ededed; }
    td.occ.closed { background: #f7f7f7; }
    td.occ .badge {
        display: inline-block;
        min-width: 12px;
        margin-right: 3px;
        padding: 0 2px;
        border: 1px solid #000;
        font-size: 8px;
        font-weight: 700;
        line-height: 11px;
        text-align: center;
        vertical-align: middle;
    }

    .footer { margin-top: 10px; font-size: 10px; color: #000; text-align: right; }

    /* ---------- Mise en page impression ---------- */
    @page { size: A4 landscape; margin: 8mm; }
    @media print {
        body { margin: 0; }
        thead { display: table-header-group; }
        tbody tr.pavillon-row { page-break-inside: avoid; }
        tbody tr.pavillon-row:not(:first-child) { page-break-before: always; }
    }
</style>
</head>
<body>
    <header class="doc-header">
        <h1>${docTitle} (par semaine) — CMO Hôtel</h1>
        <div class="meta">
            <div><strong>Période :</strong> ${rangeLabel}</div>
            <div><strong>Généré le</strong> ${this.formatPrintDay(generated)} à ${generated.toLocaleTimeString('fr-FR')}</div>
        </div>
    </header>

    <div class="legend">
        <span class="item"><span class="badge">C</span> IN-HOUSE</span>
        <span class="item"><span class="badge">A</span> ARRIVE</span>
        <span class="item"><span class="badge">T</span> Terminé</span>
        <span class="item"><span class="badge badge-blocked">B</span> BLOQUÉ</span>
        <span class="item"><span class="swatch free"></span> Chambre libre</span>
        <span class="item"><span class="swatch today"></span> Colonne du jour</span>
    </div>

    ${table}
    <div class="footer">CMO Hôtel — ${docTitle} (par semaine) par pavillon et par type de chambre</div>
</body>
</html>`;
    }

    /**
     * Feuille journalière « par jour » : pour un jour donné, une colonne par
     * chambre. Les chambres sont regroupées par pavillon (section) puis par
     * ÉTAGE (colonne de gauche). Sous l'en-tête « Type de chambre », chaque
     * colonne affiche le type, le numéro de chambre, puis l'occupant du jour.
     */
    private buildDailyPrintHtml(
        groups: Map<
            string,
            {
                name: string;
                types: Map<string, { name: string; rooms: any[] }>;
            }
        >,
        day: Date
    ): string {
        const docTitle = this.isEditable
            ? 'Planning des chambres'
            : "Planning d'occupation";
        const generated = new Date();
        const dateLabel = this.formatPrintDay(day);

        const sortedPavillons = Array.from(groups.entries()).sort((a, b) => {
            const ac = this.isChellahPavillon({ name: a[1].name });
            const bc = this.isChellahPavillon({ name: b[1].name });
            if (ac !== bc) {
                return ac ? -1 : 1;
            }
            return a[1].name.localeCompare(b[1].name, undefined, { sensitivity: 'base' });
        });

        const sections = sortedPavillons
            .map(([, pav]) => {
                // Toutes les chambres du pavillon, regroupées par ÉTAGE
                const allRooms: any[] = [];
                pav.types.forEach((t) => allRooms.push(...t.rooms));

                const floors = new Map<string, any[]>();
                allRooms.forEach((room) => {
                    const floorKey = this.roomFloorLabel(room);
                    if (!floors.has(floorKey)) {
                        floors.set(floorKey, []);
                    }
                    floors.get(floorKey)!.push(room);
                });

                const sortedFloors = Array.from(floors.entries()).sort((a, b) =>
                    this.compareFloorKeys(a[0], b[0])
                );

                const maxRooms = sortedFloors.reduce(
                    (max, [, rooms]) => Math.max(max, rooms.length),
                    0
                );

                const body = sortedFloors
                    .map(([floorKey, rooms]) => {
                        const sortedRooms = [...rooms].sort((a, b) =>
                            this.compareRoomNames(a, b)
                        );

                        const typeCells = sortedRooms
                            .map(
                                (r) =>
                                    `<td class="rtype">${this.escapeHtml(
                                        r.roomType?.type ?? ''
                                    )}</td>`
                            )
                            .join('');

                        const numCells = sortedRooms
                            .map(
                                (r) =>
                                    `<td class="rnum">${this.escapeHtml(r.name ?? '')}</td>`
                            )
                            .join('');

                        const occCells = sortedRooms
                            .map((r) => {
                                if (r.available === false) {
                                    return `<td class="occ blocked"><span class="badge badge-blocked">B</span>BLOQUÉ</td>`;
                                }
                                const occ = this.getRoomDayOccupant(r.id, day);
                                if (!occ.text) {
                                    return `<td class="occ free"></td>`;
                                }
                                const marker = this.statusMarker(occ.status);
                                return `<td class="occ ${this.statusClass(
                                    occ.status
                                )}"><span class="badge">${marker}</span><span class="guest">${this.escapeHtml(
                                    occ.text
                                )}</span></td>`;
                            })
                            .join('');

                        return `<tr class="rtype-row"><td class="etage" rowspan="3">Étage ${this.escapeHtml(
                            floorKey
                        )}</td>${typeCells}</tr>
                    <tr class="rnum-row">${numCells}</tr>
                    <tr class="occ-row">${occCells}</tr>`;
                    })
                    .join('');

                return `<section class="pavillon">
                    <h2>Pavillon : ${this.escapeHtml(pav.name)}</h2>
                    <table>
                        <thead>
                            <tr><th class="etage-col">Etage</th><th class="type-col" colspan="${maxRooms}">Type de chambre</th></tr>
                        </thead>
                        <tbody>${body}</tbody>
                    </table>
                </section>`;
            })
            .join('');

        return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${docTitle} (par jour) - CMO Hôtel</title>
<style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #000;
        background: #fff;
        margin: 10mm;
        font-size: 11px;
    }

    /* ---------- En-tête ---------- */
    .doc-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 16px;
        border-bottom: 2px solid #000;
        padding-bottom: 8px;
        margin-bottom: 12px;
    }
    .doc-header h1 { font-size: 18px; margin: 0; letter-spacing: .2px; }
    .doc-header .meta { text-align: right; font-size: 11px; line-height: 1.5; }
    .doc-header .meta strong { font-weight: 700; }

    /* ---------- Légende ---------- */
    .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
        margin: 0 0 14px;
        font-size: 11px;
    }
    .legend .item { display: inline-flex; align-items: center; gap: 6px; }
    .legend .badge {
        display: inline-block;
        min-width: 14px;
        padding: 0 3px;
        border: 1px solid #000;
        font-size: 9px;
        font-weight: 700;
        line-height: 13px;
        text-align: center;
    }
    .legend .badge-blocked { color: #fff; border-color: #dc2626; background: #dc2626; }

    /* ---------- Section pavillon ---------- */
    .pavillon { margin-bottom: 16px; }
    .pavillon h2 {
        font-size: 13px;
        margin: 0 0 6px;
        padding: 5px 8px;
        background: #d9d9d9;
        border: 1px solid #000;
        border-left: 5px solid #000;
        text-transform: uppercase;
        letter-spacing: .3px;
    }

    /* ---------- Tableau ---------- */
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td {
        border: 1px solid #000;
        padding: 3px 4px;
        text-align: center;
        vertical-align: middle;
        color: #000;
        word-break: break-word;
    }
    thead th { background: #d9d9d9; font-size: 10px; font-weight: 700; }
    th.etage-col, td.etage {
        width: 54px;
        background: #f2f2f2;
        font-weight: 700;
    }
    tr.rtype-row td.rtype {
        background: #eef2ff;
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
    }
    tr.rnum-row td.rnum { font-weight: 800; font-size: 11px; }
    tr.occ-row td.occ {
        height: 30px;
        font-size: 9.5px;
        line-height: 1.2;
        font-weight: 600;
        text-align: left;
    }
    tr.occ-row td.occ.free { background: #fff; }
    tr.occ-row td.occ.confirmed { background: #d0d0d0; }
    tr.occ-row td.occ.pending { background: #ededed; }
    tr.occ-row td.occ.closed { background: #f7f7f7; }
    tr.occ-row td.occ.blocked {
        background: #fee2e2;
        color: #dc2626;
        font-weight: 700;
    }
    td.occ .badge {
        display: inline-block;
        min-width: 12px;
        margin-right: 3px;
        padding: 0 2px;
        border: 1px solid #000;
        font-size: 8px;
        font-weight: 700;
        line-height: 11px;
        text-align: center;
        vertical-align: middle;
    }
    td.occ.blocked .badge-blocked { color: #fff; border-color: #dc2626; background: #dc2626; }

    .footer { margin-top: 10px; font-size: 10px; color: #000; text-align: right; }

    /* ---------- Mise en page impression ---------- */
    @page { size: A4 landscape; margin: 8mm; }
    @media print {
        body { margin: 0; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        /* Chaque pavillon (planning) démarre sur une nouvelle page */
        section.pavillon { page-break-inside: avoid; break-inside: avoid; }
        section.pavillon:not(:first-of-type) {
            page-break-before: always;
            break-before: page;
        }
    }
</style>
</head>
<body>
    <header class="doc-header">
        <h1>${docTitle} — Planning du jour</h1>
        <div class="meta">
            <div><strong>DATE :</strong> ${dateLabel}</div>
            <div><strong>Généré le</strong> ${this.formatPrintDay(generated)} à ${generated.toLocaleTimeString('fr-FR')}</div>
        </div>
    </header>

    <div class="legend">
        <span class="item"><span class="badge">C</span> IN-HOUSE</span>
        <span class="item"><span class="badge">A</span> ARRIVE</span>
        <span class="item"><span class="badge">T</span> Terminé</span>
        <span class="item"><span class="badge badge-blocked">B</span> BLOQUÉ</span>
    </div>

    ${sections}
    <div class="footer">CMO Hôtel — ${docTitle} (par jour) par pavillon et par étage</div>
</body>
</html>`;
    }

    /** Lettre affichée dans la case selon le statut de la réservation. */
    private statusMarker(status: string): string {
        switch (status) {
            case 'CONFIRMED':
                return 'C';
            case 'PENDING':
                return 'A';
            case 'CLOSED':
                return 'T';
            case 'BLOCKED':
            case 'BLOQUE':
                return 'B';
            default:
                return 'A';
        }
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
            case 'BLOCKED':
            case 'BLOQUE':
                return 'blocked';
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

    /** Échappe les caractères sensibles avant injection dans le HTML imprimé. */
    private escapeHtml(value: any): string {
        const str = value === null || value === undefined ? '' : String(value);
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Libellé d'étage d'une chambre.
     * Le NUMÉRO de chambre est la source la plus fiable (ex. « 601 » → étage 6,
     * « 101 » → 1) : le champ `floor` peut être mal renseigné (cas OUDAYA où
     * presque toutes les chambres sont saisies en étage 1).
     * On retombe sur `floor` si le nom n'est pas numériquement interprétable,
     * puis sur « — ».
     */
    private roomFloorLabel(room: any): string {
        const name = String(room?.name ?? '').trim();
        if (/^\d{3,}$/.test(name)) {
            return String(Math.floor(Number(name) / 100));
        }
        const floor = room?.floor;
        if (floor !== null && floor !== undefined && String(floor).trim() !== '') {
            return String(floor).trim();
        }
        return '—';
    }

    /** Compare deux libellés d'étage (numérique si possible, sinon alphabétique). */
    private compareFloorKeys(a: string, b: string): number {
        if (a === '—') {
            return 1;
        }
        if (b === '—') {
            return -1;
        }
        const na = Number(a);
        const nb = Number(b);
        if (!isNaN(na) && !isNaN(nb) && na !== nb) {
            return na - nb;
        }
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    }

    /** Compare deux chambres par leur nom (tri naturel : 601 < 602 < 610). */
    private compareRoomNames(a: any, b: any): number {
        return String(a?.name ?? '').localeCompare(String(b?.name ?? ''), undefined, {
            numeric: true,
            sensitivity: 'base',
        });
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
