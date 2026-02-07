package med.goeasy.cmohotel.presentation.dto.role;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoleRequestDto(
        String title,
        String description,
        List<String> permissions
) {

}
