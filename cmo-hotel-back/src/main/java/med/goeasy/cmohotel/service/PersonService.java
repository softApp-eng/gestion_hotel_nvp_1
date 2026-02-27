package med.goeasy.cmohotel.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.enums.ERelationshipType;
import med.goeasy.cmohotel.persistence.repository.PersonRepository;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.person.PersonRequestDto;
import med.goeasy.cmohotel.presentation.dto.person.PersonResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class PersonService {

    private final PersonRepository personRepository;
    private final CommonService commonService;
    private final ActivityLogService activityLogService;
    private final HttpServletRequest request;

    @Transactional
    public PersonResponseDto create(Authentication authentication, PersonRequestDto dto) {
        Person person = PersonRequestDto.mapToEntity(dto);
        if (dto.primaryPersonId() != null && !dto.primaryPersonId().isBlank()) {
            // then the person has a primary person
            if (person.getPrimaryPerson() != null && person.getRelationshipType() == null)
                throw new BadRequestException("Type de relation obligatoire");
            Person primaryPerson = getPersonById(dto.primaryPersonId());
            person.setPrimaryPerson(primaryPerson);
            person.setRelationshipType(ERelationshipType.valueOf(dto.relationshipType()));
        }

        person.setGrade(
                commonService.getGradeById(dto.gradeId())
        );
//        if (person.getPrimaryPerson() != null) {
//            person.setPrimaryPerson(getPersonById(dto.primaryPersonId()));
//        }
        person.setArchived(false);
        person = personRepository.save(person);
        activityLogService.logActivity(
                EAuditActionTarget.PERSON,
                EAuditActionOperation.CREATE,
                String.format("Enregistrement de l'invité '%s %s' (Grade: %s), (Identité: %s)",
                        person.getFirstName(), person.getLastName(), person.getGrade().getName(),person.getIdentity()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
        return PersonResponseDto.mapToDto(
                person
        );
    }

    public PageDto<PersonResponseDto> searchWithReservation(Authentication authentication,String key,Integer page,Integer size) {
        Page<Person> persons = personRepository.searchWithReservation(key.toUpperCase(), PageRequest.of(page, size));
        List<PersonResponseDto> list = persons.stream().map(PersonResponseDto::mapToDto).toList();
        log.info("{} get persons", authentication.getName());
        return PageDto.of(
                list,
                persons.getTotalElements(),
                persons.getTotalPages()
        );
    }

    @Transactional
    public PersonResponseDto update(Authentication authentication, PersonRequestDto dto,String personId) {
        Person personDb = getPersonById(personId);
        Person person = PersonRequestDto.mapToEntity(dto);
        person.setPrimaryPerson(personDb.getPrimaryPerson());
        person.setRelationshipType(personDb.getRelationshipType());
        person.setGrade(
                commonService.getGradeById(dto.gradeId())
        );
        person.setArchived(false);
        person.setId(personDb.getId());

        person = personRepository.save(person);
        activityLogService.logActivity(
                EAuditActionTarget.PERSON,
                EAuditActionOperation.UPDATE,
                String.format("Mise à jour des informations de l'invité '%s %s' (Grade: %s), (Identité: %s).",
                        person.getFirstName(), person.getLastName(), person.getGrade().getName(),person.getIdentity()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
        return PersonResponseDto.mapToDto(
                person
        );
    }

    public PageDto<PersonResponseDto> search(Authentication authentication,String key,Integer page,Integer size) {
        Page<Person> persons = personRepository.search(key.toUpperCase(), PageRequest.of(page, size));
        List<PersonResponseDto> list = persons.stream().map(PersonResponseDto::mapToDto).toList();
        log.info("{} get persons", authentication.getName());
        return PageDto.of(
                list,
                persons.getTotalElements(),
                persons.getTotalPages()
        );
    }

    public PersonResponseDto findById(Authentication authentication,String personId) {
        log.info("{} loads person with id {}", authentication.getName(), personId);
        return PersonResponseDto.mapToDto(
                getPersonById(personId)
        );
    }

    @Transactional
    public void delete(Authentication authentication,String personId) {
        Person person = getPersonById(personId);
        // TODO if person has reservation history archive it otherwise delete it
        person.setArchived(true);
        personRepository.save(person);
        activityLogService.logActivity(
                EAuditActionTarget.PERSON,
                EAuditActionOperation.DELETE,
                String.format("Supprission de l'invité '%s %s', (Grade: %s), (Identité: %s).",
                        person.getFirstName(), person.getLastName(),person.getGrade().getName(),person.getIdentity()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    protected Person getPersonById(String id){
        return personRepository.findById(id)
                .orElseThrow(()-> new BadRequestException("Person n'existe pas"));
    }
}
