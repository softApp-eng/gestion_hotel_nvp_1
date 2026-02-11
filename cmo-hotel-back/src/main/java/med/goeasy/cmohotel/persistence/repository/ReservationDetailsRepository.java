package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.ReservationDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReservationDetailsRepository extends JpaRepository<ReservationDetails, Long> {

//    @Query("""
//        SELECT r FROM ReservationDetails r
//        ORDER BY r.plannedStart
//    """)
//    Page<ReservationDetails> search(
//            Pageable pageable
//    );

    @Query(value = """
        SELECT rd FROM ReservationDetails rd
        LEFT JOIN FETCH rd.reservations r
        LEFT JOIN FETCH r.person p
        LEFT JOIN FETCH r.room rm
        ORDER BY rd.plannedStart DESC
    """)
    Page<ReservationDetails> search(
            //@Param("category") EReservationCategory category,
            Pageable pageable
    );
    //WHERE (:category IS NULL OR rd.category = :category)
    //, countQuery = "SELECT count(rd) FROM ReservationDetails rd"
}
