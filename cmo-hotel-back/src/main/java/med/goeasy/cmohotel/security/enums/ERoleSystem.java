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

    RESERVATIONS_MANAGER("reservations_manager",
            "Profil d'accès pour la gestion des résevations.",
            EnumSet.of(
                    EPermissions.DEFAULT
            )),

    GOVERNANCE("governance",
            "Profil d'accès pour la gestion des ménages des chambres.",
            EnumSet.of(
                    EPermissions.DEFAULT,
                    EPermissions.HOUSE_KEEPING_AGENT_CREATE,
                    EPermissions.HOUSE_KEEPING_AGENT_UPDATE,
                    EPermissions.HOUSE_KEEPING_AGENT_LIST,
                    EPermissions.HOUSE_KEEPING_AGENT_DELETE,
                    EPermissions.ROOM_LIST_GRANTED

            )),

    RESTAURATION_MANAGER("restauration_manager",
            "Profil d'accès pour la gestion des restauration.",
            EnumSet.of(
                    EPermissions.DEFAULT
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
