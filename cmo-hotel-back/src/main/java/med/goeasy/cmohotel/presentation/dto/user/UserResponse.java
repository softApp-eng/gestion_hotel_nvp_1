package med.goeasy.cmohotel.presentation.dto.user;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.auth.AppPermission;
import med.goeasy.cmohotel.persistence.entity.auth.AppRole;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.presentation.dto.role.RoleResponse;

import java.util.Set;
import java.util.stream.Collectors;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserResponse(
        String userid,
        String username,
        String firstName,
        String lastName,
        String avatar,
        Boolean status,
        boolean isSystem,
        Set<String> roles,
        Set<String> permissions,
        Set<RoleResponse> rolesDto
) {
    public static UserResponse mapToUserResponse(AppUser appUser){
        if (appUser == null)
            return null;
        return UserResponse.builder()
                .lastName(appUser.getLastName())
                .firstName(appUser.getFirstName())
                .username(appUser.getUsername())
                .isSystem(appUser.isSystem())
                .roles( appUser.getRoles() == null ? Set.of() :
                        appUser.getRoles().stream().map(AppRole::getName).collect(Collectors.toSet())
                )
                .permissions( appUser.getPermissions() == null ? Set.of() :
                        appUser.getPermissions().stream().map(AppPermission::getName).collect(Collectors.toSet()))
                .build();
    }

    public static UserResponse mapToDto(AppUser user){
        if (user == null)
            return null;
        return UserResponse.builder()
                .userid(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatar(user.getAvatar())
                .status(user.getAccountStatus())
                .isSystem(user.isSystem())
                .rolesDto(
                        user.getRoles() == null ? Set.of() :
                                user.getRoles().stream().map(RoleResponse::mapToDto).collect(Collectors.toSet())
                )
                .build();
    }
}
