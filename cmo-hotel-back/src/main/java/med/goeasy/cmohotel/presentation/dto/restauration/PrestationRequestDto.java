package med.goeasy.cmohotel.presentation.dto.restauration;

import lombok.Data;
import med.goeasy.cmohotel.persistence.entity.enums.EMealType;

@Data
public class PrestationRequestDto {

    private String personId;
    private EMealType mealType;
    private Integer quantity;
    private String observation;
}
