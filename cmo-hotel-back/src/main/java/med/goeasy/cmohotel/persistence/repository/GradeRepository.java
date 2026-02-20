package med.goeasy.cmohotel.persistence.repository;

import med.goeasy.cmohotel.persistence.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    @Query("SELECT g FROM Grade g ORDER BY g.rating ASC")
    List<Grade> getGrades();
}
