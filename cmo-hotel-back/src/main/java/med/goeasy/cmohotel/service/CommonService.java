package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.Grade;
import med.goeasy.cmohotel.persistence.repository.GradeRepository;
import org.springframework.stereotype.Service;

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

}
