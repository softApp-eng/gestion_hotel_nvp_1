package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Invoice;
import med.goeasy.cmohotel.persistence.entity.ReservationDetails;
import med.goeasy.cmohotel.persistence.entity.enums.EInvoiceStatus;
import med.goeasy.cmohotel.persistence.entity.enums.EPaymentMode;
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
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    Optional<Invoice> findByReservationDetails(ReservationDetails reservationDetails);

    @Query(value = """
        SELECT i FROM Invoice i
        WHERE
               (:key IS NULL OR :key = '' OR (
                           upper(i.num) LIKE upper(concat('%', :key, '%'))
                           OR upper(i.priseEnChargeReference) LIKE upper(concat('%', :key, '%'))
                       ))
               AND (:modes IS NULL OR i.paymentMode IN :modes)
               AND (:priseEnCharge IS FALSE OR i.priseEnCharge = :priseEnCharge)
               AND (:category IS NULL OR i.category IN :category)
               AND (:status IS NULL OR i.status IN :status)
               AND ( :range IS FALSE OR (i.createdAt <= :end AND i.createdAt >= :start))
        ORDER BY i.createdAt DESC
        """)
    Page<Invoice> search(
            @Param("key") String key,
            @Param("modes") List<String> paymentModes,
            @Param("priseEnCharge") Boolean priseEnCharge,
            @Param("category") List<String> category,
            @Param("status") List<String> status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("range") boolean isRange,
            Pageable pageable
    );

    @Query("SELECT i FROM Invoice i WHERE i.paidAt >= :startOfDay AND i.paidAt <= :endOfDay AND i.status = 'PAID'")
    List<Invoice> findPaidInvoicesBetween(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    // counters
    @Query("SELECT sum(i.totalRoomPrice) FROM Invoice i WHERE i.status in :status ")
    long countHostingPrice(@Param("status") List<EInvoiceStatus> status);

    @Query("SELECT sum(i.totalPrestationPrice) FROM Invoice i WHERE i.status in :status")
    long countPrestationPrice(@Param("status") List<EInvoiceStatus> status);

    @Query("""
    SELECT MONTH(i.paidAt) as month, SUM(i.totalRoomPrice + i.totalPrestationPrice) as total
    FROM Invoice i
    WHERE i.status = 'PAID'
        AND YEAR(i.paidAt) = :year
        AND (:modes IS NULL OR i.paymentMode IN :modes)
        AND (:categories IS NULL OR i.category IN :categories)
    GROUP BY MONTH(i.paidAt)
    ORDER BY MONTH(i.paidAt) ASC
""")
    List<Object[]> getRawMonthlyRevenue(
            @Param("year") int year,
            @Param("modes") List<String> paymentModes,
            @Param("categories") List<String> categories
            );

    @Query("""
    SELECT r.roomType as type, SUM(i.totalRoomPrice + i.totalPrestationPrice) as total
    FROM Invoice i join i.details d join d.invoiceRooms r
    WHERE i.status = 'PAID'
    GROUP BY r.roomType
    ORDER BY r.roomType ASC
""")
    List<Object[]> getRoomTypeRevenue();
}
