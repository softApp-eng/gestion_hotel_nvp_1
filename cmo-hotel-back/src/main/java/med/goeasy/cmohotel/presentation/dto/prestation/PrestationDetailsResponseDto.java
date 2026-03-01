package med.goeasy.cmohotel.presentation.dto.prestation;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import med.goeasy.cmohotel.persistence.entity.MealPrice;
import med.goeasy.cmohotel.persistence.entity.Person;
import med.goeasy.cmohotel.persistence.entity.Prestation;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;
import med.goeasy.cmohotel.presentation.dto.meal.MealTypeResponseDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PrestationDetailsResponseDto(
        String prestationId,
        MealTypeResponseDto meal,
        Integer quantity,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        LocalDate day,
        String observation,
        Double price,
        LocalDateTime createdAt
) {
    public static PrestationDetailsResponseDto mapToDto(Prestation entity, Person person){
        if (entity == null)
            return null;

        EGradeCategory category = person.getGrade().getCategory();
        BigDecimal calculatedPrice = entity.getMealType().getPrices().stream()
                .filter(mp -> mp.getCategory().equals(category))
                .map(MealPrice::getPrice)
                .findFirst()
                .orElse(BigDecimal.ZERO);


        return PrestationDetailsResponseDto.builder()
                .prestationId(entity.getId())
                .meal(MealTypeResponseDto.mapToDto(entity.getMealType()))
                .quantity(entity.getQuantity())
                .observation(entity.getObservation())
                .createdAt(entity.getCreatedAt())
                .price(calculatedPrice.doubleValue())
                .day(entity.getDay())
                .build();
    }
}
