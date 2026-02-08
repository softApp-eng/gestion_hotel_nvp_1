package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.RoomPrice;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoomPriceRepository extends JpaRepository<RoomPrice, Long> {
    boolean existsByRoomType_IdAndCategory(Long typeId, EGradeCategory category);
    boolean existsByRoomType_IdAndCategoryAndIdNot(Long typeId, EGradeCategory category, Long id);

    @Query("FROM RoomPrice p JOIN p.roomType t WHERE t.id = ?1 order by p.category")
    List<RoomPrice> findAllByType(Long typeId);
}
