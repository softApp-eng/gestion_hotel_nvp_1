package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.invoice.request.NightValidationDto;
import med.goeasy.cmohotel.presentation.dto.invoice.response.InvoiceResponseDto;
import med.goeasy.cmohotel.service.InvoiceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import med.goeasy.cmohotel.presentation.dto.invoice.request.PaymentRequestDto;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/night/validate")
    ResponseEntity<ApiResponse> validateInvoiceNight(
            Authentication authentication,
            @Valid @RequestBody NightValidationDto dto
    ) {
        invoiceService.validateInvoiceNight(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Nuité validée").build());
    }

    @GetMapping("/search")
    ResponseEntity<PageDto<InvoiceResponseDto>> search(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "") String key,
            @RequestParam(required = false) List<String> paymentModes,
            @RequestParam(required = false) Boolean priseEnCharge,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate end,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size
    ){

        return ResponseEntity.ok(invoiceService.search(
                authentication,
                key,
                paymentModes,
                priseEnCharge != null && priseEnCharge,
                categories,
                status,
                start, end,
                page, size
        ));
    }

    @PostMapping("/pay")
    ResponseEntity<ApiResponse> payInvoice(
            Authentication authentication,
            @Valid @RequestBody PaymentRequestDto dto
    ) {
        invoiceService.payInvoice(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Facture enregistrée").build());
    }

}
