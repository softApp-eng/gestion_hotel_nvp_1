package med.goeasy.cmohotel.presentation.dto.person;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.enums.ERelationshipType;
import org.apache.commons.lang3.EnumUtils;

import java.time.LocalDate;

public record PersonRequestDto(
        @NotNull(message = "Grade obligatoire")
        Long gradeId,
        String primaryPersonId,
        String relationshipType,
        @NotBlank(message = "Identité obligatoire")
        String identity,
        @NotBlank(message = "Nom obligatoire")
        String firstName,
        @NotBlank(message = "Prénom obligatoire")
        String lastName,
        String gender,
        String email,
        //@NotNull(message = "Date de naissance obligatoire")
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDate birthDate,
        String phoneNumber,
        String nationality,
        String language,
        String matricule,
        String unite,
        String observation

) {
        public static Person mapToEntity(PersonRequestDto dto){
                if (dto == null)
                        return null;
                ERelationshipType relType = null;

                // Vérification sécurisée avec EnumUtils
                if (dto.relationshipType() != null && !dto.relationshipType().isBlank()) {
                        if (!EnumUtils.isValidEnum(ERelationshipType.class, dto.relationshipType())) {
                                throw new BadRequestException("Type de relation invalide : " + dto.relationshipType());
                        }
                        relType = ERelationshipType.valueOf(dto.relationshipType());
                }
                return Person.builder()
                        .relationshipType(relType)
                        .identity(dto.identity())
                        .firstName(dto.firstName())
                        .lastName(dto.lastName())
                        .gender(dto.gender())
                        .email(dto.email())
                        .birthDate(dto.birthDate())
                        .phoneNumber(dto.phoneNumber())
                        .nationality(dto.nationality())
                        .language(dto.language())
                        .matricule(dto.matricule())
                        .unite(dto.unite())
                        .observation(dto.observation())
                        .build();
        }
}
