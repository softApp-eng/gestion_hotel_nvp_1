package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.*;
import med.goeasy.cmohotel.persistence.entity.enums.EGuestRole;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationCategory;
import med.goeasy.cmohotel.persistence.entity.enums.EReservationStatus;
import med.goeasy.cmohotel.persistence.repository.ReservationDetailsRepository;
import med.goeasy.cmohotel.persistence.repository.ReservationRepository;
import med.goeasy.cmohotel.presentation.dto.PageDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationDetailsResponseDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationPersonsRequestDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationRequestDto;
import med.goeasy.cmohotel.presentation.dto.reservation.ReservationResponseDto;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;


@Slf4j
@RequiredArgsConstructor
@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationDetailsRepository reservationDetailsRepository;
    private final PersonService personService;
    private final RoomService roomService;

    @Transactional
    public void create(Authentication authentication, ReservationRequestDto dto) {

        if (!EnumUtils.isValidEnum(EReservationCategory.class, dto.category())) {
            throw new BadRequestException("categorie invalide : " + dto.category());
        }

        if (dto.persons() == null || dto.persons().isEmpty())
            throw new BadRequestException("Aucun client ajouté");

        EReservationCategory category = EReservationCategory.valueOf(dto.category());
        ReservationDetails details = ReservationDetails.builder()
                .plannedStart(dto.startDate().atStartOfDay())
                .plannedEnd(dto.endDate().atTime(23, 59, 59))
                .category(category)
                .status(EReservationStatus.PENDING)
                .observation(dto.observation())
                .build();
        details = reservationDetailsRepository.save(details);
        for(ReservationPersonsRequestDto person : dto.persons()){
            if (!EnumUtils.isValidEnum(EGuestRole.class, person.role())) {
                throw new BadRequestException("role invalide : " + person.role());
            }
            EGuestRole role = EGuestRole.valueOf(person.role());
            Person p = personService.getPersonById(person.personId());
            Room room = roomService.getRoomById(person.roomId());
            Reservation reservation = Reservation.builder()
                    .details(details)
                    .person(p)
                    .role(role)
                    .room(room)
                    //.status(EReservationStatus.PENDING)
                    .build();
            reservationRepository.save(reservation);
        }

        log.info("{} create reservation num {} for people {}", authentication.getName(),details.getCode(), dto.persons());
    }


    public PageDto<ReservationDetailsResponseDto> search(
            Authentication authentication,
            String key,
            List<EReservationCategory> categories,
            List<EReservationStatus> status,
            LocalDateTime start,
            LocalDateTime end,
            Integer page, Integer size) {
        Page<ReservationDetails> reservations = reservationDetailsRepository.search(
                key,
                categories.isEmpty()? null:categories,
                status.isEmpty()? null:status,
                start,
                end,
                PageRequest.of(page, size)
        );
        List<ReservationDetailsResponseDto> list = reservations.stream().map(ReservationDetailsResponseDto::mapToDto).toList();
        log.info("{} get reservations", authentication.getName());
        return PageDto.of(
                list,
                reservations.getTotalElements(),
                reservations.getTotalPages()
        );
    }

}
