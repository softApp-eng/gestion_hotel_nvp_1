package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.ValidatedNight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ValidatedNightRepository extends JpaRepository<ValidatedNight, String> {
    @Query("SELECT COUNT(vn) > 0 FROM ValidatedNight vn WHERE vn.nightDate = :nightDate")
    boolean isNightValidated(@Param("nightDate") LocalDate nightDate);


    @Query("SELECT n FROM ValidatedNight n WHERE n.invoice.reservationDetails.code = :rcode")
    List<ValidatedNight> getValidatedNights(@Param("rcode") Long code);

    @Query("SELECT max(n.nightDate) FROM ValidatedNight n")
    LocalDate lastNight();

    boolean existsByInvoiceReservationDetailsCodeAndRoomAppliedId(Long reservationDetailsCode, Long roomAppliedId);
}
