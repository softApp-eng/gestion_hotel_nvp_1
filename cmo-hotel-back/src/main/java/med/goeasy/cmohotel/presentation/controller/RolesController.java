package med.goeasy.cmohotel.presentation.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.presentation.dto.ApiResponse;
import med.goeasy.cmohotel.presentation.dto.role.PermissionDto;
import med.goeasy.cmohotel.presentation.dto.role.RoleRequestDto;
import med.goeasy.cmohotel.presentation.dto.role.RoleResponse;
import med.goeasy.cmohotel.service.RolesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/v1/roles")
@RestController
public class RolesController {

    private final RolesService rolesService;

    @GetMapping("/list")
    ResponseEntity<List<RoleResponse>> list(Authentication authentication){
        return ResponseEntity.ok(rolesService.list(authentication));
    }

    @GetMapping("/permissions")
    ResponseEntity<List<PermissionDto>> permissions(){
        return ResponseEntity.ok(rolesService.listPermissions());
    }

    @PostMapping("/create")
    ResponseEntity<ApiResponse> createRole(@Valid @RequestBody RoleRequestDto dto){
        rolesService.createRole(dto);
        return ResponseEntity.ok(ApiResponse.builder().message("role crée").build());
    }

    @PutMapping("/update")
    ResponseEntity<ApiResponse> update(
            @Valid @RequestBody RoleRequestDto dto,
            @Valid @NotNull(message = "role id requis") @RequestParam() String roleid
    ){
        rolesService.updateRole(dto,roleid);
        return ResponseEntity.ok(ApiResponse.builder().message("role modifié").build());
    }

    @GetMapping("/one")
    ResponseEntity<RoleResponse> one(
            @Valid @NotNull(message = "role id requis") @RequestParam() String roleid
    ){
        return ResponseEntity.ok(rolesService.roleById(roleid));
    }

    @DeleteMapping("/delete")
    ResponseEntity<ApiResponse> delete(
            @Valid @NotNull(message = "role id requis") @RequestParam() String roleid
    ){
        rolesService.deleteRole(roleid);
        return ResponseEntity.ok(ApiResponse.builder().message("role supprimé").build());
    }

    @GetMapping("/clone")
    ResponseEntity<ApiResponse> clone(
            @Valid @NotNull(message = "role id requis") @RequestParam() String roleid
    ){
        rolesService.cloneRole(roleid);
        return ResponseEntity.ok(ApiResponse.builder().message("role dupliqué").build());
    }

}
