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
public class Room {

    @Id
    @GeneratedValue(generator="seq-room")
    @SequenceGenerator(name="seq-room",sequenceName="seq-room", allocationSize=1)
    private Long id;

    @ManyToOne
    private Pavillon pavillon;

    @ManyToOne
    private RoomType roomType;

    @Column(unique = true,nullable = false)
    private String code;
    private String name;

    private boolean clean;
    private boolean available;
    private boolean shared;

    @Column(nullable = false)
    private Integer capacity;
    private Integer floor;
    @Column(length = 500)
    private String description;

    private boolean archived;

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
