package med.goeasy.cmohotel.presentation.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record EnumsDto(
        String code,
        String name,
        String description
) {
}
