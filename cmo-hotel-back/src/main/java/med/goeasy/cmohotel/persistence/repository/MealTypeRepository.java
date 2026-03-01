package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.MealType;
import med.goeasy.cmohotel.persistence.entity.enums.EMealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MealTypeRepository extends JpaRepository<MealType, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name,Long id);
    @Query("FROM MealType m order by m.name")
    List<MealType> findAllMeals();


}
