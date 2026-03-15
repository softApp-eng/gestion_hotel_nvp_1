package med.goeasy.cmohotel.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
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
@Table(indexes = {
        @Index(name = "idx_rd_status", columnList = "status"),
        @Index(name = "idx_rd_category", columnList = "category"),
        @Index(name = "idx_rd_dates", columnList = "plannedStart, plannedEnd"),
        @Index(name = "idx_checkin_checkout", columnList = "checkin, checkout")
})
@Entity
public class ReservationDetails {

    @Id
    @GeneratedValue(generator="seq-res-details")
    @SequenceGenerator(name="seq-res-details",sequenceName="seq-res-details", allocationSize=1)
    private Long code;

    @OneToMany(mappedBy = "details", cascade = CascadeType.ALL)
    private List<Reservation> reservations = new ArrayList<>();

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EReservationCategory category;

    private LocalDateTime plannedStart;
    private LocalDateTime plannedEnd;

    private LocalDateTime checkin;
    private LocalDateTime checkout;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EReservationStatus status;

    @Column(length = 500)
    private String observation;

    private boolean priseEnCharge;
    private String priseEnChargeReference;

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
