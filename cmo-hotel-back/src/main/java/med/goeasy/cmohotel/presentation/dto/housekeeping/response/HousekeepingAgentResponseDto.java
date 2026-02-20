package med.goeasy.cmohotel.presentation.dto.housekeeping.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.HousekeepingAgent;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record HousekeepingAgentResponseDto(
        Long id,
        String firstName,
        String lastName,
        String phone
) {
        public static HousekeepingAgentResponseDto mapToDto(HousekeepingAgent entity){
                if (entity == null)
                        return null;
                return HousekeepingAgentResponseDto.builder()
                        .id(entity.getId())
                        .firstName(entity.getFirstName())
                        .lastName(entity.getLastName())
                        .phone(entity.getPhone())
                        .build();
        }
}
