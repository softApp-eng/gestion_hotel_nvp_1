package med.goeasy.cmohotel.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.enums.EInvoiceStatus;
import med.goeasy.cmohotel.persistence.entity.enums.EPaymentMode;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
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
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String num;

    @OneToOne
    @JoinColumn(name = "reservation_details_id", unique = true)// TODO add not null
    private ReservationDetails reservationDetails;

    private String invoiceNumber; // Ex: INV-2026-001
    private LocalDateTime issuedAt;
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    private EPaymentMode paymentMode;

    private Double totalRoomPrice;
    private Double totalPrestationPrice;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ValidatedNight> validatedNights = new ArrayList<>();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoicePrestation>  invoicePrestations = new ArrayList<>();

    private boolean priseEnCharge;
    private String priseEnChargeReference;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EReservationCategory category;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EInvoiceStatus status;

    private String description;

    @ManyToOne
    private InvoiceDetails details;

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
