package med.goeasy.cmohotel.persistence.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EMealType {

    PETIT_DEJEUNER("PETIT_DEJEUNER","Petit déjeuner"),
    DEJEUNER("DEJEUNER","Déjeuner"),
    DINER("DINER","Dîner");

    private final String code;
    private final String name;

    @JsonCreator
    public static EMealType fromValue(String value) {
        return valueOf(value.toUpperCase());
    }
}


