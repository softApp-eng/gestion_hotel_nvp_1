package med.goeasy.cmohotel.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Pavillon {

    @Id
    @GeneratedValue(generator="seq-pavillon")
    @SequenceGenerator(name="seq-pavillon",sequenceName="seq-pavillon", allocationSize=1)
    private Long id;
    @Column(unique = true,nullable = false)
    private String name;
    private String email;
    private String phoneNumber;

}
