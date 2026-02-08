package med.goeasy.cmohotel.presentation.dto.pavillon;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Pavillon;

import java.util.Map;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PavillonResponseDto(
        Long id,
        String name,
        String email,
        String phoneNumber,
        Integer starsNumber,
        String description,
        Map<String,Long> roomCount
) {
        public static PavillonResponseDto mapToDto(Pavillon entity){
                if (entity == null)
                        return null;
                return PavillonResponseDto.builder()
                        .id(entity.getId())
                        .name(entity.getName())
                        .email(entity.getEmail())
                        .phoneNumber(entity.getPhoneNumber())
                        .starsNumber(entity.getStarsNumber())
                        .description(entity.getDescription())
                        .build();
        }

        public static PavillonResponseDto mapToDto(Pavillon entity, Map<String,Long> roomCount){
                if (entity == null)
                        return null;
                return PavillonResponseDto.builder()
                        .id(entity.getId())
                        .name(entity.getName())
                        .email(entity.getEmail())
                        .phoneNumber(entity.getPhoneNumber())
                        .starsNumber(entity.getStarsNumber())
                        .description(entity.getDescription())
                        .roomCount(roomCount)
                        .build();
        }
}
