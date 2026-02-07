package med.goeasy.cmohotel.presentation.dto.person;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.enums.ERelationshipType;

import java.time.LocalDate;
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PersonResponseDto(
        String id,
        GradeDto grade,
        PersonResponseDto primaryPerson,
        ERelationshipType relationshipType,
        String identity,
        String firstName,
        String lastName,
        String gender,
        String email,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate birthDate,
        String phoneNumber,
        String nationality,
        String language,
        String matricule,
        String unite,
        String observation

) {
        public static PersonResponseDto mapToDto(Person entity){
                if (entity == null)
                        return null;
                return PersonResponseDto.builder()
                        .id(entity.getId())
                        .grade(GradeDto.mapToDto(entity.getGrade()))
                        .primaryPerson(PersonResponseDto.mapToDto(entity.getPrimaryPerson()))
                        .relationshipType(entity.getRelationshipType())
                        .identity(entity.getIdentity())
                        .firstName(entity.getFirstName())
                        .lastName(entity.getLastName())
                        .gender(entity.getGender())
                        .email(entity.getEmail())
                        .birthDate(entity.getBirthDate())
                        .phoneNumber(entity.getPhoneNumber())
                        .nationality(entity.getNationality())
                        .language(entity.getLanguage())
                        .matricule(entity.getMatricule())
                        .unite(entity.getUnite())
                        .observation(entity.getObservation())
                        .build();
        }
}
