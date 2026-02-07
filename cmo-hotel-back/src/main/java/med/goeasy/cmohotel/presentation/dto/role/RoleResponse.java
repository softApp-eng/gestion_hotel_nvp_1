package med.goeasy.cmohotel.presentation.dto.role;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.auth.AppRole;

import java.util.List;
import java.util.stream.Collectors;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoleResponse(
        String id,
        String name,
        String title,
        String description,
        boolean isSystem,
        List<PermissionDto>  permissions
) {

    public static RoleResponse mapToDto(AppRole role){
        if (role == null)
            return null;
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .title(role.getTitle())
                .description(role.getDescription())
                .isSystem(role.isSystem())
                .build();
    }

    public static RoleResponse mapToDtoWithPermissions(AppRole role){
        if (role == null)
            return null;
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .title(role.getTitle())
                .description(role.getDescription())
                .isSystem(role.isSystem())
                .permissions(role.getPermissions().stream().map(PermissionDto::mapToDto).collect(Collectors.toList()))
                .build();
    }
}
