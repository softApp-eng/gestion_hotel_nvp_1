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
import med.goeasy.cmohotel.presentation.dto.room.*;
import org.springframework.data.domain.Sort;
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
        RoomType roomType = getRoomTypeById(dto.roomTypeId());
        Pavillon pavillon = pavillonService.getPavillonById(dto.pavillonId());
        Room roomDb = getRoomById(id);
        Room room = RoomRequestDto.mapToEntity(dto);
        room.setRoomType(roomType);
        room.setPavillon(pavillon);
        room.setId(roomDb.getId());
        roomRepository.save(room);
        log.info("{} update room with id {}", authentication.getName(), room.getId());
    }

    public List<RoomResponseDto> getRooms(Authentication authentication, Long pavillonId, Boolean clean) {
        log.info("{} get rooms in pavillon id {}", authentication.getName(),pavillonId);
        return  roomRepository.getRooms(pavillonId,clean).stream().map(RoomResponseDto::mapToDto).toList();
    }

    public RoomResponseDto findById(Authentication authentication,Long id) {
        log.info("{} loads room with id {}", authentication.getName(), id);
        return RoomResponseDto.mapToDto(
                getRoomById(id)
        );
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                                  ROOM TYPES                               ///
    /// /////////////////////////////////////////////////////////////////////////////

    public List<RoomTypeDto> getRoomTypes(Authentication authentication) {
        log.info("{} get room types", authentication.getName());
        return roomTypeRepository.findAll(Sort.by("type")).stream().map(RoomTypeDto::mapToDto).toList();
    }

    public RoomTypeDto getRoomType(Authentication authentication,Long id) {
        log.info("{} get room type id {}", authentication.getName(),id);
        return RoomTypeDto.mapToDto(getRoomTypeById(id));
    }

    @Transactional
    public void createRoomType(Authentication authentication, RoomTypeRequestDto dto) {
        // check if the name already exist
        if (roomTypeRepository.existsByType(dto.type())) {
            throw new BadRequestException("Type de chambre déja existe");
        }
        RoomType type = RoomType.builder()
                .type(dto.type())
                .description(dto.description())
                .build();
        roomTypeRepository.save(type);
        log.info("{} save new room type with name {}", authentication.getName(), dto.type());
    }

    @Transactional
    public void updateRoomType(Authentication authentication, RoomTypeRequestDto dto,Long id) {
        // check if the name already exist
        if (roomTypeRepository.existsByTypeAndIdNot(dto.type(),id)) {
            throw new BadRequestException("Type de chambre déja existe");
        }
        RoomType roomTypeDb = getRoomTypeById(id);
        roomTypeDb.setType(dto.type());
        roomTypeDb.setDescription(dto.description());
        roomTypeRepository.save(roomTypeDb);
        log.info("{} update room type with id {}", authentication.getName(), id);
    }

    @Transactional
    public void deleteRoomType(Authentication authentication, Long id) {
        RoomType roomType = getRoomTypeById(id);
        List<Room> rooms = roomRepository.findByRoomType(roomType);
        rooms.forEach(room -> {
            room.setRoomType(null);
        });
        roomRepository.saveAll(rooms);
        roomTypeRepository.delete(roomType);

        log.info("{} remove room type with id {} and unlinked {} rooms",
                authentication.getName(), id, rooms.size());
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                                  ROOM PRICES                               ///
    /// /////////////////////////////////////////////////////////////////////////////

    public List<RoomPriceResponseDto> getRoomPrices(Authentication authentication) {
        log.info("{} get room prices", authentication.getName());
        return roomPriceRepository.findAll(Sort.by("price")).stream().map(RoomPriceResponseDto::mapToDto).toList();
    }

    public List<RoomPriceResponseDto> getRoomPricesByType(Authentication authentication,Long typeId) {
        log.info("{} get room prices by type id {}", authentication.getName(),typeId);
        return roomPriceRepository.findAllByType(typeId).stream().map(RoomPriceResponseDto::mapToDto).toList();
    }

    public RoomPriceResponseDto getRoomPrice(Authentication authentication,Long id) {
        log.info("{} get room price id {}", authentication.getName(),id);
        return RoomPriceResponseDto.mapToDto(getRoomPriceById(id));
    }

    @Transactional
    public void createRoomPrice(Authentication authentication, RoomPriceRequestDto dto) {
        // check if the name already exist
        if (roomPriceRepository.existsByRoomType_IdAndCategory(dto.roomTypeId(),dto.category())) {
            throw new BadRequestException("Prix déja existe");
        }
        RoomType  roomTypeDb = getRoomTypeById(dto.roomTypeId());
        RoomPrice price = RoomPrice.builder()
                .roomType(roomTypeDb)
                .category(dto.category())
                .price(dto.price())
                .build();
        roomPriceRepository.save(price);
        log.info("{} save new room price", authentication.getName());
    }

    @Transactional
    public void updateRoomPrice(Authentication authentication, RoomPriceRequestDto dto,Long id) {
        // check if the name already exist
        if (roomPriceRepository.existsByRoomType_IdAndCategoryAndIdNot(dto.roomTypeId(),dto.category(),id)) {
            throw new BadRequestException("Prix déja existe");
        }
        RoomPrice roomPriceDb = getRoomPriceById(id);
        RoomType  roomTypeDb = getRoomTypeById(dto.roomTypeId());
        roomPriceDb.setRoomType(roomTypeDb);
        roomPriceDb.setCategory(dto.category());
        roomPriceDb.setPrice(dto.price());
        roomPriceRepository.save(roomPriceDb);
        log.info("{} update room price with id {}", authentication.getName(), id);
    }

    @Transactional
    public void deleteRoomPrice(Authentication authentication, Long id) {
        RoomPrice roomPrice = getRoomPriceById(id);
        roomPriceRepository.delete(roomPrice);
        log.info("{} remove room price with id {}", authentication.getName(), id);
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
