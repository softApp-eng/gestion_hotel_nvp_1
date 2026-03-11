package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.MealType;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EMealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface MealTypeRepository extends JpaRepository<MealType, Long> {
    boolean existsByName(String name);
    @Query("FROM MealType mt WHERE mt.name = ?1")
    Optional<MealType> findByName(String name);
    boolean existsByNameAndIdNot(String name,Long id);
    @Query("FROM MealType m order by m.name")
    List<MealType> findAllMeals();

    @Query("SELECT mp.price FROM MealPrice mp WHERE mp.mealType.name = :name AND mp.category = :category")
    Optional<BigDecimal> findPriceByNameAndCategory(String name, EGradeCategory category);


}
