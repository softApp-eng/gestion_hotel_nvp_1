package med.goeasy.cmohotel.presentation.dto.prices;

import java.util.List;

public record PriceEstimationResponse(
        List<RoomPriceDetail> details,
        double totalAmount,
        long durationInDays
) {}


