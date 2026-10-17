package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.ValidatedNight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface ValidatedNightRepository extends JpaRepository<ValidatedNight, String> {
    @Query("SELECT COUNT(vn) > 0 FROM ValidatedNight vn WHERE vn.nightDate = :nightDate")
    boolean isNightValidated(@Param("nightDate") LocalDate nightDate);


    @Query("SELECT n FROM ValidatedNight n WHERE n.invoice.reservationDetails.code = :rcode")
    List<ValidatedNight> getValidatedNights(@Param("rcode") Long code);

    /**
     * Nuitées facturées d'une facture (pour le recalcul des totaux après correction).
     */
    List<ValidatedNight> findByInvoice_Num(String num);

    /**
     * Récupère en une seule requête toutes les nuitées validées des séjours fournis
     * (évite le N+1 sur le planning, qui affiche beaucoup de réservations).
     */
    @Query("SELECT n FROM ValidatedNight n WHERE n.invoice.reservationDetails.code IN :rcodes")
    List<ValidatedNight> getValidatedNightsByReservationCodes(@Param("rcodes") Collection<Long> rcodes);

    @Query("SELECT max(n.nightDate) FROM ValidatedNight n")
    LocalDate lastNight();

    boolean existsByInvoiceReservationDetailsCodeAndRoomAppliedId(Long reservationDetailsCode, Long roomAppliedId);

    boolean existsByInvoiceReservationDetailsCodeAndNightDateAndRoomAppliedId(
            Long reservationDetailsCode, LocalDate nightDate, Long roomAppliedId);
}
