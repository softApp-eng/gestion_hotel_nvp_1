package med.goeasy.cmohotel.audit;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class ActivityLog {

    @Id
    @GeneratedValue(generator="seq-audit")
    @SequenceGenerator(name="seq-audit",sequenceName="seq-audit", allocationSize=1)
    private Long id;

    @Enumerated(EnumType.STRING)
    private EAuditActionTarget actionTarget;

    @Enumerated(EnumType.STRING)
    private EAuditActionOperation actionOperation;

    @Column(length = 500)
    private String message;

    private String username;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd hh:mm")
    private LocalDateTime timestamp;
    private String ipAddress;
}
