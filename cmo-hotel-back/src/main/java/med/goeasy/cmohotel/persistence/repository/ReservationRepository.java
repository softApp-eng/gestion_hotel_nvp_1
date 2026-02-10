package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReservationRepository extends JpaRepository<Reservation, String> {
    @Query("""
        SELECT r FROM Reservation r JOIN r.details d
        ORDER BY d.plannedStart
    """)
    Page<Reservation> search(
            //@Param("key") String key,
            Pageable pageable
    );
}
