package med.goeasy.cmohotel.presentation.dto.housekeeping.request;

import jakarta.validation.constraints.NotBlank;
import med.goeasy.cmohotel.persistence.entity.HousekeepingAgent;

public record HousekeepingAgentRequestDto(
        @NotBlank(message = "nom obligatoire")
        String firstName,
        @NotBlank(message = "Prenom obligatoire")
        String lastName,
        String phone
) {
        public static HousekeepingAgent mapToEntity(HousekeepingAgentRequestDto dto){
                if (dto == null)
                        return null;
                return HousekeepingAgent.builder()
                        .firstName(dto.firstName())
                        .lastName(dto.lastName())
                        .phone(dto.phone())
                        .build();
        }
}
