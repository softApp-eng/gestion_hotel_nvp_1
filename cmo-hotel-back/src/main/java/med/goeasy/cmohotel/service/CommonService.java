package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.Grade;
import med.goeasy.cmohotel.persistence.entity.enums.*;
import med.goeasy.cmohotel.persistence.repository.GradeRepository;
import med.goeasy.cmohotel.presentation.dto.common.EnumsDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class CommonService {

    private final GradeRepository gradeRepository;

    public Grade getGradeById(Long id){
        return gradeRepository.findById(id)
                .orElseThrow(()-> new BadRequestException("Grade n'existe pas"));
    }

    public List<Grade> getGrades(){
        return gradeRepository.getGrades();
    }

    public List<EnumsDto> getEnumsData(String enm){
        List<EnumsDto> enumsDtos = new ArrayList<>();
        return switch (enm) {
            case "grade-categories" -> Arrays.stream(EGradeCategory.values()).map(e -> EnumsDto.builder()
                    .code(e.name())
                    .name(e.getName())
                    .description(e.getDescription())
                    .build()).toList();
            case "guest-roles" -> Arrays.stream(EGuestRole.values()).map(e -> EnumsDto.builder()
                    .code(e.name())
                    .name(e.getName())
                    .description(e.getDescription())
                    .build()).toList();
            case "relationships" -> Arrays.stream(ERelationshipType.values()).map(e -> EnumsDto.builder()
                    .code(e.name())
                    .name(e.getName())
                    .description(e.getDescription())
                    .build()).toList();
            case "reservation-categories" -> Arrays.stream(EReservationCategory.values()).map(e -> EnumsDto.builder()
                    .code(e.name())
                    .name(e.getName())
                    .description(e.getDescription())
                    .build()).toList();
            case "reservation-status" -> Arrays.stream(EReservationStatus.values()).map(e -> EnumsDto.builder()
                    .code(e.name())
                    .name(e.getName())
                    .description(e.getDescription())
                    .build()).toList();
            default -> enumsDtos;
        };
    }

}
