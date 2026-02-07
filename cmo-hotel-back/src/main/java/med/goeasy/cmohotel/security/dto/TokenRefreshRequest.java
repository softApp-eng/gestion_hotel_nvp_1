package med.goeasy.cmohotel.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenRefreshRequest {
  @NotBlank(message = "missed refresh token")
  private String refreshToken;
}
