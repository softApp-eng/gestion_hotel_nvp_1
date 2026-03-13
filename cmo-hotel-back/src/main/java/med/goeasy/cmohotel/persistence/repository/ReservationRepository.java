package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.Reservation;
import med.goeasy.cmohotel.presentation.dto.Range;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservedRoomResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, String> {
    @Query("""
        SELECT new med.goeasy.cmohotel.presentation.dto.reservation.ReservedRoomResponseDto(
            d.code,
            d.status,
            COALESCE(d.checkin, d.plannedStart),
            COALESCE(d.checkout, d.plannedEnd),
            r.id,
            r.capacity
        )
        FROM Reservation res
        JOIN res.details d
        JOIN res.room r
        WHERE (COALESCE(d.checkin, d.plannedStart) >= :today)
        AND d.status != 'CANCELLED'
    """)
    List<ReservedRoomResponseDto> findFutureReservedRooms(@Param("today") LocalDateTime today);

    @Query("""
        SELECT COUNT(r) > 0
        FROM Reservation r JOIN r.details rd
        WHERE r.room.id = :roomId 
        AND rd.status = 'CONFIRMED'
        AND :targetDate >= COALESCE(rd.checkin, rd.plannedStart)
        AND :targetDate <= COALESCE(rd.checkout, rd.plannedEnd)
    """)
    boolean isRoomOccupiedAt(@Param("roomId") Long roomId, @Param("targetDate") LocalDateTime targetDate);

    @Query("""
        SELECT r FROM Reservation r 
        JOIN r.details rd 
        WHERE r.person.id = :personId 
        AND rd.status = 'CONFIRMED'
        AND CURRENT_TIMESTAMP <= COALESCE(rd.checkout, rd.plannedEnd)
        ORDER BY COALESCE(rd.checkin, rd.plannedStart) DESC
    """)
    List<Reservation> findActiveReservationByPersonId(@Param("personId") String personId);

    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
            FROM Reservation r
            JOIN r.details rd
            WHERE r.person.id = :personId
            AND rd.status IN ('CONFIRMED', 'PENDING')
            AND CURRENT_TIMESTAMP <= COALESCE(rd.checkout, rd.plannedEnd)
    """)
    boolean isPersonHasReservation(@Param("personId") String personId);

    @Query("""
        SELECT COUNT(r)
        FROM Reservation r
        JOIN r.details rd
        WHERE r.person.id = :personId
    """)
    long countPersonReservations(@Param("personId") String personId);

    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
            FROM Reservation r
            JOIN r.details rd
            WHERE r.room.id = ?1
            AND rd.status IN ('CONFIRMED', 'PENDING')
            AND CURRENT_TIMESTAMP <= COALESCE(rd.checkout, rd.plannedEnd)
    """)
    boolean isRoomHasReservation(Long roomId);

    @Query("""
        SELECT COUNT(r)
        FROM Reservation r
        JOIN r.details rd
        WHERE r.room.id = ?1
    """)
    long countRoomReservations(Long roomId);

    @Query("""
        SELECT r FROM Reservation r
        JOIN r.details rd
        WHERE rd.status = 'CONFIRMED'
    """)
    //AND CURRENT_DATE >= CAST(COALESCE(rd.checkin, rd.plannedStart) AS date)
        //        AND CURRENT_DATE <= CAST(COALESCE(rd.checkout, rd.plannedEnd) AS date)
    List<Reservation> findResidentReservations();

    @Query("""
        SELECT new med.goeasy.cmohotel.presentation.dto.Range(
            COALESCE(r.details.checkin, r.details.plannedStart),
            COALESCE(r.details.checkout, r.details.plannedEnd),
            CAST(COUNT(r.id) AS int)
        )
        FROM Reservation r
        WHERE r.room.id = :roomId
        AND r.details.status IN ('PENDING','CONFIRMED')
        AND (COALESCE(r.details.checkout, r.details.plannedEnd) >= :today)
        GROUP BY
                COALESCE(r.details.checkin, r.details.plannedStart),
                COALESCE(r.details.checkout, r.details.plannedEnd)
    """)
    List<Range> findOccupiedRangesByRoom(
            @Param("roomId") Long roomId,
            @Param("today") LocalDateTime today
    );

    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END 
        FROM Reservation r 
        WHERE r.room.id = :roomId 
        AND r.details.status IN ('PENDING','CONFIRMED')
        AND (:start < COALESCE(r.details.checkout, r.details.plannedEnd) AND :end > COALESCE(r.details.checkin, r.details.plannedStart))
        AND (:rcode IS NULL OR r.details.code != :rcode)
    """)
    boolean isRoomOccupied(@Param("roomId") Long roomId,
                           @Param("start") LocalDateTime start,
                           @Param("end") LocalDateTime end,
                           @Param("rcode") Long code);

    // Compte les occupants pour les chambres partagées
    @Query("""
        SELECT COUNT(r) FROM Reservation r 
        WHERE r.room.id = :roomId 
        AND r.details.status IN ('PENDING','CONFIRMED')
        AND (:start < COALESCE(r.details.checkout, r.details.plannedEnd) AND :end > COALESCE(r.details.checkin, r.details.plannedStart))
        AND (:rcode IS NULL OR r.details.code != :rcode)
    """)
    long countCurrentOccupants(@Param("roomId") Long roomId,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end,
                               @Param("rcode") Long code);

}
