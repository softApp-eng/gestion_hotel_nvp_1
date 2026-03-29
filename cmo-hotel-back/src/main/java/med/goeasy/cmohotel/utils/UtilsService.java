package med.goeasy.cmohotel.utils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Base64;
import org.springframework.util.StreamUtils;
@Slf4j
@RequiredArgsConstructor
@Component
public class UtilsService {

    private final ResourceLoader resourceLoader;

    public String getAppLogoAs64() throws IOException {
        Resource resource = resourceLoader.getResource("classpath:static/assets/cmo.png");
        byte[] imageBytes = StreamUtils.copyToByteArray(resource.getInputStream());
        return Base64.getEncoder().encodeToString(imageBytes);
    }

}
