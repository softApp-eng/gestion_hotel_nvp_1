package med.goeasy.cmohotel.persistence.entity.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EGradeCategory {

    OFFICIERS_GENERAUX("OFFICIERS_GENERAUX","Officiers Generaux","Officiers Generaux"),
    OFFICIERS_GENERAUX_COLONEL_MAJOR("OFFICIERS_GENERAUX_COLONEL_MAJOR","Officiers Generaux et colonel major","Officiers Generaux et colonel major"),
    OFFICIER_SUPERIEUR("OFFICIER_SUPERIEUR","Officier supérieur","Officier supérieur"),
    OFFICIER_SUBALTERNE("OFFICIER_SUBALTERNE","Officier subalterne","Officier subalterne"),
    ODR("ODR","Officier du rang","Officier du rang"),
    CIVIL("CIVIL","Civil","Civil"),
    ;

    private final String code;
    private final String name;
    private final String description;

}
