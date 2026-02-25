package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.MealPrice;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EMealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MealPriceRepository extends JpaRepository<MealPrice, Long> {

    List<MealPrice> findByMealType_Id(Long mealTypeId);

    @Query("""
       SELECT p.price FROM MealPrice p
       WHERE p.mealType.mealType = :meal
       AND p.category = :category
    """)
    Double getPrice(@Param("meal") EMealType meal,
                    @Param("category") EGradeCategory category);
    List<MealPrice> findByMealTypeId(Long id);

    List<MealPrice> findAllByMealType_Id(Long typeId);

    boolean existsByMealType_IdAndCategory(Long typeId, EGradeCategory category);

    boolean existsByMealType_IdAndCategoryAndIdNot(Long typeId, EGradeCategory category, Long id);




    @Query("SELECT mp FROM MealPrice mp WHERE mp.mealType.mealType = :mealType AND mp.category = :category")
    Optional<MealPrice> findByMealTypeAndCategory(@Param("mealType") EMealType mealType,
                                                  @Param("category") EGradeCategory category);


}
