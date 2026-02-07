package med.goeasy.cmohotel.presentation.dto.pavillon;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Pavillon;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PavillonResponseDto(
        Long id,
        String name,
        String email,
        String phoneNumber
) {
        public static PavillonResponseDto mapToDto(Pavillon entity){
                if (entity == null)
                        return null;
                return PavillonResponseDto.builder()
                        .id(entity.getId())
                        .name(entity.getName())
                        .email(entity.getEmail())
                        .phoneNumber(entity.getPhoneNumber())
                        .build();
        }
}
