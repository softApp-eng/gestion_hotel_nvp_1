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
public class RoomType {

    @Id
    @GeneratedValue(generator="seq-room-type")
    @SequenceGenerator(name="seq-room-type",sequenceName="seq-room-type", allocationSize=1)
    private Long id;

    @Column(unique = true, nullable = false)
    private String type;

    private String description;

//    @ManyToMany(fetch = FetchType.LAZY)
//    @JoinTable(
//            name = "room_type_prices",
//            joinColumns = @JoinColumn(name = "type_id"),
//            inverseJoinColumns = @JoinColumn(name = "price_id")
//    )
//    private List<RoomPrice> prices;

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
