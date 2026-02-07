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
}
