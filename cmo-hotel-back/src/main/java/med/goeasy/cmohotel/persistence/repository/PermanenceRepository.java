package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Permanence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PermanenceRepository extends JpaRepository<Permanence, Long> {

    List<Permanence> findByDateBetweenOrderByDateAscCreatedAtAsc(LocalDate start, LocalDate end);

    List<Permanence> findByDateOrderByCreatedAtAsc(LocalDate date);

    boolean existsByDateAndAgent_Id(LocalDate date, Long agentId);

    long countByAgent_Id(Long agentId);
}
