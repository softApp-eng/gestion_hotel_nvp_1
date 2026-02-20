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
        NgClass,
        MatRippleModule,
        MatSelectModule,
        FullCalendarModule,
        MatRippleModule,
        FormsModule,
    ],
})
export class PlanningCalenderComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    calendarOptions = signal<CalendarOptions>({
        // On utilise dayGridPlugin au lieu de resourceTimeline
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        locale: 'fr',
        handleWindowResize: true,
        windowResizeDelay: 100,
        fixedMirrorParent: document.body,
        // Pour afficher le "+2 more" comme sur votre image
        dayMaxEvents: true,
        dayMaxEventRows: 4,
        moreLinkText: (n) => `+ ${n} de plus`,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay',
        },
        buttonText: {
            today:    "Aujourd'hui",
            month:    "Mois",
            week:     "Semaine",
            day:      "Jour",
            list:     "Planning"
        },
        events: (info, successCallback, failureCallback) => {
            this.getReservationsByRange('reservations', info.startStr, info.endStr).subscribe({
                next: (data) => {
                    this.periodReservations = data;
                    // On appelle votre fonction de filtrage et on donne le résultat au calendrier
                    const events = this.filterReservationsLocally();
                    successCallback(events);
                },
                error: (err) => failureCallback(err)
            });
        },
        eventClick: (info:any) => {
            console.log('Event:', info.event.id);
            this.raiseReservationDetailsDialog(info.event.id)
        },
    });

    rooms;
    pavillons;
    groupedRooms: any;
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
        private _utilsService: UtilsService
    ) {}

    ngOnInit(): void {

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if (matchingAliases.includes('md')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }
            });
        this.loadPavillons();
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

                // Filtre par Pavillon
                const matchPavillon = !this.selectedPavillon || room.pavillon.id === this.selectedPavillon;
                // Filtre par Chambre
                const matchRoom = !this.selectedRoom || roomId === this.selectedRoom.id;

                if (matchPavillon && matchRoom) {
                    // On compte combien de personnes de cette réservation sont dans CETTE chambre précisément
                    const guestsInThisRoom = res.guests.filter(g => g.room.id === roomId).length;

                    calendarEvents.push({
                        id: `${res.code}`, // ID unique combiné
                        reservation: `${res}`,
                        title: `${room.name} - ${room.roomType.type} (${guestsInThisRoom} pers.)`,
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

    selectRoom(room: any): void {
        this.selectedRoom = room;
        let d = this.filterReservationsLocally()
        console.log('final',d);
        if (this.fullCalendar) {
            this.fullCalendar.getApi().refetchEvents();
        }
    }

    loadPavillons() {
        this._apiPavillonService.all().subscribe({
            next: (data) => {
                this.pavillons = data;
                if (data?.length > 0){
                    this.selectedPavillon = data[0]?.id;
                    this.loadRooms(this.selectedPavillon);
                }
            },
        });
    }

    loadRooms(pavillonId) {
        this._apiRoomService.all(pavillonId).subscribe({
            next: (data) => {
                this.rooms = data;
                this.groupRoomsByType(data);
                this.selectRoom(null)
                // On force le calendrier à recharger pour filtrer sur le nouveau pavillon
                if (this.fullCalendar) {
                    this.fullCalendar.getApi().refetchEvents();
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

    groupRoomsByType(rooms) {
        this.groupedRooms = rooms.reduce((acc, room) => {
            const typeName = room.roomType.type;

            // On cherche si le groupe existe déjà
            let group = acc.find(g => g.type === typeName);

            if (!group) {
                group = { type: typeName, items: [] };
                acc.push(group);
            }

            group.items.push(room);
            return acc;
        }, []);
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
