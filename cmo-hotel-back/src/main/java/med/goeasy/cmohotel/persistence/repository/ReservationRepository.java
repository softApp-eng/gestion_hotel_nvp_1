package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Reservation;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservedRoomResponseDto;
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



    // TO CHECK
/*    @Query("""
SELECT r FROM Reservation r
JOIN FETCH r.room rm
JOIN FETCH rm.roomType
JOIN FETCH r.person p
WHERE p.id = :personId
AND (
    r.exceptionPersonStatus IS NULL
    OR r.exceptionPersonStatus <> 'CHECK_OUT'
)
""")
    Optional<Reservation> findActiveReservationByPersonId(
            @Param("personId") String personId
    );*/

    @Query("""
        SELECT r FROM Reservation r 
        JOIN r.details rd 
        WHERE r.person.id = :personId 
        AND rd.status = 'CONFIRMED'
        AND CURRENT_TIMESTAMP <= COALESCE(rd.checkout, rd.plannedEnd)
        ORDER BY COALESCE(rd.checkin, rd.plannedStart) DESC
    """)
    List<Reservation> findActiveReservationByPersonId(@Param("personId") String personId);

}
