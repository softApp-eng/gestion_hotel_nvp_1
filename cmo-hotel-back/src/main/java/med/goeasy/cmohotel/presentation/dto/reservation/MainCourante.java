package med.goeasy.cmohotel.presentation.dto.reservation;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MainCourante {
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd hh:mm")
    private LocalDateTime checkin;
    private Long reservationCode;
    private String category;
    private String grade;
    private String client;
    private String roomCode;
    private String pavillon;
    private Double roomPrice;
    private Integer validatedNightsNumber;
    private String unite;
}
