package med.goeasy.cmohotel.presentation.dto.statistic;

public record RoomTypeStatsDto(
        String typeName,
        long totalRoomsOfType,
        long occupiedRoomsOfType,
        long occupantsPriseEnCharge,
        long occupantsDirectPay,
        double occupationRate
) {}
