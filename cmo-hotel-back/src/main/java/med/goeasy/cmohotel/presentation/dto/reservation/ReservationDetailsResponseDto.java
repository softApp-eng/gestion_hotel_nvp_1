package med.goeasy.cmohotel.presentation.dto.reservation;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.ReservationDetails;
import med.goeasy.cmohotel.persistence.entity.ValidatedNight;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.presentation.dto.invoice.response.ValidatedNightResponseDto;
import med.goeasy.cmohotel.presentation.dto.person.GradeDto;
import med.goeasy.cmohotel.presentation.dto.person.PersonResponseDto;
import med.goeasy.cmohotel.utils.MissingNights;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReservationDetailsResponseDto(
        Long code,
        EReservationStatus status,
        EReservationCategory category,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDateTime plannedStart,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDateTime plannedEnd,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd hh:mm")
        LocalDateTime checkin,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd hh:mm")
        LocalDateTime checkout,
        List<ReservationResponseDto> guests,
        String createdBy,
        boolean priseEnCharge,
        String priseEnChargeReference,
        String lastModifiedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String observation,
        List<ValidatedNightResponseDto> validatedNights,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        List<LocalDate> missingNights
) {
    public static ReservationDetailsResponseDto mapToDto(ReservationDetails entity){
        if (entity == null)
            return null;
        return ReservationDetailsResponseDto.builder()
                .code(entity.getCode())
                .guests(entity.getReservations().stream().map(ReservationResponseDto::mapToDto).toList())
                .category(entity.getCategory())
                .plannedStart(entity.getPlannedStart())
                .plannedEnd(entity.getPlannedEnd())
                .checkin(entity.getCheckin())
                .checkout(entity.getCheckout())
                .createdBy(entity.getCreatedBy())
                .lastModifiedBy(entity.getLastModifiedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .status(entity.getStatus())
                .observation(entity.getObservation())
                .priseEnCharge(entity.isPriseEnCharge())
                .priseEnChargeReference(entity.getPriseEnChargeReference())
                .build();
    }

    public static ReservationDetailsResponseDto mapWithValidatedNightToDto(ReservationDetails entity, List<ValidatedNight> nights){
        if (entity == null)
            return null;
        if (nights == null) nights = new ArrayList<>();
        return ReservationDetailsResponseDto.builder()
                .code(entity.getCode())
                .guests(entity.getReservations().stream().map(ReservationResponseDto::mapToDto).toList())
                .category(entity.getCategory())
                .plannedStart(entity.getPlannedStart())
                .plannedEnd(entity.getPlannedEnd())
                .checkin(entity.getCheckin())
                .checkout(entity.getCheckout())
                .createdBy(entity.getCreatedBy())
                .lastModifiedBy(entity.getLastModifiedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .status(entity.getStatus())
                .observation(entity.getObservation())
                .priseEnCharge(entity.isPriseEnCharge())
                .priseEnChargeReference(entity.getPriseEnChargeReference())
                .validatedNights(
                        nights.stream().map(ValidatedNightResponseDto::mapToDto).toList()
                )
                .missingNights(MissingNights.of(
                        entity.getCheckin(),
                        entity.getCheckout(),
                        nights.stream().map(ValidatedNight::getNightDate).toList()
                ))
                .build();
    }

    public static ReservationDetailsResponseDto mapToDtoWithoutGuests(ReservationDetails entity){
        if (entity == null)
            return null;
        return ReservationDetailsResponseDto.builder()
                .code(entity.getCode())
                .category(entity.getCategory())
                .plannedStart(entity.getPlannedStart())
                .plannedEnd(entity.getPlannedEnd())
                .checkin(entity.getCheckin())
                .checkout(entity.getCheckout())
                .createdBy(entity.getCreatedBy())
                .lastModifiedBy(entity.getLastModifiedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .status(entity.getStatus())
                .observation(entity.getObservation())
                .priseEnCharge(entity.isPriseEnCharge())
                .priseEnChargeReference(entity.getPriseEnChargeReference())
                .build();
    }
}
