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
               AND ( :range IS FALSE OR (i.issuedAt <= :end AND i.issuedAt >= :start))
        ORDER BY i.issuedAt DESC
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
}
