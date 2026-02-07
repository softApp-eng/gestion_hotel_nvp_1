package med.goeasy.cmohotel.handler;

import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.View;

import java.util.HashSet;
import java.util.Set;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private final View error;

    public GlobalExceptionHandler(View error) {
        this.error = error;
    }

    @ExceptionHandler(value = TokenRefreshException.class)
    public ResponseEntity<ExceptionResponse> handleTokenRefreshException(TokenRefreshException ex, WebRequest request) {
     log.error(ex.getMessage());
     return ResponseEntity.status(HttpStatus.FORBIDDEN).
             body(
                     ExceptionResponse.builder()
                             .statusCode(HttpStatus.FORBIDDEN.value())
                             .message(ex.getMessage())
                             .description(request.getDescription(false))
                             .build()
             );
 }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ExceptionResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
      Set<String> errors = new HashSet<>();
      ex.getBindingResult().getAllErrors()
              .forEach(error -> {
                  //var fieldName = ((FieldError) error).getField();
                  var errorMessage = error.getDefaultMessage();
                  errors.add(errorMessage);
              });
   log.error(errors.toString());
   return ResponseEntity.status(HttpStatus.BAD_REQUEST).
           body(
                   ExceptionResponse.builder()
                   .statusCode(HttpStatus.BAD_REQUEST.value())
                   .message("Bad request")
                   .validationErrors(errors)
                   .build()
   );
  }

  @ExceptionHandler({HttpMessageNotReadableException .class})
  public ResponseEntity<ExceptionResponse> handleHttpMessageNotReadableException(Exception e) {
   log.error(e.getMessage());
   return ResponseEntity.status(BusinessErrorCodes.BAD_REQUEST_VALUES.getHttpStatus()).
           body(
                   ExceptionResponse.builder()
                           .statusCode(BusinessErrorCodes.BAD_REQUEST_VALUES.getCode())
                           .message(BusinessErrorCodes.BAD_REQUEST_VALUES.getMessage())
                           //.description(e.getMessage())
                           .description("JSON parse error, JSON bad formatted")
                           .build()
           );
  }

  @ExceptionHandler({MissingServletRequestParameterException.class,HandlerMethodValidationException.class})
  public ResponseEntity<ExceptionResponse> handleMissingServletRequestParameterException(Exception e) {
   log.error(e.getMessage());
   return ResponseEntity.status(BusinessErrorCodes.BAD_REQUEST_VALUES.getHttpStatus()).
           body(
                   ExceptionResponse.builder()
                           .statusCode(BusinessErrorCodes.BAD_REQUEST_VALUES.getCode())
                           .message(BusinessErrorCodes.BAD_REQUEST_VALUES.getMessage())
                           //.description(e.getMessage())
                           .description(e.getMessage())
                           .build()
           );
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ExceptionResponse> handleAuthenticationException(AuthenticationException e) {
   log.error(e.getMessage());
   return ResponseEntity.status(BusinessErrorCodes.UNAUTHORIZED_ACCESS.getHttpStatus()).
           body(
                   ExceptionResponse.builder()
                           .statusCode(BusinessErrorCodes.UNAUTHORIZED_ACCESS.getCode())
                           .message(BusinessErrorCodes.UNAUTHORIZED_ACCESS.getMessage())
                           .description(e.getMessage())
                           //.description(BusinessErrorCodes.UNAUTHORIZED_ACCESS.getMessage())
                           .build()
           );
  }

  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<ExceptionResponse> handle404Exception(AuthenticationException e) {
   log.error(e.getMessage());
   return ResponseEntity.status(BusinessErrorCodes.PAGE_NOT_FOUND.getHttpStatus()).
           body(
                   ExceptionResponse.builder()
                           .statusCode(BusinessErrorCodes.PAGE_NOT_FOUND.getCode())
                           .message(BusinessErrorCodes.PAGE_NOT_FOUND.getMessage())
                           .description(e.getMessage())
                           .build()
           );
  }

    @ExceptionHandler({BadRequestException.class})
    public ResponseEntity<ExceptionResponse> badRequestHandler(BadRequestException exception) {
        log.error(exception.getMessage());
        return ResponseEntity.status(BusinessErrorCodes.BAD_REQUEST_VALUES.getHttpStatus()).
                body(
                        ExceptionResponse.builder()
                                .statusCode(BusinessErrorCodes.BAD_REQUEST_VALUES.getCode())
                                .message(BusinessErrorCodes.BAD_REQUEST_VALUES.getMessage())
                                .description(exception.getMessage())
                                .build()
                );
    }

    @ExceptionHandler({OperationNotPermittedException.class})
    public ResponseEntity<ExceptionResponse> operationNotPermittedHandler(OperationNotPermittedException exception) {
        log.error(exception.getMessage());
        return ResponseEntity.status(BusinessErrorCodes.OPERATION_NOT_PERMITTED.getHttpStatus()).
                body(
                        ExceptionResponse.builder()
                                .statusCode(BusinessErrorCodes.OPERATION_NOT_PERMITTED.getCode())
                                .message(BusinessErrorCodes.OPERATION_NOT_PERMITTED.getMessage())
                                .description(exception.getMessage())
                                .build()
                );
    }

    @ExceptionHandler({UserNotFoundException.class})
    public ResponseEntity<ExceptionResponse> userNotFoundExceptionHandler(UserNotFoundException exception) {
        log.error(exception.getMessage());
        return ResponseEntity.status(BusinessErrorCodes.USER_NOT_FOUND.getHttpStatus()).
                body(
                        ExceptionResponse.builder()
                                .statusCode(BusinessErrorCodes.USER_NOT_FOUND.getCode())
                                .message(BusinessErrorCodes.USER_NOT_FOUND.getMessage())
                                .description(exception.getMessage())
                                .build()
                );
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleRestOfExceptions(Exception exp) {
        exp.printStackTrace();
        return ResponseEntity
                .status(BusinessErrorCodes.INTERNAL_ERROR.getHttpStatus())
                .body(
                        ExceptionResponse.builder()
                                .statusCode(BusinessErrorCodes.INTERNAL_ERROR.getCode())
                                .message(BusinessErrorCodes.INTERNAL_ERROR.getMessage())
                                .build()
                );
    }
}
