package med.goeasy.cmohotel.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.audit.ActivityLogService;
import med.goeasy.cmohotel.audit.EAuditActionOperation;
import med.goeasy.cmohotel.audit.EAuditActionTarget;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.exception.OperationNotPermittedException;
import med.goeasy.cmohotel.persistence.entity.HousekeepingAgent;
import med.goeasy.cmohotel.persistence.entity.HousekeepingHistory;
import med.goeasy.cmohotel.persistence.entity.Room;
import med.goeasy.cmohotel.persistence.entity.auth.AppUser;
import med.goeasy.cmohotel.persistence.repository.HousekeepingAgentRepository;
import med.goeasy.cmohotel.persistence.repository.HousekeepingHistoryRepository;
import med.goeasy.cmohotel.persistence.repository.ReservationRepository;
import med.goeasy.cmohotel.persistence.repository.RoomRepository;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.request.HousekeepingAgentRequestDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.request.UpdateRoomCleanRequest;
import med.goeasy.cmohotel.presentation.dto.housekeeping.response.HousekeepingAgentResponseDto;
import med.goeasy.cmohotel.presentation.dto.housekeeping.response.RoomHousekeepingDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class HouseKeepingService {

    private final HousekeepingAgentRepository housekeepingAgentRepository;
    private final HousekeepingHistoryRepository housekeepingHistoryRepository;
    private final RoomService roomService;
    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

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
            boolean anomalie,
            LocalDate start,
            LocalDate end,
            Integer page, Integer size) {
        boolean isRange = start != null;
        Page<HousekeepingHistory> hitories = housekeepingHistoryRepository.searchHistory(
                key,
                RoomTypes.isEmpty()? null:RoomTypes,
                rooms.isEmpty()? null:rooms,
                agents.isEmpty()? null:agents,
                anomalie,
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

    @Transactional
    public void toggleRoomAvailability(Authentication authentication, Long roomId) {
        Room room = roomService.getRoomById(roomId);
        boolean isReserved = reservationRepository.isRoomOccupiedAt(room.getId(), LocalDateTime.now());
        if (isReserved)
            throw new OperationNotPermittedException("Chambre déja occcupée");

        room.setAvailable(!room.isAvailable());
        roomRepository.save(room);
        activityLogService.logActivity(
                EAuditActionTarget.HOUSEKEEPING,
                EAuditActionOperation.UPDATE,
                String.format("Mettre la chambre en etat '%s' '%s'.", room.getCode(),room.isAvailable() ? "Disponible" : "bloquée"),
                activityLogService.getClientIp(request),
                authentication.getName()
        );

    }

    @Transactional
    public void updateClean(Authentication authentication, UpdateRoomCleanRequest req) {
        Room room = roomService.getRoomById(req.roomId());
        HousekeepingAgent agent = getAgent(req.agentId());

        room.setClean(req.clean());
        roomRepository.save(room);
        HousekeepingHistory history = HousekeepingHistory.builder()
                .room(room)
                .room(room)
                .agent(agent)
                .startAt(req.startAt())
                .endAt(req.endAt())
                .comment(req.comment())
                .build();
        housekeepingHistoryRepository.save(history);
        activityLogService.logActivity(
                EAuditActionTarget.HOUSEKEEPING,
                EAuditActionOperation.UPDATE,
                String.format("Mise à jour le ménage de la chambre '%s' par '%s' .", room.getCode(),agent.getFirstName() +' ' +agent.getLastName()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void updateHistory(Authentication authentication, UpdateRoomCleanRequest req, Long id) {
        AppUser user = (AppUser) authentication.getPrincipal();
        HousekeepingHistory history = housekeepingHistoryRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("id historique introuvable"));
        // modification interdite aprés 24h
        boolean isExpired = history.getCreatedAt().isBefore(LocalDateTime.now().minusDays(1));

        if (!user.isAdmin() && isExpired) {
            throw new OperationNotPermittedException(
                    "Modification non autorisée après 24h. Veuillez consulter l'administrateur."
            );
        }

        history.setAgent(getAgent(req.agentId()));
        history.setStartAt(req.startAt());
        history.setEndAt(req.endAt());
        history.setComment(req.comment());
        housekeepingHistoryRepository.save(history);
        activityLogService.logActivity(
                EAuditActionTarget.HOUSEKEEPING,
                EAuditActionOperation.UPDATE,
                String.format("Mise à jour de l'historique du ménage de la chambre '%s'.", history.getRoom().getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
        );
    }

    @Transactional
    public void deleteHistory(Authentication authentication, Long id) {
        HousekeepingHistory history = housekeepingHistoryRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("id historique introuvable"));
        housekeepingHistoryRepository.deleteById(id);
        activityLogService.logActivity(
                EAuditActionTarget.HOUSEKEEPING,
                EAuditActionOperation.DELETE,
                String.format("Suppression de l'historique de gouvernance de la chambre '%s'.", history.getRoom().getCode()),
                activityLogService.getClientIp(request),
                authentication.getName()
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
        return housekeepingAgentRepository.findAgentById(id)
                .orElseThrow(()-> new BadRequestException("Agent n'existe pas"));
    }

}
