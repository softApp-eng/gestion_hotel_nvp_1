package med.goeasy.cmohotel.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(name = "meal_categ_price_unique", columnNames = {"meal_type_id", "category"})
})
public class MealPrice {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(optional = false)
    private MealType mealType;

    @Enumerated(EnumType.STRING)
    private EGradeCategory category;

    private BigDecimal price;

}
