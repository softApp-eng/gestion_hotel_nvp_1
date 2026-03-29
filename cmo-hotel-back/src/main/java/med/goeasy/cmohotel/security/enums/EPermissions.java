package med.goeasy.cmohotel.security.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import med.goeasy.cmohotel.persistence.entity.enums.EPermissionsGroup;
import med.goeasy.cmohotel.persistence.entity.enums.EPermissionsModule;

import static med.goeasy.cmohotel.persistence.entity.enums.EPermissionsGroup.*;
import static med.goeasy.cmohotel.persistence.entity.enums.EPermissionsModule.*;

@AllArgsConstructor
@Getter
public enum EPermissions {

    //default permission
    DEFAULT(EPermissionsModule.GENERAL, "default", "Accès standard au portail (Permission par défaut)", EPermissionsGroup.GENERAL,true,"Autorise l'accès de base à l'interface utilisateur et aux fonctionnalités de consultation publique de l'établissement."),

    // USERS
    ADMIN_USERS_LIST(USERS, "user:list", "Consulter la liste des utilisateurs",  READ,false,"Autorise la consultation de la liste complète des comptes utilisateurs du système."),
    ADMIN_USERS_ONE(USERS, "user:one", "Lecture des données utilisateur",  READ,false,"Droit de lecture seule sur les attributs sensibles et les paramètres d'un compte."),
    ADMIN_USERS_CREATE(USERS, "user:create", "Créer de nouveaux comptes",  CREATE,false,"Autorise l'ajout et l'invitation de nouveaux collaborateurs sur la plateforme."),
    ADMIN_USERS_UPDATE(USERS, "user:update", "Modifier les informations d'un compte",  UPDATE,false,"Autorise la mise à jour des données administratives des l'utilisateur"),
    ADMIN_USERS_PASSWORD_MODIFY(USERS, "user:password:modify", "Réinitialiser les accès de sécurité",  UPDATE,false,"Autorise la modification forcée du mot de passe d'un utilisateur"),
    ADMIN_USERS_ASSIGN_ROLES(USERS, "user:assign:roles", "Gérer les habilitations et les roles", MANAGE,false,"Autorise l'attribution et la modification des rôles et privilèges des utilisateurs."),
    ADMIN_USERS_RESOURCES_MANAGE(USERS, "user:resources:manage", "Administrer les dotations de ressources", MANAGE,false,"Autorise l'affectation et le retrait des ressources opérationnelles"),
    ADMIN_AUDIT_ACTIVITY_LOGS(AUDIT, "logs:filter", "Auditer les journaux d'activité", MANAGE,false,"Autorise la surveillance et le filtrage des actions effectuées par les utilisateurs (Audit Trail)."),

    // CONFIGURATION,
    ADMIN_CONFIG_LOAD(CONFIGURATION, "config:load", "Consulter les paramètres globaux du systéme", READ,false,"Autorise la lecture de la configuration système et des constantes opérationnelles de la plateforme."),
    ADMIN_CONFIG_ROOM_CLEAN_PLANIFICATION(CONFIGURATION, "room:clean:planif", "Planifier la maintenance automatique", MANAGE,false,"Autorise le paramétrage des cycles de nettoyage automatique et l'ordonnancement des tâches de ménage."),
    ADMIN_CONFIG_CHECKOUT(CONFIGURATION, "checkout:hour", "Ajuster l'heure de checkout", MANAGE,false,"Autorise la modification de l'heure limite de départ (Check-out) applicable par défaut à toutes les réservations."),

    //ROLES
    ADMIN_ROLES_LIST(ROLES, "role:list", "Consulter l'annuaire des rôles", READ,false,"Autorise la visualisation de la liste des profils d'accès configurés dans le système."),
    ADMIN_ROLES_PERMISSIONS_LIST(ROLES, "permission:list", "Consulter le référentiel des droits", READ,false,"Autorise la lecture de la matrice complète des permissions disponibles pour l'attribution."),
    ADMIN_ROLES_CREATE(ROLES, "role:create", "Définir un nouveau profil d'accès", CREATE,false,"Autorise la création d'un nouveau rôle utilisateur et la configuration de ses privilèges."),
    ADMIN_ROLES_UPDATE(ROLES, "role:update", "Ajuster les privilèges du rôle", UPDATE,false,"Autorise la modification des droits d'accès et des paramètres d'un profil existant."),
    ADMIN_ROLES_ONE(ROLES, "role:one", "Afficher la fiche de sécurité", READ,false,"Autorise la consultation détaillée d'un rôle spécifique et de ses permissions associées."),
    ADMIN_ROLES_DELETE(ROLES, "role:delete", "Révoquer un profil de sécurité", DELETE,false,"Autorise la suppression définitive d'un rôle. Action critique impactant les utilisateurs liés."),
    ADMIN_ROLES_CLONE(ROLES, "role:clone", "Dupliquer une configuration de rôle", MANAGE,false,"Autorise la création rapide d'un nouveau rôle basé sur un modèle de permissions existant."),

    // PERSON
    PERSON_CREATE(PERSON, "person:create", "Enregistrer un nouveau profil", CREATE,true,"Autorise l'ajout d'un nouveau client dans l'annuaire de la plateforme."),
    PERSON_UPDATE(PERSON, "person:update", "Modifier un profil", UPDATE,true,"Autorise la modification des informations personnelles et des documents d'identité associés à un profil."),
    PERSON_LIST(PERSON, "person:list", "Consulter l'annuaire des profils", READ,true,"utorise l'accès à la liste globale et à la recherche multicritères des personnes enregistrées."),
    PERSON_SELECT_ONE(PERSON, "person:one", "Accéder au détail du profil", READ,true,"Autorise la lecture complète d'une fiche profil, incluant les coordonnées et l'historique de base."),
    PERSON_DELETE(PERSON, "person:delete", "Révoquer un profil", DELETE,true,"Autorise la suppression définitive ou l'archivage d'une fiche de la base de données."),

    // PAVILLON
    PAVILLON_CREATE(PAVILLON, "pavillon:create", "Définir un nouveau pavillon", CREATE,true,"Autorise la création d'une nouvelle structure ou aile dans le parc immobilier de l'hôtel."),
    PAVILLON_UPDATE(PAVILLON, "pavillon:update", "Éditer les détails du pavillon", UPDATE,true,"Autorise la modification des caractéristiques techniques, du nom ou de la capacité d'un pavillon existant."),
    PAVILLON_LIST(PAVILLON, "pavillon:list", "Consulter les pavillons", READ,true,"Autorise l'accès à la vue d'ensemble de tous les pavillons et de leur état opérationnel."),
    PAVILLON_SELECT_ONE(PAVILLON, "pavillon:one", "Afficher un pavillon", READ,true,"Autorise la consultation détaillée d'un pavillon spécifique."),

    // ROOMS
    ROOM_CREATE(ROOM, "room:create", "Créer une chambre", CREATE,true,"Autorise l'ajout d'une chambre physique dans l'inventaire actif de la plateforme."),
    ROOM_UPDATE(ROOM, "room:update", "Modifier une chambre", UPDATE,true,"Autorise la modification des attributs et des caractéristiques d'une chambre."),
    ROOM_LIST(ROOM, "room:list", "Consulter la liste des chambres", READ,true,"Autorise l'accès au registre complet de toutes les chambres du complexe hôtelier."),
    ROOM_LIST_GRANTED(ROOM, "room:granted", "Visualiser les chambres affectées", READ,true,"Autorise la consultation restreinte des seules chambres dont l'utilisateur a la responsabilité de gestion."),
    ROOM_LIST_WITH_RESERVATION_DETAILS(ROOM, "room:list:reservations:details", "lister les chambres avec les details de reservation", READ,true,""),
    ROOM_SELECT_ONE(ROOM, "room:one", "Consulter une chambre", READ,true,"Autorise l'accès complet aux détails techniques d'une chambre spécifique."),
    ROOM_DELETE(ROOM, "room:delete", "Retirer une chambre", DELETE,true,"Autorise la suppression définitive d'une chambre de la base de données opérationnelle. Action irréversible."),
    // ROOMS TYPES
    ROOM_TYPE_CREATE(ROOM, "type:create", "Définir un type d'hébergement", CREATE,true,"Autorise la création d'un nouveau type de chambre (Suite, Standard, etc.)."),
    ROOM_TYPE_UPDATE(ROOM, "type:update", "Modifier les types d'hébergement", UPDATE,true,"Autorise la modification des types de chambre."),
    ROOM_TYPE_LIST(ROOM, "type:list", "Consulter l'inventaire des types des chambres", READ,true,"Autorise l'accès à la liste globale des différents standings et types d'unités proposés."),
    ROOM_TYPE_SELECT_ONE(ROOM, "type:one", "Afficher les spécifications du type", READ,true,"Autorise la lecture détaillée des attributs et équipements propres à un type spécifique."),
    ROOM_TYPE_DELETE(ROOM, "type:delete", "Révoquer un type du catalogue", DELETE,true,"Autorise la suppression définitive d'un type de chambre de la plateforme."),
    // ROOMS PRICES
    ROOM_PRICE_CREATE(ROOM, "price:create", "Définir un nouveau tarif de chambre", CREATE,true,"Autorise la création d'une nouvelle structure de prix pour les nuitées dans le catalogue de l'établissement."),
    ROOM_PRICE_UPDATE(ROOM, "price:update", "Modifier la grille tarifaire des chambres", UPDATE,true,"Autorise la modification des tarifs en vigueur."),
    ROOM_PRICE_LIST(ROOM, "price:list", "Consulter les prix des chambres", READ,true,"Autorise l'accès au registre complet des tarifs des chambres."),
    ROOM_PRICE_SELECT_ONE(ROOM, "price:one", "Afficher le détail tarifaire d'une chambre", READ,true,"Autorise la lecture détaillée d'une règle de prix spécifique et de ses paramètres associés."),
    ROOM_PRICE_DELETE(ROOM, "price:delete", "Révoquer une règle de prix", DELETE,true,"Autorise la suppression définitive d'une option tarifaire d'une chambre"),

    // RESERVATIONS
    RESERVATION_CREATE(RESERVATION, "reservation:create", "Enregistrer une réservation", CREATE,true,"Autorise la création de nouveaux dossiers de réservation pour les clients."),
    RESERVATION_UPDATE(RESERVATION, "reservation:update", "Modifier une réservation", UPDATE,true,"Autorise la mise à jour des dates, du nombre de participants ou des services associés à une réservation active."),
    RESERVATION_LIST(RESERVATION, "reservation:list", "Consulter le planning des réservations", READ,true,"Autorise l'accès à la vue d'ensemble et au registre de tous les séjours (passés, présents et futurs)."),
    RESERVATION_ONE(RESERVATION, "reservation:one", "Accéder au détail d'une réservation", READ,true,"Autorise la lecture complète des informations d'une réservation spécifique, incluant les clients et les options."),
    RESERVATION_ACCEPT(RESERVATION, "reservation:accept", "Valider les réservations", MANAGE,true,"Autorise la confirmation officielle d'une réservation en attente."),
    RESERVATION_CANCEL(RESERVATION, "reservation:cancel", "Annuler une réservation", MANAGE,true,"Autorise l'annulation d'un séjour et la remise immédiate de la chambre en inventaire disponible."),
    RESERVATION_CLOSE(RESERVATION, "reservation:close", "Clôturer le dossier de séjour", MANAGE,true,"Autorise la fermeture administrative d'une réservation après règlement total et départ du client."),
    RESERVATION_DELETE(RESERVATION, "reservation:delete", "Supprimer un dossier de réservation", DELETE,true,"Autorise la suppression définitive d'une réservation du registre. Action restreinte à l'audit."),
    RESERVATION_RESIDENTS(RESERVATION, "reservation:residents", "Consulter l'historique résidents", READ,true,"Autorise l'accès au registre des séjours passés et en cours pour l'ensemble des occupants."),
    RESERVATION_ROOM_CHANGE(RESERVATION, "reservation:room:change", "Gérer les transferts de chambre", MANAGE,true,"Autorise le changement de chambre d'un résident durant son séjour."),
    RESERVATION_TIME_EXTEND(RESERVATION, "reservation:time:extend", "Prolonger le séjour", MANAGE,true,"Autorise la modification de la date de départ et l'extension de la durée de séjour."),
    RESERVATION_FICHE_PDF(RESERVATION, "reservation:pdf", "Imprimer la fiche de reservation", MANAGE,true,"Autorise le téléchargement des fiches de reservation."),


    //HOUSE KEEPING
    HOUSE_KEEPING_AGENT_CREATE(HOUSE_KEEPING, "agent:create", "Enregistrer un nouvel intervenant", CREATE,true,"Autorise la création d'une fiche collaborateur pour le personnel d'entretien et de maintenance."),
    HOUSE_KEEPING_AGENT_UPDATE(HOUSE_KEEPING, "agent:update", "modifier un agent", UPDATE,true,"Autorise la mise à jour des informations des agents"),
    HOUSE_KEEPING_AGENT_LIST(HOUSE_KEEPING, "agent:list", "Consulter l'effectif de menage", READ,true,"Autorise l'accès à l'annuaire complet des agents de service actifs et de leurs disponibilités."),
    HOUSE_KEEPING_AGENT_DELETE(HOUSE_KEEPING, "agent:delete", "Supprimer un agent", DELETE,true,"Autorise la suppression ou la désactivation d'un agent de ménage."),
    HOUSE_KEEPING_ROOM_DISPONIBILITY(HOUSE_KEEPING, "room:disponibility", "Gérer la disponibilité technique des chambres", MANAGE,true,"Autorise le blocage ou la remise en service opérationnelle des chambres."),
    HOUSE_KEEPING_ROOM_CLEAN_STATUS(HOUSE_KEEPING, "room:clean:status", "Actualiser l'état de propreté", MANAGE,true,"Autorise la mise à jour en temps réel du statut de nettoyage des chambres pour la réception."),
    HOUSE_KEEPING_HISTORY_SEARCH(HOUSE_KEEPING, "history:search", "Consulter le registre d'entretien des chambres", READ,true,"Autorise la recherche et l'audit de l'historique complet des interventions de nettoyage par chambre ou par agent."),
    HOUSE_KEEPING_HISTORY_UPDATE(HOUSE_KEEPING, "history:update", "Rectifier une fiche d'intervention", UPDATE,true,"Autorise la correction exceptionnelle d'une entrée dans l'historique de maintenance (horaires, agent assigné, observations)."),
    HOUSE_KEEPING_HISTORY_DELETE(HOUSE_KEEPING, "history:delete", "Supprimer un journal d'entretien", DELETE,true,"Autorise la suppression définitive d'enregistrements du registre de nettoyage. Action sensible soumise à l'audit."),

    // MEALS,
    MEAL_TYPES_LIST(MEAL, "types:list", "Consulter les type de repas", READ,true,"Autorise la lecture de la liste des régimes de restauration"),
    MEAL_TYPES_CREATE(MEAL, "types:create", "Créer un type de repas", CREATE,true,"Autorise la création d'une nouvelle catégorie de service de restauration dans le système."),
    MEAL_TYPES_UPDATE(MEAL, "types:update", "modifier un type de repas", UPDATE,true,"Autorise la modification du nom ou des caractéristiques d'une formule de repas existante."),
    MEAL_TYPES_DELETE(MEAL, "types:delete", "Supprimer un type de repas", DELETE,true,"Autorise le retrait d'une formule de restauration du catalogue opérationnel de l'hôtel."),

    MEAL_PRICE_LIST(MEAL, "price:list", "Consulter la grille tarifaire des repas", READ,true,"Autorise l'accès à l'historique et aux tarifs actuels des différentes formules de restauration."),
    MEAL_PRICE_CREATE(MEAL, "price:create", "Définir un nouveau tarif de restauration", CREATE,true,"Autorise la création de nouveaux prix pour les repas"),
    MEAL_PRICE_UPDATE(MEAL, "price:update", "Actualiser les prix des repas", UPDATE,true,"Autorise la révision et la modification des tarifs de restauration"),
    MEAL_PRICE_DELETE(MEAL, "price:delete", "Révoquer un tarif du catalogue", DELETE,true,"Autorise la suppression d'une option tarifaire de la liste des services de restauration proposés."),

    // PRESTATION
    PRESTATION_CREATE(PRESTATION, "prestation:create", "Enregistrer des préstations", CREATE,true,"Autorise la définition et l'ajout de nouvelles prestations"),
    PRESTATION_UPDATE(PRESTATION, "prestation:update", "Modifier une préstation", UPDATE,true,"Autorise la modification des prestation des clients"),
    PRESTATION_FOR_RESIDENTS(PRESTATION, "prestation:residents:list", "Suivre les consommations résidents", READ,true,"Autorise la consultation de la liste des services consommés par les résidents"),
    PRESTATION_DELETE(PRESTATION, "prestation:delete", "Supprimer une préstation", DELETE,true,"Autorise la suppression d'une prestation"),

    // INVOICE,
    INVOICE_NIGHT_VALIDATE(INVOICE, "night:validate", "valider les nuitées des reservations", MANAGE,true,"Autorise la validation comptable des nuitées pour la facturation finale."),
    INVOICE_LIST(INVOICE, "invoice:list", "Accéder au registre des factures", READ,true,"Autorise la consultation de l'historique et de l'état des factures émises."),
    INVOICE_PAY(INVOICE, "invoice:pay", "Encaisser les règlements", MANAGE,true,"Autorise l'enregistrement des paiements et le passage des factures au statut <Payé>."),
    INVOICE_INVOICE_PDF(INVOICE, "invoice:pdf", "Imprimer la facture", READ,true,"Autorise le téléchargement des factures payées."),
    INVOICE_ENCAISSEMENT(INVOICE, "invoice:encaissement", "Candulter l'encaissement journalier", READ,true,"Autorise le consultation de l'encaissement journalier."),
    INVOICE_ENCAISSEMENT_PDF(INVOICE, "invoice:encaissement:pdf", "Télécharger l'encaissement journalier", READ,true,"Autorise le téléchargement de l'encaissement journalier."),

    // statistics & dashboards
    STATISTICS_DASHBOARDS(STATISTICS, "consulting", "Piloter les tableaux de bord", READ,true,"Autorise l'accès aux indicateurs clés de performance, aux statistiques d'occupation et aux analyses financières de l'établissement.")

    ;


    private final EPermissionsModule module;
    private final String action;
    private final String title;
    private final EPermissionsGroup group;
    private final boolean affectable;
    private final String description;

    public String getAuthority() {
        // Using module.name() or a specific code field is more reliable
        return String.format("%s:%s", this.module.getName(), this.action);
    }
}
