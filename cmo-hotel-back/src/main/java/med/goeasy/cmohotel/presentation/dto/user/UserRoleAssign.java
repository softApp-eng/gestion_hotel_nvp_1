package med.goeasy.cmohotel.presentation.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.Set;

@Builder
public record UserRoleAssign(
        @NotBlank(message = "Utilisateur id requis")
        String userid,
        @NotNull(message = "Roles requis")
        Set<String> roles
) {

}
