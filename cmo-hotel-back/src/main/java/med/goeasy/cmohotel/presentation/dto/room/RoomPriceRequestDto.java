package med.goeasy.cmohotel.presentation.dto.room;

import jakarta.validation.constraints.NotNull;
import med.goeasy.cmohotel.persistence.entity.enums.EGradeCategory;

public record RoomPriceRequestDto(
        @NotNull(message = "Type de chambre obligatoire")
        Long roomTypeId,
        @NotNull(message = "Categorie du grade obligatoire")
        EGradeCategory category,
        @NotNull(message = "Prix obligatoire")
        Double price
) {
}
