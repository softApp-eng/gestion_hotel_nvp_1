package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code,Long id);

    @Query("FROM Room r join r.pavillon p where (?1 is null or p.id = ?1) order by r.code")
    List<Room> getRooms(Long pavillonId);
}
