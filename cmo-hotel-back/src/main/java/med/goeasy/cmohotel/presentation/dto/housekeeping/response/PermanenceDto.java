package med.goeasy.cmohotel.presentation.dto.housekeeping.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Permanence;

import java.time.LocalDate;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PermanenceDto(
        Long id,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
        LocalDate date,
        HousekeepingAgentResponseDto agent
) {
    public static PermanenceDto mapToDto(Permanence entity) {
        if (entity == null) {
            return null;
        }
        return PermanenceDto.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .agent(HousekeepingAgentResponseDto.mapToDto(entity.getAgent()))
                .build();
    }
}
