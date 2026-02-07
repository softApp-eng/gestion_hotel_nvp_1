package med.goeasy.cmohotel.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import med.goeasy.cmohotel.presentation.dto.user.UserResponse;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Token{
    private String accessToken;
    private String refreshToken;
    private UserResponse user;
}
