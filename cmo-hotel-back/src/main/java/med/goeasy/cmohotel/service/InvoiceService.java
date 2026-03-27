package med.goeasy.cmohotel.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.exception.OperationNotPermittedException;
import med.goeasy.cmohotel.persistence.entity.*;
import med.goeasy.cmohotel.persistence.entity.enums.*;
import med.goeasy.cmohotel.persistence.repository.*;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.invoice.request.NightValidationDto;
import med.goeasy.cmohotel.presentation.dto.invoice.request.PaymentRequestDto;
import med.goeasy.cmohotel.presentation.dto.invoice.response.InvoiceResponseDto;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ValidatedNightRepository validatedNightRepository;
    private final PrestationRepository prestationRepository;
    private final ReservationDetailsRepository reservationDetailsRepository;
    private final InvoiceDetailsRepository invoiceDetailsRepository;

    private final ActivityLogService activityLogService;
    private final HttpServletRequest request;

    /// /////////////////////////////////////////////////////////////////////////////
    ///                                 NIGHT AUDIT                               ///
    /// /////////////////////////////////////////////////////////////////////////////

    @Transactional
    public void validateInvoiceNight(Authentication authentication, NightValidationDto dto) {
        // if night already validated
        if (validatedNightRepository.isNightValidated(dto.nightDate())){
            throw new OperationNotPermittedException("Nuitée déja validée");
        }
        // 1. Récupérer tous les dossiers concernés
        List<ReservationDetails> detailsList = reservationDetailsRepository.findAllById(dto.reservationCode());

        for (ReservationDetails details : detailsList) {
            // Initialiser ou récupérer l'Invoice unique pour ce dossier
            Invoice invoice = getOrCreateInvoice(details);

            // 2. Grouper les réservations actives par chambre pour cette nuit
            // On ne valide que les réservations CONFIRMED (pas CLOSED ou CANCELLED)
            Map<Room, List<Reservation>> roomGroups = details.getReservations().stream()
                    .filter(r -> r.getRoom() != null)
                    .collect(Collectors.groupingBy(Reservation::getRoom));

            for (Map.Entry<Room, List<Reservation>> entry : roomGroups.entrySet()) {
                Room room = entry.getKey();
                List<Reservation> guestsInRoom = entry.getValue();
// LOGIQUE MISE À JOUR : Trouver la personne de référence pour le prix
                Person referencePerson = findReferencePersonForPricing(guestsInRoom);

                Double price = 0.0;
                if (isEligibleForPricing(referencePerson)) {
                    price = findPriceForRoom(room, referencePerson.getGrade().getCategory());
                }

                // 4. Créer le Snapshot de la nuitée (ValidatedNight)
                ValidatedNight night = ValidatedNight.builder()
                        .invoice(invoice)
                        .nightDate(dto.nightDate())
                        .roomApplied(room)
                        .roomName(room.getName())
                        .roomPriceApplied(price)
                        .observation(dto.observation())
                        .build();
                invoice.getValidatedNights().add(night);
                // 5. Capturer l'état des invités (GuestInfo)
                /*for (Reservation res : guestsInRoom) {
                    Person p = res.getPerson();
                    GuestInfo guestInfo = GuestInfo.builder()
                            .validatedNight(night)
                            .personId(p.getId())
                            .firstName(p.getFirstName())
                            .lastName(p.getLastName())
                            .grtadeCode(p.getGrade().getCode())
                            .matricule(p.getMatricule())
                            .unite(p.getUnite())
                            .role(res.getRole())
                            .identity(p.getIdentity())
                            .build();
                    night.getGuests().add(guestInfo);
                }*/

                validatedNightRepository.save(night);
            }

            // 6. Mettre à jour les totaux de la facture
            updateInvoiceTotals(invoice);
        }

        activityLogService.logActivity(
                EAuditActionTarget.INVOICE,
                EAuditActionOperation.MANAGEMENT,
                String.format("Valider la nuitée de %s.", dto.nightDate()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    private Person findReferencePersonForPricing(List<Reservation> reservations) {
        List<Person> persons = reservations.stream()
                .map(Reservation::getPerson)
                .toList();

        // 1. Militaires d'abord (inchangé)
        List<Person> militaires = persons.stream()
                //.filter(p -> p.getGrade() != null && !p.getGrade().getCode().equalsIgnoreCase("CIVIL"))
                .filter(p -> p.getGrade() != null && p.getGrade().getCategory() != EGradeCategory.CIVIL)
                .toList();

        if (!militaires.isEmpty()) {
            return militaires.stream()
                    .max(Comparator.comparingInt(p -> p.getGrade().getRating()))
                    .get();
        }

        // 2. Civils : Gestion sécurisée du null pour l'âge
        return persons.stream()
                .max(Comparator.comparing(Person::getBirthDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .orElse(persons.getFirst());
    }

    private boolean isEligibleForPricing(Person p) {
        // Militaire = Toujours payant selon sa catégorie
        if (p.getGrade() != null && p.getGrade().getCategory() != EGradeCategory.CIVIL) {
            return true;
        }

        // Civil : Si la date est nulle, on considère qu'il est majeur par défaut (Payant)
        if (p.getBirthDate() == null) {
            //log.warn("Date de naissance manquante pour le civil {}, tarif plein appliqué par défaut", p.getId());
            return true;
        }

        // Calcul sécurisé
        long age = java.time.temporal.ChronoUnit.YEARS.between(p.getBirthDate(), LocalDate.now());
        return age >= 18;
    }

    private Double findPriceForRoom(Room room, EGradeCategory category) {
        // On cherche le prix dans RoomType correspondant à la catégorie du grade
        return room.getRoomType().getPrices().stream()
                .filter(p -> p.getCategory() == category)
                .map(RoomPrice::getPrice)
                .findFirst()
                .orElse(0.0); // Ou un prix par défaut
    }

    private Invoice getOrCreateInvoice(ReservationDetails details) {
        return invoiceRepository.findByReservationDetails(details)
                .orElseGet(() -> invoiceRepository.save(Invoice.builder()
                        .reservationDetails(details)
                        .invoiceNumber("FAC-" + LocalDate.now().getYear() + "-" + details.getCode())
                        //.issuedAt(LocalDateTime.now())
                        //.paymentMode(EPaymentMode.PENDING) // Valeur par défaut
                        .validatedNights(new ArrayList<>())
                        .invoicePrestations(new ArrayList<>())
                        .category(details.getCategory())
                        .totalRoomPrice(0.0)
                        .totalPrestationPrice(0.0)
                        .priseEnCharge(details.isPriseEnCharge())
                        .priseEnChargeReference(details.getPriseEnChargeReference())
                        .category(details.getCategory())
                        .status(EInvoiceStatus.IN_PROGRESS)
                        .build()));
    }

    private void updateInvoiceTotals(Invoice invoice) {
        double roomTotal = invoice.getValidatedNights().stream()
                .mapToDouble(vn -> vn.getRoomPriceApplied() != null ? vn.getRoomPriceApplied() : 0.0)
                .sum();

        // Ajoutez ici la logique pour totalPrestationPrice si nécessaire
        invoice.setTotalRoomPrice(roomTotal);
        invoiceRepository.save(invoice);
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                                   INVOICE                                 ///
    /// /////////////////////////////////////////////////////////////////////////////

    public PageDto<InvoiceResponseDto> search(
            Authentication authentication,
            String key,
            List<String> paymentModes,
            boolean priseEnCharge,
            List<String> categories,
            List<String> status,
            LocalDate start,
            LocalDate end,
            Integer page, Integer size) {
        Page<Invoice> invoices = invoiceRepository.search(
                key,
                (paymentModes == null || paymentModes.isEmpty()) ? null:paymentModes,
                priseEnCharge,
                (categories == null || categories.isEmpty()) ? null:categories,
                (status == null || status.isEmpty()) ? null:status,
                start != null ? start.atStartOfDay() : null,
                start != null ? end.atTime(23, 59, 59) : null,
                start != null,
                PageRequest.of(page, size)
        );

        List<InvoiceResponseDto> list = invoices.stream().map(InvoiceResponseDto::mapToDto).toList();
        log.info("{} load invoices", authentication.getName());
        return PageDto.of(
                list,
                invoices.getTotalElements(),
                invoices.getTotalPages()
        );
    }

    public void payInvoice(Authentication authentication, PaymentRequestDto dto) {
        Invoice invoice = invoiceRepository.findById(dto.num())
                .orElseThrow(()-> new BadRequestException("Numero de facture invalide."));
        if (!EnumUtils.isValidEnum(EPaymentMode.class, dto.paymentMode()))
            throw new BadRequestException("mode de paiement invalide : " + dto.paymentMode());

        invoice.setPaidAt(LocalDateTime.now());
        invoice.setPaymentMode(EPaymentMode.valueOf(dto.paymentMode()));
        invoice.setStatus(EInvoiceStatus.PAID);
        invoice.setDescription(dto.observation());
        invoiceRepository.save(invoice);

        activityLogService.logActivity(
                EAuditActionTarget.INVOICE,
                EAuditActionOperation.MANAGEMENT,
                String.format(
                        "Paiement de la facture %s validé. Mode: %s.",
                        invoice.getInvoiceNumber(),
                        dto.paymentMode()
                ),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }


    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    protected List<ValidatedNight> getValidatedNights(ReservationDetails reservationDetails){
        return validatedNightRepository.getValidatedNights(reservationDetails.getCode());
    }
    protected void activateInvoice(ReservationDetails reservationDetails){
        // 1. Récupérer l'Invoice (doit être créée au préalable lors de la validation des nuits)
        Invoice invoice = invoiceRepository.findByReservationDetails(reservationDetails)
                .orElseThrow(() -> new BadRequestException("Facture non trouvée ou aucune nuitée a étè validée"));

        // 2. Créer l'objet racine des détails
        InvoiceDetails details = new InvoiceDetails();
        details.setInvoiceRooms(new ArrayList<>());

        // 3. Grouper les réservations par chambre
        Map<Room, List<Reservation>> roomGroups = reservationDetails.getReservations().stream()
                .filter(r -> r.getRoom() != null)
                .collect(Collectors.groupingBy(Reservation::getRoom));

        for (Map.Entry<Room, List<Reservation>> entry : roomGroups.entrySet()) {
            Room room = entry.getKey();
            List<Reservation> reservations = entry.getValue();

            // Snapshot de la chambre
            InvoiceRoom invRoom = InvoiceRoom.builder()
                    .roomName(room.getName())
                    .roomType(room.getRoomType().getType())
                    .invoiceDetails(details) // Lien vers le parent
                    .guests(new ArrayList<>())
                    .build();

            // Snapshot des invités dans cette chambre
            for (Reservation res : reservations) {
                Person p = res.getPerson();
                InvoiceGuest invGuest = InvoiceGuest.builder()
                        .invoiceRoom(invRoom)
                        .personId(p.getId())
                        .gradeCode(p.getGrade().getCode())
                        .identity(p.getIdentity())
                        .firstName(p.getFirstName())
                        .lastName(p.getLastName())
                        .matricule(p.getMatricule())
                        .unite(p.getUnite())
                        .role(res.getRole())
                        .nationality(p.getNationality())
                        .build();

                invRoom.getGuests().add(invGuest);
            }

            details.getInvoiceRooms().add(invRoom);
        }

        // 4. Persistance
        // Grâce au CascadeType.ALL sur invoiceRooms et guests,
        // sauvegarder 'details' sauvegarde toute la hiérarchie.
        invoice.setDetails(invoiceDetailsRepository.save(details));

        // 5. Mise à jour de l'état de la facture
        invoice.setStatus(EInvoiceStatus.UNPAID);
        invoice.setIssuedAt(LocalDateTime.now());

        // --- 2. Gestion des Prestations ---
        List<String> reservationIds = reservationDetails.getReservations().stream()
                .map(Reservation::getId)
                .toList();

        // 2. Récupérer les prestations via le repository
        List<Prestation> activePrestations = prestationRepository.findPrestationsByReservationIds(reservationIds);

        // 3. Mapper vers InvoicePrestation
        List<InvoicePrestation> invoicePrestations = activePrestations.stream()
                .map(p -> InvoicePrestation.builder()
                        .invoice(invoice)
                        .type(p.getType())
                        .name(p.getName() + " (Qté" + p.getQuantity() + ")")
                        .price(p.getPrice().multiply(BigDecimal.valueOf(p.getQuantity())).doubleValue())
                        .build())
                .toList();

        invoice.getInvoicePrestations().clear();
        invoice.getInvoicePrestations().addAll(invoicePrestations);

        double prestationTotal = 0.0;
        prestationTotal = invoice.getInvoicePrestations().stream()
                .filter(p -> p.getPrice() != null) // Sécurité
                .mapToDouble(InvoicePrestation::getPrice)
                .sum();
        invoice.setTotalPrestationPrice(prestationTotal);

        invoiceRepository.save(invoice);
    }

}
