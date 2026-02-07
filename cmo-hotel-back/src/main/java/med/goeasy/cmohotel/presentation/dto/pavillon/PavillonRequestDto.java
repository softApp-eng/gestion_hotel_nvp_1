package med.goeasy.cmohotel.presentation.dto.pavillon;

import jakarta.validation.constraints.NotBlank;
import med.goeasy.cmohotel.persistence.entity.Pavillon;

public record PavillonRequestDto(
        @NotBlank(message = "nom obligatoire")
        String name,
        String email,
        String phoneNumber
) {
        public static Pavillon mapToEntity(PavillonRequestDto dto){
                if (dto == null)
                        return null;
                return Pavillon.builder()
                        .name(dto.name())
                        .email(dto.email())
                        .phoneNumber(dto.phoneNumber())
                        .build();
        }
}
