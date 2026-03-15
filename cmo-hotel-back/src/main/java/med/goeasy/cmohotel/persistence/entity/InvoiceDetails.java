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
public class InvoiceDetails {

    @Id
    @GeneratedValue
    private Long id;

    @OneToMany(mappedBy = "invoiceDetails", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceRoom> invoiceRooms;


}
