package med.goeasy.cmohotel.presentation.dto.prestation;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Prestation;
import med.goeasy.cmohotel.persistence.entity.Reservation;
import med.goeasy.cmohotel.presentation.dto.person.PersonResponseDto;
import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PrestationResponseDto(
        String reservationId,
        PersonResponseDto person,
        List<PrestationDetailsResponseDto> prestations
) {
    public static PrestationResponseDto mapToDto(Reservation entity, List<Prestation> prestations) {
        if (entity == null)
            return null;
        return PrestationResponseDto.builder()
                .reservationId(entity.getId())
                .person(PersonResponseDto.mapToDto(entity.getPerson()))
                .prestations(
                        prestations == null ? null :
                                prestations.stream()
                                        .map(p -> PrestationDetailsResponseDto.mapToDto(p, entity.getPerson()))
                                        .toList())
                .build();
    }
}
