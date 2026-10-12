package med.goeasy.cmohotel.service;

import jakarta.persistence.EntityNotFoundException;
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
import med.goeasy.cmohotel.presentation.dto.prices.PriceEstimationResponse;
import med.goeasy.cmohotel.utils.UtilsService;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
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
    private final SwitchedRoomRepository switchedRoomRepository;
    private final UtilsService utilsService;
    private final TemplateEngine templateEngine;
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
                Double price = guestsInRoom.stream()
                        .map(Reservation::getAppliedPrice)
                        .filter(Objects::nonNull)
                        .findFirst()
                        .orElse(0.0);


                /*// LOGIQUE MISE À JOUR : Trouver la personne de référence pour le prix
                Person referencePerson = findReferencePersonForPricing(guestsInRoom);

                Double price = 0.0;
                if (isEligibleForPricing(referencePerson)) {
                    price = findPriceForRoom(room, referencePerson.getGrade().getCategory());
                }*/

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


    public LocalDate getLastValidatedNight(){
        return validatedNightRepository.lastNight();
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
            String room,
            List<String> paymentModes,
            boolean priseEnCharge,
            List<String> categories,
            List<String> status,
            LocalDate start,
            LocalDate end,
            Integer page, Integer size) {
        Page<Invoice> invoices = invoiceRepository.search(
                key,
                room,
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

    public List<InvoiceResponseDto> getEncaissement(Authentication authentication, LocalDate day) {
        LocalDateTime start = day.atStartOfDay();
        LocalDateTime end = day.atTime(LocalTime.MAX);
        log.info("{} load paid invoices", authentication.getName());
        return invoiceRepository.findPaidInvoicesBetween(start, end).stream()
                .map(InvoiceResponseDto::mapToDto).toList();
    }

    public byte[] generateEncaissementPdf(Authentication authentication, LocalDate day) throws Exception {
        // 1. Définition de la plage horaire pour la journée
        LocalDateTime start = day.atStartOfDay();
        LocalDateTime end = day.atTime(LocalTime.MAX);

        // 2. Récupération et groupement des données
        List<Invoice> invoices = invoiceRepository.findPaidInvoicesBetween(start, end);

        // Groupement par mode de paiement
        Map<EPaymentMode, List<Invoice>> groupedInvoices = invoices.stream()
                .collect(Collectors.groupingBy(Invoice::getPaymentMode));

        // Calcul du grand total (Utilisation de BigDecimal recommandée pour la précision)
        double grandTotal = invoices.stream()
                .mapToDouble(i -> i.getTotalRoomPrice() + i.getTotalPrestationPrice())
                .sum();

        // 3. Préparation du contexte Thymeleaf
        Context context = new Context();
        context.setVariable("groupedInvoices", groupedInvoices);
        context.setVariable("grandTotal", grandTotal);
        context.setVariable("reportDate", day);
        context.setVariable("generatedBy", authentication.getName());
        context.setVariable("now", LocalDateTime.now());

        // Gestion du Logo
        String logoBase64 = utilsService.getAppLogoAs64();
        if (logoBase64 != null) {
            context.setVariable("logoBase64", "data:image/png;base64," + logoBase64);
        }

        // 4. Génération du HTML
        String htmlContent = templateEngine.process("encaissement", context);

        // 5. Rendu PDF
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();

            // Support pour les caractères spéciaux et formatage correct
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Erreur technique lors de la génération du PDF : {}", e.getMessage(), e);
            throw new BadRequestException("Impossible de générer le rapport d'encaissement pour le moment.");
        }
    }

    public void payInvoice(Authentication authentication, PaymentRequestDto dto) {
        Invoice invoice = invoiceRepository.findById(dto.num())
                .orElseThrow(()-> new BadRequestException("Numero de facture invalide."));
        if (!EnumUtils.isValidEnum(EPaymentMode.class, dto.paymentMode()))
            throw new BadRequestException("mode de paiement invalide : " + dto.paymentMode());

        EPaymentMode paymentMode = EPaymentMode.valueOf(dto.paymentMode());
        invoice.setPaidAt(LocalDateTime.now());
        invoice.setPaymentMode(paymentMode);
        invoice.setStatus(EInvoiceStatus.PAID);
        invoice.setDescription(dto.observation());
        ReservationDetails reservationDetails = invoice.getReservationDetails();
        invoice.setCheckin(reservationDetails.getCheckin());
        invoice.setCheckout(reservationDetails.getCheckout());
        invoice.setPriseEnCharge(paymentMode == EPaymentMode.PRISE_EN_CHARGE);
        invoice.setPriseEnChargeReference(dto.priseEnChargeRef());
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

    /**
     * Construit, pour chaque personne (réservation), le parcours de chambre
     * (chambre initiale puis chambres successives après délogement(s)).
     * Clé = personId, Valeur = "CH-101 > CH-102".
     */
    private Map<String, String> buildRoomChains(ReservationDetails reservationDetails) {
        Map<String, String> roomChainsMap = new HashMap<>();
        if (reservationDetails == null || reservationDetails.getReservations() == null) {
            return roomChainsMap;
        }

        for (Reservation res : reservationDetails.getReservations()) {
            if (res.getPerson() == null || res.getPerson().getId() == null) {
                continue;
            }

            String personId = res.getPerson().getId();
            List<SwitchedRoom> switches = res.getSwitchedRooms();

            if (switches != null && !switches.isEmpty()) {
                List<String> roomNames = new ArrayList<>();

                // 'switchedRooms' est annotée @OrderBy("switchTime DESC") : on remet l'ordre chronologique
                List<SwitchedRoom> chronologicalSwitches = new ArrayList<>(switches);
                Collections.reverse(chronologicalSwitches);

                // Chambre initiale (previousRoom du premier transfert)
                Room initialRoom = chronologicalSwitches.get(0).getPreviousRoom();
                if (initialRoom != null) {
                    roomNames.add(initialRoom.getName());
                }

                // Chaque nouvelle chambre au fil des transferts
                for (SwitchedRoom sr : chronologicalSwitches) {
                    if (sr.getNewRoom() != null) {
                        roomNames.add(sr.getNewRoom().getName());
                    }
                }

                roomChainsMap.put(personId, String.join(" > ", roomNames));

            } else if (res.getRoom() != null) {
                // Aucun transfert : chambre actuelle
                roomChainsMap.put(personId, res.getRoom().getName());
            }
        }
        return roomChainsMap;
    }

    public byte[] generateInvoicePdf(Authentication authentication, String num) throws Exception {
        // 1. Récupération de la facture (Invoice)
        Invoice invoice = invoiceRepository.findById(num)
                .orElseThrow(() -> new BadRequestException("Numéro de facture invalide."));

        if (invoice.getStatus() != EInvoiceStatus.PAID)
            throw new BadRequestException("Facture pas encore payée.");

        Map<String, String> roomChainsMap = buildRoomChains(invoice.getReservationDetails()); // Key: personId, Value: "CH-101 > CH-102"

        Context context = new Context();
        context.setVariable("invoice", invoice);
        context.setVariable("roomChains", roomChainsMap);
        context.setVariable("generatedBy", authentication.getName());
        context.setVariable("now", LocalDateTime.now());
        String logoBase64 = utilsService.getAppLogoAs64();
        context.setVariable("logoBase64", "data:image/png;base64," + logoBase64);

        String htmlContent = templateEngine.process("invoice", context);

        // 2. Audit de l'action
        activityLogService.logActivity(
                EAuditActionTarget.INVOICE,
                EAuditActionOperation.SELECT,
                String.format("Génération de la facture numéro %s.", invoice.getInvoiceNumber()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();

            // Support des caractères spéciaux (Optionnel mais recommandé pour le français)
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF : {}", e.getMessage());
            throw new BadRequestException("Échec de la génération du PDF de la facture.");
        }
    }

    public byte[] generateEtatExplicatifPdf(Authentication authentication, String num) throws Exception {
        // 1. Récupération de la facture (Invoice)
        Invoice invoice = invoiceRepository.findById(num)
                .orElseThrow(() -> new BadRequestException("Numéro de facture invalide."));

        if (!invoice.getReservationDetails().isPriseEnCharge())
            throw new BadRequestException("Facture non prise en charge.");

        // Parcours des chambres (délogements) par personne : personId -> "CH-101 > CH-102"
        Map<String, String> roomChains = buildRoomChains(invoice.getReservationDetails());

        // trie des client par role
        List<Map<String, Object>> guestsWithRoom = invoice.getDetails().getInvoiceRooms().stream()
                .flatMap(room -> room.getGuests().stream().map(guest -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("firstName", guest.getFirstName());
                    map.put("lastName", guest.getLastName());
                    map.put("role", guest.getRole());
                    map.put("gradeCode", guest.getGradeCode());
                    map.put("roomName", room.getRoomName()); // On récupère le nom depuis le parent 'room'
                    map.put("personId", guest.getPersonId());
                    // Affiche le parcours complet si délogement, sinon la chambre seule
                    map.put("roomChain", roomChains.getOrDefault(guest.getPersonId(), room.getRoomName()));
                    return map;
                })).sorted(Comparator.comparingInt(m -> ((EGuestRole) m.get("role")).getOrder())).collect(Collectors.toList());

        // Grouper les nuitées par date (triées par date)

        Map<LocalDate, List<ValidatedNight>> nightsByDate = invoice.getValidatedNights().stream()
                .collect(Collectors.groupingBy(
                        ValidatedNight::getNightDate,
                        TreeMap::new,
                        Collectors.toList()
                ));

        // Grouper les prestations par date

        List<Map<String, Object>> prestationsData = invoice.getInvoicePrestations().stream()
                .filter(p -> p.getDay() != null && p.getName() != null)
                .collect(Collectors.groupingBy(InvoicePrestation::getDay, TreeMap::new, Collectors.toList()))
                .entrySet().stream()
                .map(entry -> {
                    Map<String, Object> dayMap = new HashMap<>();
                    dayMap.put("date", entry.getKey());

                    // Groupement par résident puis par prestation : chaque personne conserve sa propre ligne
                    List<Map<String, Object>> lines = entry.getValue().stream()
                            .collect(Collectors.groupingBy(p ->
                                    (p.getGuestName() != null ? p.getGuestName() : "Sans nom") + "|" + p.getName()))
                            .entrySet().stream()
                            .map(nameEntry -> {
                                Map<String, Object> line = new HashMap<>();
                                InvoicePrestation first = nameEntry.getValue().get(0);
                                line.put("guestName", first.getGuestName());
                                line.put("name", first.getName());
                                line.put("type", first.getType().name());

                                // Somme des quantités
                                int totalQty = nameEntry.getValue().stream()
                                        .mapToInt(p -> p.getQuantity() != null ? p.getQuantity() : 1)
                                        .sum();
                                line.put("totalQty", totalQty);

                                // Somme des prix (Prix * Quantité)
                                double lineTotalPrice = nameEntry.getValue().stream()
                                        .mapToDouble(InvoicePrestation::getPrice)
                                        .sum();
                                line.put("totalPrice", lineTotalPrice);

                                return line;
                            }).collect(Collectors.toList());

                    dayMap.put("lines", lines);

                    // Total général de la journée
                    double dayTotal = lines.stream()
                            .mapToDouble(l -> (double) l.get("totalPrice"))
                            .sum();
                    dayMap.put("dayTotal", dayTotal);

                    return dayMap;
                })
                .collect(Collectors.toList());



        Context context = new Context();
        context.setVariable("invoice", invoice);
        context.setVariable("nightsByDate", nightsByDate);
        context.setVariable("prestationsData", prestationsData);
        context.setVariable("allGuests", guestsWithRoom);
        context.setVariable("roomChains", roomChains);
        context.setVariable("generatedBy", authentication.getName());
        context.setVariable("now", LocalDateTime.now());
        String logoBase64 = utilsService.getAppLogoAs64();
        context.setVariable("logoBase64", "data:image/png;base64," + logoBase64);

        String htmlContent = templateEngine.process("etat_explicatif", context);

        // 2. Audit de l'action
        activityLogService.logActivity(
                EAuditActionTarget.INVOICE,
                EAuditActionOperation.SELECT,
                String.format("Génération de l'état explicatif de la facture numéro %s.", invoice.getInvoiceNumber()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();

            // Support des caractères spéciaux (Optionnel mais recommandé pour le français)
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF : {}", e.getMessage());
            throw new BadRequestException("Échec de la génération du PDF de la facture.");
        }
    }

    //findByReservationDetails_Code

    public InvoiceResponseDto getInvoiceByReservationCode(Long code) {
        return InvoiceResponseDto.mapToDto(
                invoiceRepository.findByReservationDetails_Code(code).orElse(null)
        );
    }


    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    protected List<ValidatedNight> getValidatedNights(ReservationDetails reservationDetails){
        return validatedNightRepository.getValidatedNights(reservationDetails.getCode());
    }

    protected Optional<Invoice> getInvoiceByReservations(ReservationDetails reservationDetails){
        return invoiceRepository.findByReservationDetails(reservationDetails);
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
                .map(p -> {
                    Person guest = (p.getReservation() != null) ? p.getReservation().getPerson() : null;
                    return InvoicePrestation.builder()
                            .invoice(invoice)
                            .type(p.getType())
                            .name(p.getName())
                            .guestName(guest != null ? guest.getFullName() : null)
                            .quantity(p.getQuantity())
                            .price(p.getPrice().multiply(BigDecimal.valueOf(p.getQuantity())).doubleValue())
                            .day(p.getDay())
                            .build();
                })
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
