package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Prestation;
import med.goeasy.cmohotel.persistence.entity.enums.EPrestationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface PrestationRepository extends JpaRepository<Prestation, String> {

    @Query("FROM Prestation p WHERE p.reservation.id = ?1 order by p.day desc, p.id")
    List<Prestation> findPrestationsByReservationId(String reservationId);

    @Query("FROM Prestation p WHERE p.reservation.id in ?1")
    List<Prestation> findPrestationsByReservationIds(List<String> reservationIds);

    /**
     * Nombre de prestations actives d'une personne pour un jour et un type/nom donnés.
     * Sert à interdire plus d'un même repas par jour.
     */
    @Query("SELECT COUNT(p) FROM Prestation p " +
            "WHERE p.reservation.id = ?1 AND p.day = ?2 AND p.type = ?3 AND p.name = ?4 AND p.archived = false")
    long countByPersonAndDayAndTypeAndName(String reservationId, LocalDate day, EPrestationType type, String name);

    /**
     * Idem mais en excluant une prestation (pour la modification).
     */
    @Query("SELECT COUNT(p) FROM Prestation p " +
            "WHERE p.reservation.id = ?1 AND p.day = ?2 AND p.type = ?3 AND p.name = ?4 AND p.id <> ?5 AND p.archived = false")
    long countByPersonAndDayAndTypeAndNameExcept(String reservationId, LocalDate day, EPrestationType type, String name, String excludeId);

}
