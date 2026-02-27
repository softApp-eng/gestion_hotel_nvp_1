package med.goeasy.cmohotel.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import med.goeasy.cmohotel.presentation.dto.room.RoomPriceResponseDto;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.MealPrice;
import med.goeasy.cmohotel.persistence.entity.MealType;
import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.RoomType;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EMealType;
import med.goeasy.cmohotel.persistence.repository.MealPriceRepository;
import med.goeasy.cmohotel.persistence.repository.MealTypeRepository;
import med.goeasy.cmohotel.persistence.repository.PersonRepository;
import med.goeasy.cmohotel.presentation.dto.restauration.meal.MealPriceRequestDto;
import med.goeasy.cmohotel.presentation.dto.restauration.meal.MealPriceResponseDto;
import med.goeasy.cmohotel.presentation.dto.restauration.meal.MealTypeRequestDto;
import med.goeasy.cmohotel.presentation.dto.restauration.meal.MealTypeResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
        if (mealTypeRepo.existsByMealType(dto.getMealType())) {
            throw new BadRequestException("Type de repas déja existe");
        }
        mealTypeRepo.save(
                MealType.builder()
                        .mealType(dto.getMealType())
                        .description(dto.getDescription())
                        .build()
        );
        activityLogService.logActivity(
                EAuditActionTarget.MEAL,
                EAuditActionOperation.CREATE,
                String.format("Définition d'un nouveau type de repas : '%s'.", dto.getMealType()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void updateType(Authentication authentication, Long id, MealTypeRequestDto dto) {
        // check if the name already exist
        if (mealTypeRepo.existsByMealTypeAndIdNot(dto.getMealType(),id)) {
            throw new BadRequestException("Type de repas déja existe");
        }
        MealType mealTypeDb = getMealTypeById(id);
        mealTypeDb.setMealType(dto.getMealType());
        mealTypeDb.setDescription(dto.getDescription());
        mealTypeRepo.save(mealTypeDb);
        activityLogService.logActivity(
                EAuditActionTarget.MEAL,
                EAuditActionOperation.UPDATE,
                String.format("Mise à jour du type du repas : '%s' (id: *%d).", mealTypeDb.getMealType(),mealTypeDb.getId()),
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
                        price.getPrice(), type.getMealType(), price.getCategory()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    // ================= UPDATE =================

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
                        type.getMealType(), db.getCategory(), oldPrice, dto.price()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    // ================= DELETE =================

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

    public BigDecimal  getMealPriceForPerson(EMealType mealType, String personId) { // TODO check

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

