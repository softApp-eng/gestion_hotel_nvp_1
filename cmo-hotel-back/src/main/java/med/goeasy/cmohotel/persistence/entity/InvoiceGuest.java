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
public class InvoiceGuest {

    @Id
    @GeneratedValue(generator="seq-inv-guest")
    @SequenceGenerator(name="seq-inv-guest",sequenceName="seq-inv-guest", allocationSize=1)
    private Long id;

    @ManyToOne()
    @JoinColumn(name = "invoiceRoom_id")
    private InvoiceRoom invoiceRoom;

    private String personId;
    private String gradeCode;
    private String identity;

    private String firstName;
    private String lastName;
    private String matricule;
    private String unite;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EGuestRole role;
}
