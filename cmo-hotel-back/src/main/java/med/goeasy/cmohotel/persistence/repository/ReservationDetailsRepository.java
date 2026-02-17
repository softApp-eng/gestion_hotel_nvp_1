package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.ReservationDetails;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservedRoomResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationDetailsRepository extends JpaRepository<ReservationDetails, Long> {

    @Query(value = """
        SELECT DISTINCT rd FROM ReservationDetails rd
        LEFT JOIN rd.reservations r
        LEFT JOIN r.room rm
        LEFT JOIN rm.roomType t
        LEFT JOIN r.person p
        WHERE
               (:key IS NULL OR :key = '' OR (
                           upper(p.identity) LIKE upper(concat('%', :key, '%'))
                           OR upper(p.email) LIKE upper(concat('%', :key, '%'))
                           OR upper(p.firstName) LIKE upper(concat('%', :key, '%'))
                           OR upper(p.lastName) LIKE upper(concat('%', :key, '%'))
                           OR upper(rm.code) LIKE upper(concat('%', :key, '%'))
                           OR upper(t.type) LIKE upper(concat('%', :key, '%'))
                           OR cast(rd.code as string) LIKE upper(concat('%', :key, '%'))
                       ))
               AND (:code IS NULL OR rd.code = :code)
               AND (:status IS NULL OR rd.status IN :status)
               AND (:category IS NULL OR rd.category IN :category)
               AND ( :range IS FALSE OR (rd.plannedStart <= :end AND rd.plannedEnd >= :start))
               
        ORDER BY rd.plannedStart DESC
        """)
    Page<ReservationDetails> search(
            @Param("key") String key,
            @Param("code") Long reservationCode,
            @Param("status") List<EReservationStatus> status,
            @Param("category") List<EReservationCategory> category,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("range") boolean isRange,
            Pageable pageable
    );

    @Query(value = """
        SELECT DISTINCT rd FROM ReservationDetails rd
        LEFT JOIN rd.reservations r
        LEFT JOIN r.room rm
        LEFT JOIN rm.roomType t
        LEFT JOIN r.person p
        WHERE
               (:status IS NULL OR rd.status IN :status)
               AND (rd.plannedStart <= :end AND rd.plannedEnd >= :start)
        """)
    List<ReservationDetails> getRangeReservations(
            @Param("status") List<EReservationStatus> status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );


}
