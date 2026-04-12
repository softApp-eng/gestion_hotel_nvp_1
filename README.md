# CMO-HOTEL MANAGER 🏨🛡️

**CMO-Hotel Manager** est une solution de gestion hôtelière (PMS) de pointe, conçue pour centraliser les opérations, automatiser la facturation et garantir une traçabilité totale des mouvements de personnel. Développée pour répondre aux exigences de rigueur et de sécurité, cette plateforme assure le suivi complet du cycle de vie des résidents, du check-in à l'audit de nuit.

---

## 🚀 Caractéristiques Clés

* **Gestion des Réservations :** Moteur de réservation modulaire gérant les catégories de chambres et les statuts des résidents.
* **Audit de Nuit & Validation :** Module critique de clôture journalière automatisant le calcul des nuitées et la capture des prix.
* **Housekeeping en Temps Réel :** Synchronisation automatique du statut de propreté des chambres lors des mouvements (Check-in/Check-out).
* **Système d'Audit Global :** Journalisation exhaustive (Audit Log) de chaque opération sensible pour une transparence totale.
* **Facturation & Régie :** Génération de documents PDF professionnels (Factures, Main courante) via Thymeleaf et OpenHTMLToPDF.
* **Sécurité RBAC :** Contrôle d'accès basé sur les rôles (Admin, Réception, Gouvernante, Auditeur) via Spring Security & JWT.

---

## 🛠️ Stack Technique

### Backend
* **Langage :** Java 21 (LTS) - Utilisation des *Virtual Threads* pour une haute performance.
* **Framework :** Spring Boot 3.2+ (Spring Security, Spring Data JPA).
* **Base de données :** PostgreSQL (Robustesse transactionnelle).
* **Reporting :** Thymeleaf & OpenHTMLToPDF.

### Frontend
* **Framework :** Angular 18+ (TypeScript).
* **Interface :** PWA (Progressive Web App) avec Tailwind CSS.
* **Sécurité :** Authentification Stateless via JWT.

### Infrastructure & Déploiement
* **OS :** Ubuntu Server LTS.
* **Serveur Web :** Nginx (Reverse Proxy & SSL termination).
* **IP Statique :** `192.168.1.200`
* **Architecture :** Déploiement On-Premise pour une souveraineté totale des données.

---

## 📋 Architecture du Système

L'application suit une architecture modulaire découpée :

1.  **Couche Client :** Interface Angular communiquant via REST API.
2.  **Couche Sécurité :** Filtrage JWT et protection contre les vulnérabilités OWASP.
3.  **Couche Métier :** Services Spring Boot orchestrant les modules (Réservation, Facturation, Logistique).
4.  **Couche Persistance :** PostgreSQL gérant les transactions et les logs d'audit.
```text
src
│   ├───main
│   │   ├───java
│   │   │   └───med
│   │   │       └───goeasy
│   │   │           └───cmohotel
│   │   │               │   CmoHotelBackApplication.java
│   │   │               │   Feeder.java
│   │   │               │
│   │   │               ├───audit
│   │   │               │       ActivityLog.java
│   │   │               │       ActivityLogController.java
│   │   │               │       ActivityLogRepository.java
│   │   │               │       ActivityLogService.java
│   │   │               │       EAuditActionOperation.java
│   │   │               │       EAuditActionTarget.java
│   │   │               │
│   │   │               ├───config
│   │   │               │       AuditorAwareImpl.java
│   │   │               │       ConfigProperties.java
│   │   │               │       JpaConfig.java
│   │   │               │       WebMvcConfig.java
│   │   │               │
│   │   │               ├───exception
│   │   │               │       BadRequestException.java
│   │   │               │       OperationNotPermittedException.java
│   │   │               │       TokenRefreshException.java
│   │   │               │       UserNotFoundException.java
│   │   │               │
│   │   │               ├───handler
│   │   │               │       BusinessErrorCodes.java
│   │   │               │       ExceptionResponse.java
│   │   │               │       GlobalExceptionHandler.java
│   │   │               │
│   │   │               ├───persistence
│   │   │               │   ├───entity
│   │   │               │   │   │   AppConfiguration.java
│   │   │               │   │   │   Grade.java
│   │   │               │   │   │   HousekeepingAgent.java
│   │   │               │   │   │   HousekeepingHistory.java
│   │   │               │   │   │   Invoice.java
│   │   │               │   │   │   InvoiceDetails.java
│   │   │               │   │   │   InvoiceGuest.java
│   │   │               │   │   │   InvoicePrestation.java
│   │   │               │   │   │   InvoiceRoom.java
│   │   │               │   │   │   MealPrice.java
│   │   │               │   │   │   MealType.java
│   │   │               │   │   │   Pavillon.java
│   │   │               │   │   │   Person.java
│   │   │               │   │   │   Prestation.java
│   │   │               │   │   │   Reservation.java
│   │   │               │   │   │   ReservationDetails.java
│   │   │               │   │   │   Room.java
│   │   │               │   │   │   RoomPrice.java
│   │   │               │   │   │   RoomType.java
│   │   │               │   │   │   SwitchedRoom.java
│   │   │               │   │   │   ValidatedNight.java
│   │   │               │   │   │
│   │   │               │   │   ├───auth
│   │   │               │   │   │       AppPermission.java
│   │   │               │   │   │       AppRole.java
│   │   │               │   │   │       AppToken.java
│   │   │               │   │   │       AppUser.java
│   │   │               │   │   │       AppUserResource.java
│   │   │               │   │   │
│   │   │               │   │   └───enums
│   │   │               │   │           EGradeCategory.java
│   │   │               │   │           EGuestRole.java
│   │   │               │   │           EInvoiceStatus.java
│   │   │               │   │           EMealType.java
│   │   │               │   │           EPaymentMode.java
│   │   │               │   │           EPermissionsGroup.java
│   │   │               │   │           EPermissionsModule.java
│   │   │               │   │           EPrestationType.java
│   │   │               │   │           ERelationshipType.java
│   │   │               │   │           EReservationCategory.java
│   │   │               │   │           EReservationStatus.java
│   │   │               │   │
│   │   │               │   └───repository
│   │   │               │           AppConfigurationRepository.java
│   │   │               │           AppPermissionRepository.java
│   │   │               │           AppRoleRepository.java
│   │   │               │           AppTokenRepository.java
│   │   │               │           AppUserRepository.java
│   │   │               │           AppUserResourceRepository.java
│   │   │               │           GradeRepository.java
│   │   │               │           HousekeepingAgentRepository.java
│   │   │               │           HousekeepingHistoryRepository.java
│   │   │               │           InvoiceDetailsRepository.java
│   │   │               │           InvoiceGuestRepository.java
│   │   │               │           InvoicePrestationRepository.java
│   │   │               │           InvoiceRepository.java
│   │   │               │           InvoiceRoomRepository.java
│   │   │               │           MealPriceRepository.java
│   │   │               │           MealTypeRepository.java
│   │   │               │           PavillonRepository.java
│   │   │               │           PersonRepository.java
│   │   │               │           PrestationRepository.java
│   │   │               │           ReservationDetailsRepository.java
│   │   │               │           ReservationRepository.java
│   │   │               │           RoomPriceRepository.java
│   │   │               │           RoomRepository.java
│   │   │               │           RoomTypeRepository.java
│   │   │               │           SwitchedRoomRepository.java
│   │   │               │           ValidatedNightRepository.java
│   │   │               │
│   │   │               ├───presentation
│   │   │               │   ├───controller
│   │   │               │   │       AdministrationController.java
│   │   │               │   │       AuthController.java
│   │   │               │   │       CommonController.java
│   │   │               │   │       HousekeepingController.java
│   │   │               │   │       InvoiceController.java
│   │   │               │   │       MealController.java
│   │   │               │   │       PavillonController.java
│   │   │               │   │       PersonController.java
│   │   │               │   │       PrestationController.java
│   │   │               │   │       ProfileController.java
│   │   │               │   │       ReservationController.java
│   │   │               │   │       RolesController.java
│   │   │               │   │       RoomController.java
│   │   │               │   │       StatisticsController.java
│   │   │               │   │       UsersController.java
│   │   │               │   │
│   │   │               │   └───dto
│   │   │               │       │   ApiResponse.java
│   │   │               │       │   PageDto.java
│   │   │               │       │   Range.java
│   │   │               │       │
│   │   │               │       ├───common
│   │   │               │       │       EnumsDto.java
│   │   │               │       │
│   │   │               │       ├───housekeeping
│   │   │               │       │   ├───request
│   │   │               │       │   │       HousekeepingAgentRequestDto.java
│   │   │               │       │   │       UpdateRoomCleanRequest.java
│   │   │               │       │   │
│   │   │               │       │   └───response
│   │   │               │       │           HousekeepingAgentResponseDto.java
│   │   │               │       │           RoomHousekeepingDto.java
│   │   │               │       │
│   │   │               │       ├───invoice
│   │   │               │       │   ├───request
│   │   │               │       │   │       NightValidationDto.java
│   │   │               │       │   │       PaymentRequestDto.java
│   │   │               │       │   │
│   │   │               │       │   └───response
│   │   │               │       │           InvoiceDetailsResponseDto.java
│   │   │               │       │           InvoiceGuestResponseDto.java
│   │   │               │       │           InvoicePrestationResponseDto.java
│   │   │               │       │           InvoiceResponseDto.java
│   │   │               │       │           InvoiceRoomResponseDto.java
│   │   │               │       │           ValidatedNightResponseDto.java
│   │   │               │       │
│   │   │               │       ├───meal
│   │   │               │       │       MealPriceRequestDto.java
│   │   │               │       │       MealPriceResponseDto.java
│   │   │               │       │       MealTypeRequestDto.java
│   │   │               │       │       MealTypeResponseDto.java
│   │   │               │       │
│   │   │               │       ├───pavillon
│   │   │               │       │       PavillonRequestDto.java
│   │   │               │       │       PavillonResponseDto.java
│   │   │               │       │
│   │   │               │       ├───person
│   │   │               │       │       GradeDto.java
│   │   │               │       │       PersonRequestDto.java
│   │   │               │       │       PersonResponseDto.java
│   │   │               │       │
│   │   │               │       ├───prestation
│   │   │               │       │       PrestationDetailsResponseDto.java
│   │   │               │       │       PrestationPersonRequestDto.java
│   │   │               │       │       PrestationRequestDto.java
│   │   │               │       │       PrestationResponseDto.java
│   │   │               │       │
│   │   │               │       ├───prices
│   │   │               │       │       PriceEstimationResponse.java
│   │   │               │       │       RoomPriceDetail.java
│   │   │               │       │
│   │   │               │       ├───profile
│   │   │               │       │       ProfileUpdateDto.java
│   │   │               │       │       UpdatePasswordDto.java
│   │   │               │       │
│   │   │               │       ├───reservation
│   │   │               │       │       MainCourante.java
│   │   │               │       │       ReservationCalenderResponseDto.java
│   │   │               │       │       ReservationDetailsResponseDto.java
│   │   │               │       │       ReservationPersonsRequestDto.java
│   │   │               │       │       ReservationRequestDto.java
│   │   │               │       │       ReservationResponseDto.java
│   │   │               │       │       ReservedRoomResponseDto.java
│   │   │               │       │       SwitchRoomDto.java
│   │   │               │       │       SwitchRoomResponseDto.java
│   │   │               │       │
│   │   │               │       ├───role
│   │   │               │       │       PermissionDto.java
│   │   │               │       │       RoleRequestDto.java
│   │   │               │       │       RoleResponse.java
│   │   │               │       │
│   │   │               │       ├───room
│   │   │               │       │       RoomPriceRequestDto.java
│   │   │               │       │       RoomPriceResponseDto.java
│   │   │               │       │       RoomRequestDto.java
│   │   │               │       │       RoomResponseDto.java
│   │   │               │       │       RoomTypeDto.java
│   │   │               │       │       RoomTypeRequestDto.java
│   │   │               │       │
│   │   │               │       ├───statistic
│   │   │               │       │       RoomTypeOccupation.java
│   │   │               │       │
│   │   │               │       └───user
│   │   │               │               RegisterRequestDto.java
│   │   │               │               UpdateUserPasswordDto.java
│   │   │               │               UpdateUserRequestDto.java
│   │   │               │               UserResourceDto.java
│   │   │               │               UserResponse.java
│   │   │               │               UserRoleAssign.java
│   │   │               │               UserRoomResource.java
│   │   │               │
│   │   │               ├───security
│   │   │               │   │   WebSecurityConfig.java
│   │   │               │   │
│   │   │               │   ├───dto
│   │   │               │   │       LoginWithCredentials.java
│   │   │               │   │       Token.java
│   │   │               │   │       TokenRefreshRequest.java
│   │   │               │   │
│   │   │               │   ├───enums
│   │   │               │   │       EPermissions.java
│   │   │               │   │       ERoleSystem.java
│   │   │               │   │
│   │   │               │   ├───jwt
│   │   │               │   │       AccessDeniedHandlerJwt.java
│   │   │               │   │       AuthEntryPointJwt.java
│   │   │               │   │       AuthTokenFilter.java
│   │   │               │   │       JwtUtils.java
│   │   │               │   │
│   │   │               │   └───services
│   │   │               │           LogoutService.java
│   │   │               │           TokenCron.java
│   │   │               │           TokenServiceFace.java
│   │   │               │           TokenServiceImpl.java
│   │   │               │           UserDetailsServiceImpl.java
│   │   │               │
│   │   │               ├───service
│   │   │               │       CommonService.java
│   │   │               │       HouseKeepingService.java
│   │   │               │       InvoiceService.java
│   │   │               │       MealService.java
│   │   │               │       PavillonService.java
│   │   │               │       PersonService.java
│   │   │               │       PrestationService.java
│   │   │               │       ProfileService.java
│   │   │               │       ReservationService.java
│   │   │               │       RolesService.java
│   │   │               │       RoomService.java
│   │   │               │       StatisticsService.java
│   │   │               │       UsersService.java
│   │   │               │
│   │   │               └───utils
│   │   │                       DynamicJobService.java
│   │   │                       UtilsService.java
│   │   │
│   │   └───resources
│   │       │   application.properties
│   │       │   banner.txt
│   │       │   data-prod.sql
│   │       │   data.sql
│   │       │   secrets.properties
│   │       │
│   │       ├───static
│   │       │   └───assets
│   │       │           cmo.png
│   │       │
│   │       └───templates
│   │               encaissement.html
│   │               invoice.html
│   │               main_courante.html
│   │               reservation-card.html
│   │               reservation-invoice.html
```
---
## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Spring Boot 3.2.x, Java 22, Spring Security (JWT) |
| **Frontend** | Angular 17/18+, Nginx |
| **Database** | PostgreSQL 18+ |
| **Infrastructure** | Docker, Docker Compose |

---
## ⚙️ Installation & Configuration

### Prérequis
* JDK 21+
* Node.js & Angular CLI
* PostgreSQL 15+
* Nginx (pour le déploiement de production)

