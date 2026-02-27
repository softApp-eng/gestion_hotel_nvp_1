package med.goeasy.cmohotel.persistence.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class AppConfiguration {

    @Id
    @GeneratedValue(generator="seq-app-config")
    @SequenceGenerator(name="seq-app-config",sequenceName="seq-app-config", allocationSize=1)
    private Long id;

    private String autoCleaningRoomTimeCronExpression;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime checkoutTime;


}
