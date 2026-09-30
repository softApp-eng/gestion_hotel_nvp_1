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
    Optional<Invoice> findByReservationDetails_Code(Long code);

    @Query(value = """
        SELECT DISTINCT i FROM Invoice i
                LEFT JOIN i.validatedNights vn
                LEFT JOIN vn.roomApplied r
                LEFT JOIN i.reservationDetails rd
                LEFT JOIN rd.reservations res
                LEFT JOIN res.person p
        WHERE
               (:key IS NULL OR :key = '' OR (
                           upper(i.num) LIKE upper(concat('%', :key, '%'))
                           OR upper(i.priseEnChargeReference) LIKE upper(concat('%', :key, '%'))
                           OR upper(p.firstName) LIKE upper(concat('%', :key, '%'))
                           OR upper(p.lastName) LIKE upper(concat('%', :key, '%'))
                           OR upper(p.matricule) LIKE upper(concat('%', :key, '%'))
                           OR upper(p.identity) LIKE upper(concat('%', :key, '%'))
                       ))
               AND (:room IS NULL OR :room = '' OR (
                                     vn IS NOT NULL AND (
                                         upper(vn.roomName) = upper(:room)
                                         OR (r IS NOT NULL AND (
                                             upper(r.code) = upper(:room)
                                             OR upper(r.name) = upper(:room)
                                         ))
                                     )
                                 ))
             
               AND (:modes IS NULL OR i.paymentMode IN :modes)
               AND (:priseEnCharge IS FALSE OR i.priseEnCharge = :priseEnCharge)
               AND (:category IS NULL OR i.category IN :category)
               AND (:status IS NULL OR i.status IN :status)
               AND ( :range IS FALSE OR (i.createdAt <= :end AND i.createdAt >= :start))
        ORDER BY i.createdAt DESC
        """)
    /*
    SELECT i FROM Invoice i LEFT JOIN i.validatedNights vn LEFT JOIN vn.roomApplied r
        WHERE
               (:key IS NULL OR :key = '' OR (
                           upper(i.num) LIKE upper(concat('%', :key, '%'))
                           OR upper(i.priseEnChargeReference) LIKE upper(concat('%', :key, '%'))
                       ))

               AND (:room IS NULL OR :room = '' OR (
                      vn IS NOT NULL AND (
                          upper(vn.roomName) = upper(:room)
                          OR (r IS NOT NULL AND (
                              upper(r.code) = upper(:room)
                              OR upper(r.name) = upper(:room)
                          ))
                      )
                  ))
               AND (:modes IS NULL OR i.paymentMode IN :modes)
               AND (:priseEnCharge IS FALSE OR i.priseEnCharge = :priseEnCharge)
               AND (:category IS NULL OR i.category IN :category)
               AND (:status IS NULL OR i.status IN :status)
               AND ( :range IS FALSE OR (i.createdAt <= :end AND i.createdAt >= :start))
        ORDER BY i.createdAt DESC
    --------------è
    AND (:room IS NULL OR :room = '' OR (
                                      upper(vn.roomName) LIKE upper(:room)
                                      OR upper(r.code) LIKE upper(:room)
                                      OR upper(r.name) LIKE upper(:room)
                                  ))
     */
    Page<Invoice> search(
            @Param("key") String key,
            @Param("room") String room,
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
    @Query("SELECT COALESCE(sum(i.totalRoomPrice), 0) FROM Invoice i WHERE i.status in :status ")
    long countHostingPrice(@Param("status") List<EInvoiceStatus> status);

    @Query("SELECT COALESCE(sum(i.totalPrestationPrice), 0) FROM Invoice i WHERE i.status in :status")
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
