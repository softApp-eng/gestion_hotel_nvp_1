package med.goeasy.cmohotel.presentation.dto.statistic;

import java.util.List;

public record OccupationStatsDto(
        String pavillonName,
        List<RoomTypeStatsDto> roomTypeStats,
        long totalRooms,
        long totalOccupiedRooms,
        double globalOccupationRate
) {
    public long getTotalDirect() {
        return roomTypeStats.stream().mapToLong(RoomTypeStatsDto::occupantsDirectPay).sum();
    }

    public long getTotalPEC() {
        return roomTypeStats.stream().mapToLong(RoomTypeStatsDto::occupantsPriseEnCharge).sum();
    }
}

