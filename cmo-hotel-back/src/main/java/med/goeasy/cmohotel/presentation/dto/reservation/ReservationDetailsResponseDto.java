package med.goeasy.cmohotel.presentation.dto.reservation;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.ReservationDetails;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.presentation.dto.person.GradeDto;
import med.goeasy.cmohotel.presentation.dto.person.PersonResponseDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReservationDetailsResponseDto(
        Long code,
        EReservationCategory category,
        LocalDate plannedStart,
        LocalDate plannedEnd,
        String createdBy,
        String lastModifiedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ReservationDetailsResponseDto mapToDto(ReservationDetails entity){
        if (entity == null)
            return null;
        return ReservationDetailsResponseDto.builder()
                .code(entity.getCode())
                .category(entity.getCategory())
                .plannedStart(entity.getPlannedStart())
                .plannedEnd(entity.getPlannedEnd())
                .createdBy(entity.getCreatedBy())
                .lastModifiedBy(entity.getLastModifiedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
