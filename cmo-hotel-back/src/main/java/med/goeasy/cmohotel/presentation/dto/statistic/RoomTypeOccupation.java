package med.goeasy.cmohotel.presentation.dto.statistic;

public record RoomTypeOccupation(
        String roomType,
        Integer roomOccupied,
        String roomTotal
) {
}
