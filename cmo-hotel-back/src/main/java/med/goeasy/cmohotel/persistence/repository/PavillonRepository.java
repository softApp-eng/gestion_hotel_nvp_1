package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Pavillon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PavillonRepository extends JpaRepository<Pavillon, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name,Long id);

    @Query("FROM Pavillon p order by p.name")
    List<Pavillon> getPavillons();
}
