package med.goeasy.cmohotel.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.enums.EPrestationType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class InvoicePrestation {

    @Id
    @GeneratedValue(generator="seq-inv-prestation")
    @SequenceGenerator(name="seq-inv-prestation",sequenceName="seq-inv-prestation", allocationSize=1)
    private Long id;

    @ManyToOne()
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EPrestationType type;

    @Column(nullable = false)
    private String name;

    private Double price;
}
