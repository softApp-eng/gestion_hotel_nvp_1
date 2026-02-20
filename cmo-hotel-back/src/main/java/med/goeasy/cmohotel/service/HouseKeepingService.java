package med.goeasy.cmohotel.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.HousekeepingAgent;
import med.goeasy.cmohotel.persistence.entity.HousekeepingHistory;
import med.goeasy.cmohotel.persistence.entity.ReservationDetails;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.persistence.repository.HousekeepingAgentRepository;
import med.goeasy.cmohotel.persistence.repository.HousekeepingHistoryRepository;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.request.HousekeepingAgentRequestDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.response.HousekeepingAgentResponseDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.response.RoomHousekeepingDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationDetailsResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class HouseKeepingService {

    private final HousekeepingAgentRepository housekeepingAgentRepository;
    private final HousekeepingHistoryRepository housekeepingHistoryRepository;

    private final ActivityLogService activityLogService;
    private final HttpServletRequest request;

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              HOUSE KEEPING FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    public PageDto<RoomHousekeepingDto> searchHouseKeepingHistory(
            Authentication authentication,
            String key,
            List<Long> RoomTypes,
            List<Long> rooms,
            List<Long> agents,
            LocalDate start,
            LocalDate end,
            Integer page, Integer size) {
        boolean isRange = start != null;
        Page<HousekeepingHistory> hitories = housekeepingHistoryRepository.searchHistory(
                key,
                RoomTypes.isEmpty()? null:RoomTypes,
                rooms.isEmpty()? null:rooms,
                agents.isEmpty()? null:agents,
                start != null ? start.atStartOfDay() : null,
                start != null ? end.atTime(23, 59, 59) : null,
                isRange,
                PageRequest.of(page, size)
        );

        List<RoomHousekeepingDto> list = hitories.stream().map(RoomHousekeepingDto::mapToDto).toList();
        log.info("{} get house keeping history", authentication.getName());
        return PageDto.of(
                list,
                hitories.getTotalElements(),
                hitories.getTotalPages()
        );
    }


    /// /////////////////////////////////////////////////////////////////////////////
    ///                              AGENTS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    public HousekeepingAgentResponseDto createAgent(Authentication authentication, HousekeepingAgentRequestDto dto) {
        HousekeepingAgent agent = HousekeepingAgentRequestDto.mapToEntity(dto);
        agent = housekeepingAgentRepository.save(agent);
        activityLogService.logActivity(
                EAuditActionTarget.HOUSEKEEPING,
                EAuditActionOperation.CREATE,
                String.format("Création de l'agent '%s' '%s'.", agent.getFirstName(),agent.getLastName()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
        return HousekeepingAgentResponseDto.mapToDto(agent);
    }

    @Transactional
    public HousekeepingAgentResponseDto updateAgent(Authentication authentication, Long id, HousekeepingAgentRequestDto dto) {

        HousekeepingAgent agentDb = getAgent(id);
        HousekeepingAgent agent = HousekeepingAgentRequestDto.mapToEntity(dto);
        agent.setId(agentDb.getId());
        housekeepingAgentRepository.save(agent);
        activityLogService.logActivity(
                EAuditActionTarget.HOUSEKEEPING,
                EAuditActionOperation.UPDATE,
                String.format("Modification de l'agent '%s' '%s'.", agent.getFirstName(),agent.getLastName()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
        return HousekeepingAgentResponseDto.mapToDto(agent);
    }

    public List<HousekeepingAgentResponseDto> getActiveAgents() {
        return housekeepingAgentRepository.getAgents()
                .stream()
                .map(HousekeepingAgentResponseDto::mapToDto)
                .toList();
    }

    @Transactional
    public void deleteAgent(Authentication authentication, Long id) {
        HousekeepingAgent agent = getAgent(id);
        long historyCount = housekeepingHistoryRepository.countByAgent_Id(agent.getId());
        if (historyCount > 0) {
            agent.setArchived(true);
            housekeepingAgentRepository.save(agent);
        } else
            housekeepingAgentRepository.delete(agent);

        activityLogService.logActivity(
                EAuditActionTarget.HOUSEKEEPING,
                EAuditActionOperation.DELETE,
                String.format("Suppression de l'agent '%s' '%s'.", agent.getFirstName(),agent.getLastName()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    protected HousekeepingAgent getAgent(Long id){
        return housekeepingAgentRepository.findById(id)
                .orElseThrow(()-> new BadRequestException("Agent n'existe pas"));
    }

}
