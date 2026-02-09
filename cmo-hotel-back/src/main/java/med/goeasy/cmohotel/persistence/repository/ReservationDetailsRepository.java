package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.ReservationDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationDetailsRepository extends JpaRepository<ReservationDetails, Long> {

}
