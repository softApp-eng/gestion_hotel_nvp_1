package med.goeasy.cmohotel.presentation.dto.prestation;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Prestation;
import med.goeasy.cmohotel.persistence.entity.Reservation;
import med.goeasy.cmohotel.persistence.entity.enums.EGuestRole;
import med.goeasy.cmohotel.presentation.dto.person.PersonResponseDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationDetailsResponseDto;
import med.goeasy.cmohotel.presentation.dto.room.RoomResponseDto;

import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PrestationResponseDto(
        String reservationId,
        EGuestRole role,
        ReservationDetailsResponseDto details,
        RoomResponseDto room,
        PersonResponseDto person,
        List<PrestationDetailsResponseDto> prestations
) {
    public static PrestationResponseDto mapToDto(Reservation entity, List<Prestation> prestations) {
        if (entity == null)
            return null;
        return PrestationResponseDto.builder()
                .reservationId(entity.getId())
                .role(entity.getRole())
                .details(ReservationDetailsResponseDto.mapToDtoWithoutGuests(entity.getDetails()))
                .person(PersonResponseDto.mapToDto(entity.getPerson()))
                .prestations(
                        prestations == null ? null :
                                prestations.stream()
                                        .map(PrestationDetailsResponseDto::mapToDto)
                                        .toList())
                .room(
                        RoomResponseDto.mapToDto(
                                entity.getRoom()
                        )
                )
                .build();
    }
}
