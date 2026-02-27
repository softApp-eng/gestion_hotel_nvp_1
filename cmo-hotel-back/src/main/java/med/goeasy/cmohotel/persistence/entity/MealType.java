package med.goeasy.cmohotel.persistence.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.enums.EMealType;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Entity
public class MealType {
    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "meal_type", unique = true, nullable = false)
    @Enumerated(EnumType.STRING)
    private EMealType mealType;

    private String description;

    @OneToMany(mappedBy = "mealType", cascade = CascadeType.ALL, orphanRemoval = true)
    //@JsonManagedReference
    private List<MealPrice> prices = new ArrayList<>();

    // audit
    @CreatedBy
    private String createdBy;

    @LastModifiedBy
    private String lastModifiedBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
