package med.goeasy.cmohotel.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.MealPrice;
import med.goeasy.cmohotel.persistence.entity.MealType;
import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;
import med.goeasy.cmohotel.persistence.repository.MealPriceRepository;
import med.goeasy.cmohotel.persistence.repository.MealTypeRepository;
import med.goeasy.cmohotel.persistence.repository.PersonRepository;
import med.goeasy.cmohotel.presentation.dto.meal.MealPriceRequestDto;
import med.goeasy.cmohotel.presentation.dto.meal.MealPriceResponseDto;
import med.goeasy.cmohotel.presentation.dto.meal.MealTypeRequestDto;
import med.goeasy.cmohotel.presentation.dto.meal.MealTypeResponseDto;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class MealService {

    private final MealTypeRepository mealTypeRepo;
    private final MealPriceRepository mealPriceRepo;
    private final PersonRepository personRepository;
    private final ActivityLogService activityLogService;
    private final HttpServletRequest request;

    /// /////////////////////////////////////////////////////////////////////////////
    ///                               MEALS TYPES                                 ///
    /// /////////////////////////////////////////////////////////////////////////////


    public List<MealTypeResponseDto> allTypes(){
        log.info("get all meal types");
        return mealTypeRepo.findAllMeals().stream().map(MealTypeResponseDto::mapToDto).toList();
    }

    @Transactional
    public void createMealType(Authentication authentication, MealTypeRequestDto dto) {
        if (mealTypeRepo.existsByName(dto.getName())) {
            throw new BadRequestException("Type de repas déja existe");
        }
        mealTypeRepo.save(
                MealType.builder()
                        .name(dto.getName())
                        .description(dto.getDescription())
                        .build()
        );
        activityLogService.logActivity(
                EAuditActionTarget.MEAL,
                EAuditActionOperation.CREATE,
                String.format("Définition d'un nouveau type de repas : '%s'.", dto.getName()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void updateType(Authentication authentication, Long id, MealTypeRequestDto dto) {
        // check if the name already exist
        if (mealTypeRepo.existsByNameAndIdNot(dto.getName(),id)) {
            throw new BadRequestException("Type de repas déja existe");
        }
        MealType mealTypeDb = getMealTypeById(id);
        mealTypeDb.setName(dto.getName());
        mealTypeDb.setDescription(dto.getDescription());
        mealTypeRepo.save(mealTypeDb);
        activityLogService.logActivity(
                EAuditActionTarget.MEAL,
                EAuditActionOperation.UPDATE,
                String.format("Mise à jour du type du repas : '%s' (id: *%d).", mealTypeDb.getName(),mealTypeDb.getId()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    public void delete(Long id) { // TODO delete type
        //typeRepo.deleteById(id);
    }


    /// /////////////////////////////////////////////////////////////////////////////
    ///                               MEALS PRICES                                ///
    /// /////////////////////////////////////////////////////////////////////////////

    public List<MealPriceResponseDto> getPricesByType(Authentication auth, Long typeId) {
        log.info("{} get meal prices by type {}", auth.getName(), typeId);
        return mealPriceRepo.findAllByMealType_Id(typeId)
                .stream()
                .map(MealPriceResponseDto::mapToDto)
                .toList();
    }

    public MealPriceResponseDto getOne(Authentication auth, Long id) {
        log.info("{} get meal price {}", auth.getName(), id);
        return MealPriceResponseDto.mapToDto(getMealPriceById(id));
    }


    @Transactional
    public void createPrice(Authentication authentication, MealPriceRequestDto dto) {
        if (mealPriceRepo.existsByMealType_IdAndCategory(dto.mealTypeId(), dto.category())) {
            throw new BadRequestException("Prix déjà existant");
        }

        MealType type = getMealTypeById(dto.mealTypeId());
        MealPrice price = MealPrice.builder()
                .mealType(type)
                .category(dto.category())
                .price(dto.price())
                .build();

        mealPriceRepo.save(price);
        activityLogService.logActivity(
                EAuditActionTarget.MEAL,
                EAuditActionOperation.CREATE,
                String.format("Nouveau tarif configuré : %.2f MAD pour le type '%s' (Catégorie: %s).",
                        price.getPrice(), type.getName(), price.getCategory()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void updatePrice(Authentication authentication, MealPriceRequestDto dto, Long id) {

        if (mealPriceRepo.existsByMealType_IdAndCategoryAndIdNot(
                dto.mealTypeId(), dto.category(), id)) {
            throw new BadRequestException("Prix déjà existant");
        }

        MealPrice db = getMealPriceById(id);
        MealType type = getMealTypeById(dto.mealTypeId());
        BigDecimal oldPrice = db.getPrice();
        db.setMealType(type);
        db.setCategory(dto.category());
        db.setPrice(dto.price());

        mealPriceRepo.save(db);
        activityLogService.logActivity(
                EAuditActionTarget.ROOM_PRICE,
                EAuditActionOperation.UPDATE,
                String.format("Changement de tarif pour '%s' (%s) : %.2f MAD -> %.2f MAD.",
                        type.getName(), db.getCategory(), oldPrice, dto.price()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void delete(Authentication authentication, Long id) {
        MealPrice p = getMealPriceById(id);
        mealPriceRepo.delete(p);
        activityLogService.logActivity(
                EAuditActionTarget.ROOM_PRICE,
                EAuditActionOperation.DELETE,
                String.format("Suppression du tarif %.2f MAD pour le type '%s'.",
                        p.getPrice(), p.getMealType()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    public BigDecimal  getMealPriceForPerson(String mealType, String personId) { // TODO check

        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new RuntimeException("Personne introuvable"));


        EGradeCategory category = person.getGrade().getCategory();


        return mealPriceRepo.findByMealTypeAndCategory(mealType, category)
                .map(MealPrice::getPrice)
                .orElse(BigDecimal.ZERO);
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    protected MealType getMealTypeById(Long id){
        return mealTypeRepo.findById(id)
                .orElseThrow(()-> new BadRequestException("Type de repas n'existe pas"));
    }

    protected MealPrice getMealPriceById(Long id){
        return mealPriceRepo.findById(id)
                .orElseThrow(()-> new BadRequestException("Prix de repas n'existe pas"));
    }

}

