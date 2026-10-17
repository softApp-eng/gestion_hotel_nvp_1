package med.goeasy.cmohotel.presentation.controller;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.invoice.request.NightCorrectionDto;
import med.goeasy.cmohotel.presentation.dto.invoice.request.NightValidationDto;
import med.goeasy.cmohotel.presentation.dto.invoice.request.PaymentRequestDto;
import med.goeasy.cmohotel.presentation.dto.invoice.request.PrestationCorrectionDto;
import med.goeasy.cmohotel.presentation.dto.invoice.response.InvoiceResponseDto;
import med.goeasy.cmohotel.service.InvoiceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
            @RequestParam(required = false, defaultValue = "") String room,
            @RequestParam(required = false) List<String> paymentModes,
            @RequestParam(required = false) Boolean priseEnCharge,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate end,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate checkinFrom,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate checkinTo,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate checkoutFrom,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate checkoutTo,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size
    ){

        return ResponseEntity.ok(invoiceService.search(
                authentication,
                key,
                room,
                paymentModes,
                priseEnCharge != null && priseEnCharge,
                categories,
                status,
                start, end,
                checkinFrom != null ? checkinFrom.atStartOfDay() : null,
                checkinTo != null ? checkinTo.atTime(23, 59, 59) : null,
                checkoutFrom != null ? checkoutFrom.atStartOfDay() : null,
                checkoutTo != null ? checkoutTo.atTime(23, 59, 59) : null,
                page, size
        ));
    }

    @GetMapping("/encaissement")
    ResponseEntity<List<InvoiceResponseDto>> paidInvoices(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate day
    ){
        if (day == null) day = LocalDate.now();
        return ResponseEntity.ok(invoiceService.getEncaissement(
                authentication,day
        ));
    }

    @GetMapping("/get-by-reservation")
    ResponseEntity<InvoiceResponseDto> paidInvoices(
            @RequestParam @NotNull(message = "code de reservation requis") Long code
    ){
        return ResponseEntity.ok(invoiceService.getInvoiceByReservationCode(
                code
        ));
    }

    @GetMapping("/last-validated-night")
    ResponseEntity<LocalDate> getLastValidatedNight(){
        return ResponseEntity.ok(invoiceService.getLastValidatedNight());
    }

    @PutMapping("/night/update")
    ResponseEntity<ApiResponse> updateValidatedNight(
            Authentication authentication,
            @RequestParam String id,
            @Valid @RequestBody NightCorrectionDto dto
    ) {
        invoiceService.updateValidatedNight(authentication, id, dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Nuitée corrigée avec succès.").build());
    }

    @DeleteMapping("/night/delete")
    ResponseEntity<ApiResponse> deleteValidatedNight(
            Authentication authentication,
            @RequestParam String id
    ) {
        invoiceService.deleteValidatedNight(authentication, id);
        return ResponseEntity.ok(ApiResponse.builder().message("Nuitée supprimée avec succès.").build());
    }

    @PutMapping("/prestation/update")
    ResponseEntity<ApiResponse> updateInvoicePrestation(
            Authentication authentication,
            @RequestParam Long id,
            @Valid @RequestBody PrestationCorrectionDto dto
    ) {
        invoiceService.updateInvoicePrestation(authentication, id, dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Prestation corrigée avec succès.").build());
    }

    @DeleteMapping("/prestation/delete")
    ResponseEntity<ApiResponse> deleteInvoicePrestation(
            Authentication authentication,
            @RequestParam Long id
    ) {
        invoiceService.deleteInvoicePrestation(authentication, id);
        return ResponseEntity.ok(ApiResponse.builder().message("Prestation supprimée avec succès.").build());
    }

    @PostMapping("/pay")
    ResponseEntity<ApiResponse> payInvoice(
            Authentication authentication,
            @Valid @RequestBody PaymentRequestDto dto
    ) {
        invoiceService.payInvoice(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Facture enregistrée").build());
    }

    @PutMapping("/payment-mode")
    ResponseEntity<ApiResponse> changePaymentMode(
            Authentication authentication,
            @Valid @RequestBody PaymentRequestDto dto
    ) {
        invoiceService.changePaymentMode(authentication,dto);
        return ResponseEntity.ok(ApiResponse.builder().message("Mode de paiement modifié").build());
    }

    @GetMapping("/download/invoice")
    public ResponseEntity<byte[]> generateInvoicePdf( Authentication authentication,@Valid @NotNull(message = "numero de facture requis") @RequestParam() String num) throws Exception {
        byte[] pdf = invoiceService.generateInvoicePdf(authentication,num);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Facture_" + num + ".pdf");

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/download/etat-explicatif")
    public ResponseEntity<byte[]> generateEtatExplicatifPdf( Authentication authentication,@Valid @NotNull(message = "numero de facture requis") @RequestParam() String num) throws Exception {
        byte[] pdf = invoiceService.generateEtatExplicatifPdf(authentication,num);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Facture_" + num + ".pdf");

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/download/encaissement")
    public ResponseEntity<byte[]> generateEncaissementPdf( Authentication authentication,@RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate day) throws Exception {
        byte[] pdf = invoiceService.generateEncaissementPdf(authentication,day);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Encaissement.pdf");

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

}
