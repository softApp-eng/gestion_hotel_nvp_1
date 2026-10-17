package med.goeasy.cmohotel.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Nuits d'un séjour qui n'ont pas encore été validées à l'audit.
 * Plage facturable : [checkin, checkout[ (ou [checkin, aujourd'hui[ si toujours présent).
 */
public final class MissingNights {

    private MissingNights() {
    }

    public static List<LocalDate> of(LocalDateTime checkin, LocalDateTime checkout, Collection<LocalDate> validated) {
        if (checkin == null) {
            return List.of();
        }
        LocalDate start = checkin.toLocalDate();
        LocalDate end = checkout != null ? checkout.toLocalDate() : LocalDate.now();
        if (!start.isBefore(end)) {
            return List.of();
        }
        Set<LocalDate> done = validated == null ? Set.of() : new HashSet<>(validated);
        List<LocalDate> missing = new ArrayList<>();
        for (LocalDate d = start; d.isBefore(end); d = d.plusDays(1)) {
            if (!done.contains(d)) {
                missing.add(d);
            }
        }
        return missing;
    }
}
