package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Invoice;
import med.goeasy.cmohotel.persistence.entity.ReservationDetails;
import med.goeasy.cmohotel.persistence.entity.enums.EInvoiceStatus;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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
        ORDER BY rd.code DESC
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

    @Query(value = """
        SELECT DISTINCT rd FROM ReservationDetails rd
        WHERE
            rd.status = 'CONFIRMED'
        order by rd.code desc
        """)
    List<ReservationDetails> getSejours();

    @Query(value = """
        SELECT DISTINCT rd FROM ReservationDetails rd
        WHERE
            rd.status = 'CONFIRMED'
            AND rd.plannedEnd BETWEEN :start AND :end
        order by rd.code desc
        """)
    List<ReservationDetails> getDepartPrevu(@Param("start") LocalDateTime start,@Param("end") LocalDateTime end);

    @Query(value = """
    SELECT DISTINCT rd FROM ReservationDetails rd
    WHERE rd.status IN ('CONFIRMED', 'CLOSED')
      AND rd.checkin IS NOT NULL
      AND rd.checkin <= :end
      AND COALESCE(rd.checkout, rd.plannedEnd) >= :start
    ORDER BY rd.code DESC
    """)
    List<ReservationDetails> getArchiveMainCourante(@Param("start") LocalDateTime start,@Param("end") LocalDateTime end);


    @Query(value = """
    SELECT DISTINCT rd FROM ReservationDetails rd
    LEFT JOIN FETCH rd.reservations r
    LEFT JOIN FETCH r.room
    WHERE rd.status = 'CONFIRMED'
    ORDER BY rd.code DESC
    """)
    List<ReservationDetails> getSejoursWithDepth();

    /**
     * Séjours occupés à une date donnée (pour le taux d'occupation daté).
     */
    @Query(value = """
    SELECT DISTINCT rd FROM ReservationDetails rd
    LEFT JOIN FETCH rd.reservations r
    LEFT JOIN FETCH r.room
    WHERE rd.status IN ('CONFIRMED', 'CLOSED')
      AND rd.checkin <= :end
      AND COALESCE(rd.checkout, rd.plannedEnd) >= :start
    ORDER BY rd.code DESC
    """)
    List<ReservationDetails> getSejoursWithDepthByDay(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
    SELECT MONTH(rd.checkin) as month, count (rd.code) as total
    FROM ReservationDetails rd
    WHERE rd.status in ('CLOSED','CONFIRMED')
        AND YEAR(rd.checkin) = :year
        AND (:categories IS NULL OR rd.category IN :categories)
    GROUP BY MONTH(rd.checkin)
    ORDER BY MONTH(rd.checkin) ASC
""")
    List<Object[]> getRawMonthlyReservationsCounts(
            @Param("year") int year,
            @Param("categories") List<EReservationCategory> categories
    );

    @Query("SELECT count (rd.code) FROM ReservationDetails rd WHERE rd.status in :status")
    long countReservationsByStatus(@Param("status") List<EReservationStatus> status);

    @Query("SELECT count (rd.code) FROM ReservationDetails rd WHERE rd.status in ('CLOSED','CONFIRMED') and rd.category in :categories")
    long countReservationsByCategories(@Param("categories") List<EReservationCategory> categories);

    @Query("SELECT count (rd.code) FROM ReservationDetails rd WHERE rd.status in ('CLOSED','CONFIRMED') and rd.priseEnCharge is true ")
    long countReservationsPriseEnCharge();

    @Query("""
        SELECT COUNT(rd) FROM ReservationDetails rd
            WHERE rd.status IN :status
    """)
    long countTotalReservations(@Param("status") List<EReservationStatus> status);

    /*@Query("SELECT rd FROM ReservationDetails rd WHERE rd.paidAt >= :startOfDay AND i.paidAt <= :endOfDay AND i.status = 'PAID'")
    List<ReservationDetails> getReservationsByDay(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );*/


}
