package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Room;
import med.goeasy.cmohotel.persistence.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code,Long id);

    @Query("FROM Room r join r.pavillon p where (?1 is null or p.id = ?1) and (?2 is null or r.clean = ?2) and r.archived is false order by r.code")
    List<Room> getRooms(Long pavillonId,Boolean clean);

    @Query("FROM Room r where r.roomType = ?1 order by r.code")
    List<Room> findByRoomType(RoomType type);

    @Query()
    long countRoomByPavillon_Id(Long pavillonId);

    @Query("""
            SELECT r.roomType.type, COUNT(r) FROM Room r
            WHERE r.pavillon.id = :pavillonId
            GROUP BY r.roomType.type
    """)
    List<Object[]> countRoomsByTypeByPavillonId(@Param("pavillonId") Long pavillonId);

    @Query("FROM Room r where r.archived is false and r.id = ?1")
    Optional<Room> findRoomById(Long roomId);
}
