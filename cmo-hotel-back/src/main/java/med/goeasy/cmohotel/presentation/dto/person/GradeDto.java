package med.goeasy.cmohotel.presentation.dto.person;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Grade;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record GradeDto(
        Long id,
        String code,
        String name,
        Integer rating,
        EGradeCategory category

) {
    public static GradeDto mapToDto(Grade entity) {
        if (entity == null)
            return null;
        return GradeDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .rating(entity.getRating())
                .category(entity.getCategory())
                .build();
    }
}
