package med.goeasy.cmohotel.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Entity
public class SwitchedRoom {

    @Id
    @GeneratedValue(generator="seq-switched-room")
    @SequenceGenerator(name="seq-switched-room",sequenceName="seq-switched-room", allocationSize=1)
    private Long id;

    @ManyToOne
    private Room previousRoom;

    private Double previousPrice;
    private Double appliedPrice;

    @ManyToOne
    private Room newRoom;

    @ManyToOne()
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    private LocalDateTime switchTime;

    private String reason;


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
