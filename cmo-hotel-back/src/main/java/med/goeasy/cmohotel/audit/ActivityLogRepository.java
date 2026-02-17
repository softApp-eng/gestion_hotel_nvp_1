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
                       OR l.ipAddress LIKE concat('%', :key, '%')
                   ))
           AND (:usernames IS NULL OR l.username IN :usernames)
           AND (:targets IS NULL OR l.actionTarget IN :targets)
           AND (:operations IS NULL OR l.actionOperation IN :operations)
           AND (:range IS FALSE OR (l.timestamp BETWEEN :start AND :end))
    """)
    Page<ActivityLog> search(
            @Param("key") String key,
            @Param("targets") List<EAuditActionTarget> actionTargets,
            @Param("operations") List<EAuditActionOperation> actionOperations,
            @Param("usernames") List<String> username,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("range") boolean isRange,
            Pageable pageable
    );

    @Query("SELECT distinct u.username FROM AppUser u order by u.username")
    List<String> getAccount();


}
