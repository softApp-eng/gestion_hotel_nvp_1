package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MealTypeRepository extends JpaRepository<MealType, Long> {
   // boolean existsByName(EMealType name);
    @Query("""
        SELECT DISTINCT m FROM MealType m
        LEFT JOIN FETCH m.prices
    """)
    List<MealType> findAllWithPrices();
}