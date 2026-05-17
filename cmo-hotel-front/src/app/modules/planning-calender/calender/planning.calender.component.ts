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
import { Observable, of, Subject, takeUntil } from 'rxjs';
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
            if (this.rooms && this.rooms.length > 0) {
                const formattedResources = this.buildHierarchicalResources(this.rooms);
                successCallback(formattedResources);
            } else {
                successCallback([]);
            }
        },

        events: (info, successCallback, failureCallback) => {
            this.getReservationsByRange('reservations', info.startStr, info.endStr).subscribe({
                next: (data) => {
                    this.periodReservations = data;
                    const events = this.filterReservationsLocally();
                    successCallback(events);
                },
                error: (err) => failureCallback(err)
            });
        },
        eventClick: (info: any) => {
            this.raiseReservationDetailsDialog(info.event.id);
        },
    });

    rooms;
    pavillons;
    selectedRoom = null;
    selectedPavillon;

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
    ) {}

    ngOnInit(): void {
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
                    childrenMap: new Map()
                });
            }

            const pavillonNode = pavillonsMap.get(pavillonName);

            // 2. Regrouper par Type de chambre à l'intérieur du Pavillon
            if (!pavillonNode.childrenMap.has(typeName)) {
                pavillonNode.childrenMap.set(typeName, {
                    id: `type-${room.pavillon?.id}-${room.roomType?.id}`,
                    title: typeName,
                    children: []
                });
            }

            const typeNode = pavillonNode.childrenMap.get(typeName);

            // 3. Ajouter la chambre (l'élément final)
            typeNode.children.push({
                id: room.id.toString(),
                title: room.name // Utilisé par resourceOrder: 'title' pour le tri
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
                    children: tNode.children
                });
            });

            tree.push({
                id: pavNode.id,
                title: pavNode.title,
                children: typesList
            });
        });

        return tree;
    }

    filterReservationsLocally(): any[] {
        const calendarEvents = [];
        const filteredReservations = [...this.periodReservations];

        filteredReservations.forEach(res => {
            const uniqueRoomsInRes = new Map();
            res.guests.forEach(g => {
                if (!uniqueRoomsInRes.has(g.room.id)) {
                    uniqueRoomsInRes.set(g.room.id, g.room);
                }
            });

            uniqueRoomsInRes.forEach((room, roomId) => {
                const matchPavillon = !this.selectedPavillon || room.pavillon.id === this.selectedPavillon;
                const matchRoom = !this.selectedRoom || roomId === this.selectedRoom.id;

                if (matchPavillon && matchRoom) {
                    const guestsInThisRoom = res.guests.filter(g => g.room.id === roomId);
                    const principal = guestsInThisRoom.find(g => g.role.code === 'PRINCIPAL')
                        || guestsInThisRoom.find(g => g.role.code === 'VICE');

                    let guestDisplay = '';
                    if (principal) {
                        const grade = principal.person.grade ? principal.person.grade.code : '';
                        guestDisplay = `${grade} ${principal.person.lastName}`.trim();
                    } else if (guestsInThisRoom.length > 0) {
                        guestDisplay = guestsInThisRoom[0].person.lastName;
                    }

                    const othersCount = guestsInThisRoom.length - 1;
                    const suffix = othersCount > 0 ? ` +${othersCount}` : '';

                    calendarEvents.push({
                        id: `${res.code}`,
                        // CRITICAL: Cette propriété associe l'événement à la ligne de la chambre
                        resourceId: roomId.toString(),
                        title: `${guestDisplay}${suffix}`, // Plus court car le nom de la chambre est déjà sur la ligne
                        start: res.start,
                        end: res.end,
                        backgroundColor: this.getColorByStatus(res.status.code),
                        borderColor: 'transparent',
                        extendedProps: { ...res, currentRoom: room }
                    });
                }
            });
        });

        return calendarEvents;
    }

    loadPavillons() {
        this._apiPavillonService.all().subscribe({
            next: (data) => {
                this.pavillons = data;
                if (data?.length > 0){
                    this.selectedPavillon = data[0]?.id;
                    this.loadRooms();
                }
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
                return '#f59e0b';
            case 'CLOSED':
                return '#10b981';
            default:
                return '#cbd5e1';
        }
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
