package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.Prestation;
import med.goeasy.cmohotel.persistence.repository.PersonRepository;
import med.goeasy.cmohotel.persistence.repository.PrestationRepository;
import med.goeasy.cmohotel.presentation.dto.restauration.PrestationRequestDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PrestationService {
    private final PrestationRepository prestationRepo;
    private final PersonRepository personRepo;
    private final MealService mealService;

    public Prestation createPrestation(PrestationRequestDto request) {

        Person person = personRepo.findById(request.getPersonId())
                .orElseThrow(() -> new RuntimeException("Personne introuvable"));

        BigDecimal price = mealService.getMealPriceForPerson(request.getMealType(), request.getPersonId());

        BigDecimal totalPrice = price.multiply(BigDecimal.valueOf(request.getQuantity()));

        Prestation prestation = Prestation.builder()
                .person(person)
                .mealType(request.getMealType())
                .quantity(request.getQuantity())
                .price(price.doubleValue())
                .totalPrice(totalPrice.doubleValue())
                .observation(request.getObservation())
                .createdAt(LocalDateTime.now())
                .archived(false)
                .build();

        return prestationRepo.save(prestation);
    }


    public List<Prestation> getAllPrestations() {
        return prestationRepo.findAll();
    }

    public Prestation updatePrestation(String id, PrestationRequestDto request) {
        Optional<Prestation> optionalPrestation = prestationRepo.findById(id);
        if (!optionalPrestation.isPresent()) {
            return null;
        }

        Prestation prestation = optionalPrestation.get();

         Person person = personRepo.findById(request.getPersonId())
                .orElseThrow(() -> new RuntimeException("Personne introuvable"));
        prestation.setPerson(person);

        prestation.setMealType(request.getMealType());
        prestation.setQuantity(request.getQuantity());
        prestation.setObservation(request.getObservation());

        BigDecimal price = mealService.getMealPriceForPerson(request.getMealType(), request.getPersonId());
        prestation.setPrice(price.doubleValue());
        prestation.setTotalPrice(price.multiply(BigDecimal.valueOf(request.getQuantity())).doubleValue());

        return prestationRepo.save(prestation);
    }

     public boolean deletePrestation(String id) {
        if (!prestationRepo.existsById(id)) {
            return false;
        }
        prestationRepo.deleteById(id);
        return true;
    }

}
