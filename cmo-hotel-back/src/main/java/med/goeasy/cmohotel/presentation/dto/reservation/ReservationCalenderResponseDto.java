package med.goeasy.cmohotel.presentation.dto.reservation;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.ReservationDetails;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReservationCalenderResponseDto(
        Long code,
        EReservationStatus status,
        EReservationCategory category,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDateTime start,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDateTime end,
        List<ReservationResponseDto> guests,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        List<LocalDate> missingNights,
        String observation
) {
    public static ReservationCalenderResponseDto mapToDto(ReservationDetails entity){
        return mapWithMissingNights(entity, null);
    }

    public static ReservationCalenderResponseDto mapWithMissingNights(ReservationDetails entity, List<LocalDate> missingNights){
        if (entity == null)
            return null;
        return ReservationCalenderResponseDto.builder()
                .code(entity.getCode())
                .guests(entity.getReservations().stream().map(ReservationResponseDto::mapToDto).toList())
                .category(entity.getCategory())
                .status(entity.getStatus())
                .start(entity.getCheckin() != null ? entity.getCheckin():entity.getPlannedStart())
                .end(entity.getCheckout() != null ? entity.getCheckout():entity.getPlannedEnd())
                .missingNights(missingNights)
                .observation(entity.getObservation())
                .build();
    }
}
