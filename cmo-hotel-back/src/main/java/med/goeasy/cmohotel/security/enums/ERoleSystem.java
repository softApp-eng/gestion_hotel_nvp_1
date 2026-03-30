package med.goeasy.cmohotel.security.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.EnumSet;
import java.util.Set;

@AllArgsConstructor
@Getter
public enum ERoleSystem {
    DEFAULT("default",
            "Profil d'accès minimal attribué par défaut à tout nouvel utilisateur authentifié.",
            EnumSet.of(
                    EPermissions.DEFAULT
            )),

    ADMIN("administrateur",
            "Détient un accès global sans restriction à l'ensemble des fonctionnalités de la plateforme. Responsable de la configuration globale, de la gestion des référentiels, ainsi que de l'administration des utilisateurs, des rôles et de la sécurité du système.",
            EnumSet.allOf(EPermissions.class)
    ),

    FRON_DESK("front desk",
            "Profil d'accès pour la gestion des réservations des clients.",
            EnumSet.of(
                    EPermissions.DEFAULT,
                    //reservation
                    EPermissions.RESERVATION_CREATE,
                    EPermissions.RESERVATION_UPDATE,
                    EPermissions.RESERVATION_LIST,
                    EPermissions.RESERVATION_ONE,
                    EPermissions.RESERVATION_ACCEPT,
                    EPermissions.RESERVATION_CANCEL,
                    EPermissions.RESERVATION_CLOSE,
                    EPermissions.RESERVATION_DELETE,
                    EPermissions.RESERVATION_RESIDENTS,
                    EPermissions.RESERVATION_ROOM_CHANGE,
                    EPermissions.RESERVATION_FICHE_PDF,
                    EPermissions.RESERVATION_MAIN_COURANTE,
                    // rooms and pavillon
                    EPermissions.PAVILLON_LIST,
                    EPermissions.PAVILLON_SELECT_ONE,
                    EPermissions.ROOM_LIST,
                    EPermissions.ROOM_SELECT_ONE,
                    EPermissions.ROOM_LIST_WITH_RESERVATION_DETAILS,
                    EPermissions.ROOM_TYPE_LIST,
                    // persons
                    EPermissions.PERSON_CREATE,
                    EPermissions.PERSON_UPDATE,
                    EPermissions.PERSON_LIST,
                    EPermissions.PERSON_SELECT_ONE,
                    EPermissions.PERSON_DELETE,
                    // prestation
                    EPermissions.PRESTATION_FOR_RESIDENTS,
                    // invoice
                    EPermissions.INVOICE_PAY,
                    EPermissions.INVOICE_INVOICE_PDF,
                    EPermissions.INVOICE_LIST,
                    EPermissions.INVOICE_ENCAISSEMENT,
                    EPermissions.INVOICE_ENCAISSEMENT_PDF,

                    // statistics & dashboards
                    EPermissions.STATISTICS_DASHBOARDS

            )),

    NIGHT_AUDIT("night audit",
            "Profil d'accès pour valider les nuités et les factures.",
            EnumSet.of(
                    EPermissions.DEFAULT,
                    EPermissions.INVOICE_NIGHT_VALIDATE,

                    EPermissions.RESERVATION_LIST,
                    EPermissions.RESERVATION_TIME_EXTEND,
                    EPermissions.RESERVATION_ONE,
                    EPermissions.RESERVATION_RESIDENTS,
                    EPermissions.PRESTATION_FOR_RESIDENTS,
                    EPermissions.PAVILLON_LIST,
                    EPermissions.PAVILLON_SELECT_ONE,
                    EPermissions.ROOM_LIST,
                    EPermissions.ROOM_SELECT_ONE,
                    EPermissions.ROOM_LIST_WITH_RESERVATION_DETAILS,
                    EPermissions.INVOICE_LIST,
                    EPermissions.INVOICE_ENCAISSEMENT,
                    EPermissions.INVOICE_ENCAISSEMENT_PDF,
                    EPermissions.RESERVATION_MAIN_COURANTE,

                    // statistics & dashboards
                    EPermissions.STATISTICS_DASHBOARDS
            )),

    GOVERNANCE("governance",
            "Profil d'accès pour la gestion des ménages des chambres.",
            EnumSet.of(
                    EPermissions.DEFAULT,
                    EPermissions.HOUSE_KEEPING_AGENT_CREATE,
                    EPermissions.HOUSE_KEEPING_AGENT_UPDATE,
                    EPermissions.HOUSE_KEEPING_AGENT_LIST,
                    EPermissions.HOUSE_KEEPING_AGENT_DELETE,
                    EPermissions.ROOM_LIST_GRANTED,
                    EPermissions.HOUSE_KEEPING_ROOM_DISPONIBILITY,
                    EPermissions.HOUSE_KEEPING_ROOM_CLEAN_STATUS,
                    EPermissions.HOUSE_KEEPING_HISTORY_SEARCH,
                    EPermissions.HOUSE_KEEPING_HISTORY_UPDATE,

                    // statistics & dashboards
                    EPermissions.STATISTICS_DASHBOARDS

            )),

    PRESTATION_MANAGER("prestation_manager",
            "Profil d'accès pour la gestion des prestations.",
            EnumSet.of(
                    EPermissions.DEFAULT,
                    EPermissions.MEAL_TYPES_LIST,
                    EPermissions.MEAL_PRICE_LIST,

                    EPermissions.PRESTATION_CREATE,
                    EPermissions.PRESTATION_FOR_RESIDENTS,
                    EPermissions.PRESTATION_DELETE,
                    EPermissions.PRESTATION_UPDATE,
                    EPermissions.RESERVATION_RESIDENTS,

                    // statistics & dashboards
                    EPermissions.STATISTICS_DASHBOARDS
            )),

    CHEF_CMO("chef_cmo",
            "Profil d'accès pour la visualisation et la génération des rapports et états de toutes partie de la plateforme.",
            EnumSet.of(
                    EPermissions.DEFAULT
            )),
    ;

    private final String title;
    private final String description;
    private final Set<EPermissions> permissions;

    public String getRoleName() {
        return "ROLE_" + name();
    }

    private static Set<EPermissions> combine(ERoleSystem... roles) {
        Set<EPermissions> all = EnumSet.noneOf(EPermissions.class);
        for (ERoleSystem role : roles) {
            all.addAll(role.getPermissions());
        }
        return all;
    }
}
