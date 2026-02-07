package med.goeasy.cmohotel.handler;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;

@Getter
public enum BusinessErrorCodes {
    UNAUTHORIZED_ACCESS(401, UNAUTHORIZED, "Unauthorized access"),
    PAGE_NOT_FOUND(404, NOT_FOUND, "Page not found"),
    OPERATION_NOT_PERMITTED(400, BAD_REQUEST, "Operation Not Permitted"),
    BAD_REQUEST_VALUES(400, BAD_REQUEST, "Bad request and / or invalid values"),
    USER_NOT_FOUND(400, BAD_REQUEST, "The user you looked for does not exist"),
    INTERNAL_ERROR(500, INTERNAL_SERVER_ERROR, "Internal error, please contact the admin"),
    BAD_CREDENTIALS(304, FORBIDDEN, "Login and / or Password is incorrect")
    ;

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    BusinessErrorCodes(int code, HttpStatus status, String message) {
        this.code = code;
        this.message = message;
        this.httpStatus = status;
    }
}
