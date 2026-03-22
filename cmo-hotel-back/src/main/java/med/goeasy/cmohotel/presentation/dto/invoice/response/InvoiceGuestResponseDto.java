package med.goeasy.cmohotel.presentation.dto.invoice.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.InvoiceGuest;
import med.goeasy.cmohotel.persistence.entity.enums.EGuestRole;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record InvoiceGuestResponseDto(
        Long id,
        String personId,
        String gradeCode,
        String identity,
        String firstName,
        String lastName,
        String matricule,
        String unite,
        String nationality,
        EGuestRole role
) {
    public static InvoiceGuestResponseDto mapToDto(InvoiceGuest entity) {
        if (entity == null)
            return null;
        return InvoiceGuestResponseDto.builder()
                .id(entity.getId())
                .personId(entity.getPersonId())
                .gradeCode(entity.getGradeCode())
                .identity(entity.getIdentity())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .matricule(entity.getMatricule())
                .unite(entity.getUnite())
                .role(entity.getRole())
                .nationality(entity.getNationality())
                .build();
    }
}
