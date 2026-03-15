package med.goeasy.cmohotel.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class InvoiceRoom {

    @Id
    @GeneratedValue
    private Long id;

    private String roomName;
    private String roomType;

    @ManyToOne
    private InvoiceDetails invoiceDetails;

    @OneToMany(mappedBy = "invoiceRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceGuest> guests;

}
