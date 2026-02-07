package med.goeasy.cmohotel.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app")
public record ConfigProperties(
        String jwtSecret,
        String jwtBearer,
        int jwtExpirationAccessMn,
        //   jwtTokenExpirationRefreshMn
        int jwtExpirationRefreshMn,
        String appName
) {
}
