package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.HousekeepingAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface HousekeepingAgentRepository extends JpaRepository<HousekeepingAgent, Long> {

    @Query("select a from HousekeepingAgent a where a.archived is false order by a.lastName")
    List<HousekeepingAgent> getAgents();

    @Query("select a from HousekeepingAgent a where a.archived is false and a.id = ?1")
    Optional<HousekeepingAgent> findAgentById(Long id);
}

