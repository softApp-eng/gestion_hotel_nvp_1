package med.goeasy.cmohotel.presentation.dto.prices;

public record RoomPriceDetail(
        String roomName,
        double unitPrice,
        double totalPrice
) {}
