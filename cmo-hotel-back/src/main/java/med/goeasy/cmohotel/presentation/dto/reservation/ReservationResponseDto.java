package med.goeasy.cmohotel.presentation.dto.reservation;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Reservation;
import med.goeasy.cmohotel.persistence.entity.enums.EGuestRole;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.presentation.dto.person.PersonResponseDto;
import med.goeasy.cmohotel.presentation.dto.room.RoomResponseDto;
import java.time.LocalDateTime;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReservationResponseDto(
        String id,
        PersonResponseDto person,
        EGuestRole role,
        RoomResponseDto room,
        LocalDateTime exceptionalCheckin,
        LocalDateTime exceptionalCheckout,
        EReservationStatus exceptionPersonStatus,
        String createdBy,
        String lastModifiedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ReservationResponseDto mapToDto(Reservation entity){
        if (entity == null)
            return null;
        return ReservationResponseDto.builder()
                .id(entity.getId())
                //.details(ReservationDetailsResponseDto.mapToDto(entity.getDetails()))
                .person(PersonResponseDto.mapToDto(entity.getPerson()))
                .role(entity.getRole())
                .room(RoomResponseDto.mapToDto(entity.getRoom()))
                .exceptionalCheckin(entity.getExceptionalCheckin())
                .exceptionalCheckout(entity.getExceptionalCheckout())
                .exceptionPersonStatus(entity.getExceptionPersonStatus())
                .createdBy(entity.getCreatedBy())
                .lastModifiedBy(entity.getLastModifiedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
