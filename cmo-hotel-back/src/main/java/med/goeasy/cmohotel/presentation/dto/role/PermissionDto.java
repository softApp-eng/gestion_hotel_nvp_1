package med.goeasy.cmohotel.presentation.dto.role;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.auth.AppPermission;
import med.goeasy.cmohotel.persistence.entity.enums.EPermissionsGroup;
import med.goeasy.cmohotel.persistence.entity.enums.EPermissionsModule;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PermissionDto(
        String id,
        String name,
        String title,
        EPermissionsModule module,
        String moduleExpandedName,
        EPermissionsGroup groupe,
        String description,
        boolean affectable
) {
    public static PermissionDto mapToDto(AppPermission entity){
        if (entity == null)
            return null;
        return PermissionDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .affectable(entity.isAffectable())
                .module(entity.getModule())
                .moduleExpandedName(entity.getModule().getExpendedName())
                .groupe(entity.getGroupe())
                .build();
    }
}
