package med.goeasy.cmohotel.persistence.entity.auth;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class AppToken {

    @Id
    @GeneratedValue(generator="seq-token")
    @SequenceGenerator(name="seq-token",sequenceName="seq-token", allocationSize=1)
    private Long id;

    @Column(nullable = false,unique = true)
    private String token;

    private boolean revoked;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser user;

    @CreatedDate
    private LocalDateTime createdAt;

}
