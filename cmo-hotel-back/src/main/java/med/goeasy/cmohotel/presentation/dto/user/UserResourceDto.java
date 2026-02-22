package med.goeasy.cmohotel.presentation.dto.user;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.auth.AppUserResource;
import med.goeasy.cmohotel.presentation.dto.room.RoomResponseDto;

import java.util.Set;
import java.util.stream.Collectors;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserResourceDto(
        Long id,
        UserResponse user,
        Set<RoomResponseDto> rooms
) {
    public static UserResourceDto mapToDto(AppUserResource entity){
        if (entity == null)
            return null;
        return UserResourceDto.builder()
                .id(entity.getId())
                .user(UserResponse.mapToShortDto(entity.getUser()))
                .rooms( entity.getRooms() == null ? Set.of() :
                        entity.getRooms().stream().map(RoomResponseDto::mapToDto).collect(Collectors.toSet())
                )
                .build();
    }
}
