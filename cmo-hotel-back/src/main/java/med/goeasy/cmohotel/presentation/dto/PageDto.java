package med.goeasy.cmohotel.presentation.dto;

import java.util.List;

public record PageDto<T> (
        List<T> content,
        long totalElements,
        int totalPages
) {
    public static <T> PageDto<T> of(List<T> content, long totalElements, int totalPages) {
        return new PageDto<>(content, totalElements, totalPages);
    }
}
