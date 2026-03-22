package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.persistence.repository.InvoiceRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class StatisticsService {

    private final InvoiceRepository invoiceRepository;

    public Map<String,Long> getFinancialStatistics(Authentication authentication) {
        long hosting = invoiceRepository.countPrestationPrice();
        long prestation = invoiceRepository.countHostingPrice();
        return Map.of(
                "hosting",hosting,
                "prestation",prestation,
                "total",hosting + prestation
        );
    }

    public Map<Integer, Double> getMonthlyRevenueMap(int year, List<String> paymentModes, List<String> categories) {
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

    public Map<String, Double> getRoomTypeRevenue() {
        return invoiceRepository.getRoomTypeRevenue().stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0], // Le mois
                        row -> (Double) row[1]   // Le total
                ));
    }
}
