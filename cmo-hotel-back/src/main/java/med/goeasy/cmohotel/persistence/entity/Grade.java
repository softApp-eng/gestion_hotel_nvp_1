package med.goeasy.cmohotel.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Grade {

    @Id
    @GeneratedValue(generator="seq-grade")
    @SequenceGenerator(name="seq-grade",sequenceName="seq-grade", allocationSize=1)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(unique = true, nullable = false)
    private String name;

    private Integer rating;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EGradeCategory category;


}
