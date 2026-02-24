package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.HousekeepingHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface HousekeepingHistoryRepository extends JpaRepository<HousekeepingHistory, Long> {

    long countByAgent_Id(Long agentId);

    @Query(value = """
        SELECT hk FROM HousekeepingHistory hk
        LEFT JOIN hk.room r
        LEFT JOIN r.roomType t
        LEFT JOIN hk.agent a
        WHERE
               (:key IS NULL OR :key = '' OR (
                           upper(r.code) LIKE upper(concat('%', :key, '%'))
                           OR upper(r.name) LIKE upper(concat('%', :key, '%'))
                           OR upper(t.type) LIKE upper(concat('%', :key, '%'))
                           OR upper(hk.comment) LIKE upper(concat('%', :key, '%'))
                           OR upper(a.firstName) LIKE upper(concat('%', :key, '%'))
                           OR upper(a.lastName) LIKE upper(concat('%', :key, '%'))
                       ))
               AND (:roomTypes IS NULL OR t.id IN :roomTypes)
               AND (:rooms IS NULL OR r.id IN :rooms)
               AND (:agents IS NULL OR a.id IN :agents)
               AND (:anomalie IS FALSE OR (hk.comment IS NOT NULL AND TRIM(hk.comment) <> ''))
               AND ( :range IS FALSE OR (hk.startAt <= :end AND hk.endAt >= :start))
        ORDER BY hk.startAt DESC
        """)
    Page<HousekeepingHistory> searchHistory(
            @Param("key") String key,
            @Param("roomTypes") List<Long> RoomTypes,
            @Param("rooms") List<Long> rooms,
            @Param("agents") List<Long> agents,
            @Param("anomalie") boolean anomalie,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("range") boolean isRange,
            Pageable pageable
    );


    List<HousekeepingHistory> findByRoomIdOrderByCreatedAtDesc(Long roomId);

    @Modifying
    @Query("update HousekeepingHistory l set l.agent = null where l.agent.id = :agentId")
    int detachAgentFromLogs(@Param("agentId") Long agentId);

    @Query("""
        select l from HousekeepingHistory l
        where l.comment is not null and trim(l.comment) <> ''
        order by l.createdAt desc
    """)
    List<HousekeepingHistory> findAllAnomalies();

    @Query("""
        select l from HousekeepingHistory l
        where l.comment is not null and trim(l.comment) <> ''
          and l.createdAt >= :from and l.createdAt < :to
        order by l.createdAt desc
    """)
    List<HousekeepingHistory> findAnomaliesByDate(@Param("from") LocalDateTime from,
                                                  @Param("to") LocalDateTime to);

}
