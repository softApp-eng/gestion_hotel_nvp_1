package med.goeasy.cmohotel.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.enums.EGuestRole;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class GuestInfo {

    @Id
    @GeneratedValue(generator="seq-guest")
    @SequenceGenerator(name="seq-guest",sequenceName="seq-guest", allocationSize=1)
    private Long id;

    @ManyToOne()
    @JoinColumn(name = "validatedNight_id")
    private ValidatedNight validatedNight;

    private String personId;
    private String grtadeCode;
    private String identity;

    private String firstName;
    private String lastName;
    private String matricule;
    private String unite;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EGuestRole role;
}
