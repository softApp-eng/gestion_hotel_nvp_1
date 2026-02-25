package med.goeasy.cmohotel.persistence.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import med.goeasy.cmohotel.persistence.entity.enums.EMealType;

import java.util.ArrayList;
import java.util.List;
@Entity
@Data
public class MealType {
    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "meal_type", unique = true, nullable = false)
    @Enumerated(EnumType.STRING)
    private EMealType mealType;   // DEJEUNER,DINER

    private String description;

    @OneToMany(mappedBy = "mealType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<MealPrice> prices = new ArrayList<>();
}
