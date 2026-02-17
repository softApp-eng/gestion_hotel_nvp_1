package med.goeasy.cmohotel.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query(value = """
        SELECT l FROM ActivityLog l
        WHERE
               (:key IS NULL OR :key = '' OR (
                           upper(l.message) LIKE upper(concat('%', :key, '%'))
                           OR upper(l.username) LIKE upper(concat('%', :key, '%'))
                           OR upper(l.ipAddress) LIKE upper(concat('%', :key, '%'))
                           OR upper(l.actionTarget) LIKE upper(concat('%', :key, '%'))
                           OR upper(l.actionOperation) LIKE upper(concat('%', :key, '%'))
                       ))
               AND (:username IS NULL OR l.username = :username)
               AND (:targets IS NULL OR l.actionTarget IN :targets)
               AND (:operations IS NULL OR l.actionOperation IN :operations)
               
        ORDER BY l.timestamp DESC
        """)
    Page<ActivityLog> search(
            @Param("key") String key,
            @Param("targets") List<EAuditActionTarget> actionTargets,
            @Param("operations") List<EAuditActionOperation> actionOperations,
            @Param("username") String username,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

    //AND ( :start IS NULL OR (l.timestamp <= :end AND l.timestamp >= :start))
}
