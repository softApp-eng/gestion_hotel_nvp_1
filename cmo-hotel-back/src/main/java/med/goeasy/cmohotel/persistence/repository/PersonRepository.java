package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Person;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PersonRepository extends JpaRepository<Person, String> {

    @Query("""
        SELECT p FROM Person p JOIN p.grade g
            WHERE (
            upper(p.email) like %:key%
            OR upper(p.firstName) like %:key%
            OR upper(p.lastName) like %:key%
            OR upper(p.identity) like %:key%
        )
        ORDER BY g.rating
    """)
    Page<Person> search(
            @Param("key") String key,
            Pageable pageable
    );

    /*@Query("""
    SELECT p
    FROM Person p
    JOIN p.grade g
    JOIN Reservation r ON r.person = p
    WHERE (
        upper(p.email) LIKE %:key%
        OR upper(p.firstName) LIKE %:key%
        OR upper(p.lastName) LIKE %:key%
        OR upper(p.identity) LIKE %:key%
    )
    GROUP BY p.id, g.id, g.rating, g.name
    ORDER BY g.rating
""")*/

    @Query("""
        SELECT DISTINCT p FROM Reservation r
        JOIN r.person p
        JOIN r.details rd
        WHERE rd.status = 'CONFIRMED'
        AND CURRENT_DATE >= CAST(COALESCE(rd.checkin, rd.plannedStart) AS date)
        AND CURRENT_DATE <= CAST(COALESCE(rd.checkout, rd.plannedEnd) AS date)
        AND    (
        upper(p.email) LIKE %:key%
        OR upper(p.firstName) LIKE %:key%
        OR upper(p.lastName) LIKE %:key%
        OR upper(p.identity) LIKE %:key%
    )
    """)
    Page<Person> searchWithReservation(@Param("key") String key, Pageable pageable);
}
