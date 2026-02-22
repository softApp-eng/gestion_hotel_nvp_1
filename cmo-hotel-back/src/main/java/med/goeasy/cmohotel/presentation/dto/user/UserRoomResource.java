package med.goeasy.cmohotel.presentation.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.util.Set;

@Builder
public record UserRoomResource(
        @NotBlank(message = "Utilisateur id requis")
        String userid,
        Set<Long> rooms
) {

}
