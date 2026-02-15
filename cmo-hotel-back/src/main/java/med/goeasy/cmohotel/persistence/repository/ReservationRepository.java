package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Reservation;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservedRoomResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

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
}
