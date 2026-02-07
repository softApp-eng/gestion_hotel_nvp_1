package med.goeasy.cmohotel.security.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.security.jwt.JwtUtils;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class LogoutService implements LogoutHandler {

    private final JwtUtils jwtUtils;
    private final TokenServiceFace tokenService;
    private final ObjectMapper mapper;

    @Override
    public void logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {
        try {
            final String jwt = jwtUtils.parseJwt(request);
            tokenService.deleteByToken(jwtUtils.getIdFromJwtToken(jwt));
            log.info("logged out");
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpServletResponse.SC_OK);
            mapper.writeValue(
                    response.getOutputStream(),
                    ApiResponse.builder()
                            .message("logged out")
                            .build()
            );
        }catch (Exception exception){
            log.error("logout not accepted");
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpServletResponse.SC_NOT_ACCEPTABLE);
            try {
                mapper.writeValue(
                        response.getOutputStream(),
                        Map.of("status", HttpServletResponse.SC_NOT_ACCEPTABLE,
                                "error", "NOT_ACCEPTABLE",
                                "message", "logout not accepted",
                                "path", request.getServletPath())
                );
            } catch (IOException e) {
                throw new BadRequestException("logout error");
            }
        }
    }
}
