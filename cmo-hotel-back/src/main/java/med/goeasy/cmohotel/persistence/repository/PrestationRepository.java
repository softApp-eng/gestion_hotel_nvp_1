package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Prestation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PrestationRepository extends JpaRepository<Prestation, String> {

    @Query("FROM Prestation p WHERE p.reservation.id = ?1 order by p.day desc, p.id")
    List<Prestation> findPrestationsByReservationId(String reservationId);

    @Query("FROM Prestation p WHERE p.reservation.id in ?1")
    List<Prestation> findPrestationsByReservationIds(List<String> reservationIds);
}
