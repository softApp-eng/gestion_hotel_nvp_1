package med.goeasy.cmohotel.persistence.entity.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum EReservationStatus {

    PENDING("PENDING","En attente", "La demande est enregistrée mais pas encore validée."),
    CONFIRMED("CONFIRMED","Confirmée", "La réservation est validée, la chambre est bloquée."),
    CANCELED("CANCELED","Annulée", "La réservation a été annulée avant l'arrivée du client."),
    //NO_SHOW("NO_SHOW","Non présenté", "Le client ne s'est pas présenté sans annuler."),
    CLOSED("CLOSED","Clôturée", "Dossier archivé après facturation et règlement."),
//    IN_PROGRESS("IN_PROGRESS","En cours", "Le client a effectué son check-in et occupe actuellement la chambre."),
//    COMPLETED("COMPLETED","Terminée", "Le client a effectué son check-out et le séjour est fini."),
//    EXPIRED("EXPIRED","Expirée", "La demande n'a pas été confirmée dans les délais impartis.");
    ;

    private final String code;
    private final String name;
    private final String description;
}
