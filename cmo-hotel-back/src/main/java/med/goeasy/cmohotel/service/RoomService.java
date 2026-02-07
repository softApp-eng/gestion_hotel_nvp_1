package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.Pavillon;
import med.goeasy.cmohotel.persistence.entity.Room;
import med.goeasy.cmohotel.persistence.entity.RoomPrice;
import med.goeasy.cmohotel.persistence.entity.RoomType;
import med.goeasy.cmohotel.persistence.repository.RoomPriceRepository;
import med.goeasy.cmohotel.persistence.repository.RoomRepository;
import med.goeasy.cmohotel.persistence.repository.RoomTypeRepository;
import med.goeasy.cmohotel.presentation.dto.room.RoomRequestDto;
import med.goeasy.cmohotel.presentation.dto.room.RoomResponseDto;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomPriceRepository roomPriceRepository;
    private final PavillonService pavillonService;

    @Transactional
    public void create(Authentication authentication, RoomRequestDto dto) {
        // check if the code already exist
        if (roomRepository.existsByCode(dto.code())) {
            throw new BadRequestException("Code chambre déja existe");
        }
        RoomType roomType = getRoomTypeById(dto.roomTypeId());
        Pavillon pavillon = pavillonService.getPavillonById(dto.pavillonId());
        Room room = RoomRequestDto.mapToEntity(dto);
        room.setRoomType(roomType);
        room.setPavillon(pavillon);
        roomRepository.save(room);
        log.info("{} save new room with code {}", authentication.getName(), dto.code());
    }

    @Transactional
    public void update(Authentication authentication, RoomRequestDto dto,Long id) {
        // check if the name already exist
        if (roomRepository.existsByCodeAndIdNot(dto.code(),id)) {
            throw new BadRequestException("Code chambre déja existe");
        }
        Room roomDb = getRoomById(id);
        Room room = RoomRequestDto.mapToEntity(dto);
        room.setId(roomDb.getId());
        roomRepository.save(room);
        log.info("{} update room with id {}", authentication.getName(), room.getId());
    }

    public List<RoomResponseDto> getRooms(Authentication authentication, Long pavillonId) {
        log.info("{} get rooms in pavillon id {}", authentication.getName(),pavillonId);
        return  roomRepository.getRooms(pavillonId).stream().map(RoomResponseDto::mapToDto).toList();
    }

    public RoomResponseDto findById(Authentication authentication,Long id) {
        log.info("{} loads room with id {}", authentication.getName(), id);
        return RoomResponseDto.mapToDto(
                getRoomById(id)
        );
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    protected Room getRoomById(Long id){
        return roomRepository.findById(id)
                .orElseThrow(()-> new BadRequestException("Chambre n'existe pas"));
    }

    protected RoomType getRoomTypeById(Long id){
        return roomTypeRepository.findById(id)
                .orElseThrow(()-> new BadRequestException("Type de chambre n'existe pas"));
    }

    protected RoomPrice getRoomPriceById(Long id){
        return roomPriceRepository.findById(id)
                .orElseThrow(()-> new BadRequestException("Prix de chambre n'existe pas"));
    }
}
