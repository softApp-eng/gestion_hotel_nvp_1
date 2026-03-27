package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.persistence.entity.enums.EInvoiceStatus;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.persistence.repository.InvoiceRepository;
import med.goeasy.cmohotel.persistence.repository.ReservationDetailsRepository;
import med.goeasy.cmohotel.persistence.repository.ReservationRepository;
import med.goeasy.cmohotel.persistence.repository.RoomRepository;
import med.goeasy.cmohotel.presentation.dto.statistic.RoomTypeOccupation;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class StatisticsService {

    private final InvoiceRepository invoiceRepository;
    private final ReservationDetailsRepository reservationDetailsRepository;
    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;


    /// /////////////////////////////////////////////////////////////////////////////
    ///                          INVOICES STATISTICS                              ///
    /// /////////////////////////////////////////////////////////////////////////////

    public Map<String,Long> getFinancialStatistics(Authentication authentication) {
        long prestation = invoiceRepository.countPrestationPrice(List.of(EInvoiceStatus.PAID));
        long hosting = invoiceRepository.countHostingPrice(List.of(EInvoiceStatus.PAID));
        long hostingNotPaid = invoiceRepository.countHostingPrice(List.of(EInvoiceStatus.IN_PROGRESS,EInvoiceStatus.UNPAID));
        long prestationNotPaid = invoiceRepository.countPrestationPrice(List.of(EInvoiceStatus.IN_PROGRESS,EInvoiceStatus.UNPAID));
        log.info("{} loads financial statistics", authentication.getName());
        return Map.of(
                "hosting",hosting,
                "prestation",prestation,
                "total",hosting + prestation,
                "hostingInProgress",hostingNotPaid,
                "prestationInProgress",prestationNotPaid
        );
    }

    public Map<Integer, Double> getMonthlyRevenueMap(Authentication authentication, int year, List<String> paymentModes, List<String> categories) {
        log.info("{} loads monthly financial statistics", authentication.getName());
        return invoiceRepository.getRawMonthlyRevenue(
                year,
                        (paymentModes == null || paymentModes.isEmpty()) ? null:paymentModes,
                        (categories == null || categories.isEmpty()) ? null:categories
                ).stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0], // Le mois
                        row -> (Double) row[1]   // Le total
                ));
    }

    public Map<String, Double> getRoomTypeRevenue(Authentication authentication) {
        log.info("{} loads room type financial statistics", authentication.getName());
        return invoiceRepository.getRoomTypeRevenue().stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0], // Le mois
                        row -> (Double) row[1]   // Le total
                ));
    }


    /// /////////////////////////////////////////////////////////////////////////////
    ///                        RESERVATIONS STATISTICS                            ///
    /// /////////////////////////////////////////////////////////////////////////////

    public Map<Integer, Long> getMonthlyReservations(Authentication authentication, int year) {
        log.info("{} loads monthly reservations statistics", authentication.getName());
        return reservationDetailsRepository.getRawMonthlyReservationsCounts(year,null).stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0], // Le mois
                        row -> (Long) row[1]   // Le count
                ));
    }

    public Map<String,Map<Integer, Long>> getMonthlyReservationsByCategories(Authentication authentication, int year) {

        Map<Integer, Long> family = reservationDetailsRepository.getRawMonthlyReservationsCounts(year, List.of(EReservationCategory.FAMILY)).stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0], // Le mois
                        row -> (Long) row[1]   // Le count
                ));
        Map<Integer, Long> single = reservationDetailsRepository.getRawMonthlyReservationsCounts(year, List.of(EReservationCategory.SINGLE)).stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0], // Le mois
                        row -> (Long) row[1]   // Le count
                ));
        Map<Integer, Long> delegation = reservationDetailsRepository.getRawMonthlyReservationsCounts(year, List.of(EReservationCategory.DELEGATION)).stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0], // Le mois
                        row -> (Long) row[1]   // Le count
                ));
        log.info("{} loads monthly reservations statistics by categories", authentication.getName());
        return Map.of(
                "family",family,
                "single",single,
                "delegation",delegation
        );
    }

    public Map<String,Long> getReservationsStatistics(Authentication authentication) {

        log.info("{} loads reservations statistics", authentication.getName());
        return Map.of(
                "canceledReservations",reservationDetailsRepository.countReservationsByStatus(List.of(EReservationStatus.CANCELED)),
                "confirmedReservations",reservationDetailsRepository.countReservationsByStatus(List.of(EReservationStatus.CONFIRMED,EReservationStatus.CLOSED)),

                "singleReservations",reservationDetailsRepository.countReservationsByCategories(List.of(EReservationCategory.SINGLE)),
                "familyReservations",reservationDetailsRepository.countReservationsByCategories(List.of(EReservationCategory.FAMILY)),
                "delegationReservations",reservationDetailsRepository.countReservationsByCategories(List.of(EReservationCategory.DELEGATION)),
                "priseEnChargeReservations",reservationDetailsRepository.countReservationsPriseEnCharge()
        );
    }

    public Map<String,Long> getReservationsCurrentState(Authentication authentication) {
        log.info("{} loads reservations current statistics", authentication.getName());
        return Map.of(
                // today
                "pendingReservations",reservationDetailsRepository.countTotalReservations(List.of(EReservationStatus.PENDING)),
                //"canceledReservations",reservationDetailsRepository.countTodayReservations(List.of(EReservationStatus.CANCELED),start,end),
                "activeReservations",reservationDetailsRepository.countTotalReservations(List.of(EReservationStatus.CONFIRMED)),
                "residents",reservationRepository.countResidents(List.of(EReservationStatus.CONFIRMED)),
                // global
                "totalReservations",reservationDetailsRepository.countTotalReservations(List.of(EReservationStatus.CONFIRMED,EReservationStatus.CLOSED)),
                "totalCanceledReservations",reservationDetailsRepository.countTotalReservations(List.of(EReservationStatus.CANCELED)),
                "totalResidents",reservationRepository.countResidents(null)
        );
    }

    public List<RoomTypeOccupation> getRoomTypeOccupationStatistics(Authentication authentication) {

        // 1. Récupérer le total des chambres par type
        List<Object[]> totalResults = roomRepository.countTotalRoomsByType();
        Map<String, Long> totalMap = totalResults.stream()
                .collect(Collectors.toMap(
                        res -> (String) res[0],
                        res -> (Long) res[1]
                ));

        // 2. Récupérer l'occupation actuelle
        List<Object[]> occupiedResults = reservationRepository.countOccupiedRoomsByType();
        Map<String, Long> occupiedMap = occupiedResults.stream()
                .collect(Collectors.toMap(
                        res -> (String) res[0],
                        res -> (Long) res[1]
                ));

        log.info("{} loads room type occupation statistics", authentication.getName());
        return totalMap.entrySet().stream()
                .map(entry -> {
                    String type = entry.getKey();
                    Integer occupied = occupiedMap.getOrDefault(type, 0L).intValue();
                    String total = String.valueOf(entry.getValue());

                    return new RoomTypeOccupation(type, occupied, total);
                })
                .sorted(Comparator.comparing(RoomTypeOccupation::roomType))
                .collect(Collectors.toList());
    }

}
