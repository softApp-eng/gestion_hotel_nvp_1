package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Person;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface PersonRepository extends JpaRepository<Person, String> {

    @Query("FROM Person p WHERE p.id = ?1 AND p.archived IS FALSE")
    Optional<Person> findPersonById(String id);

    @Query("""
        SELECT p FROM Person p JOIN p.grade g
            WHERE p.archived is false and 
                (
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


}
