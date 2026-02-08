package med.goeasy.cmohotel.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import med.goeasy.cmohotel.exception.BadRequestException;
import med.goeasy.cmohotel.persistence.entity.Pavillon;
import med.goeasy.cmohotel.persistence.repository.PavillonRepository;
import med.goeasy.cmohotel.persistence.repository.RoomRepository;
import med.goeasy.cmohotel.presentation.dto.pavillon.PavillonRequestDto;
import med.goeasy.cmohotel.presentation.dto.pavillon.PavillonResponseDto;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class PavillonService {

    private final PavillonRepository pavillonRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public void create(Authentication authentication, PavillonRequestDto dto) {
        // check if the name already exist
        if (pavillonRepository.existsByName(dto.name())) {
            throw new BadRequestException("Pavillon déja existe");
        }
        Pavillon pavillon = PavillonRequestDto.mapToEntity(dto);
        pavillonRepository.save(pavillon);
        log.info("{} save new pavillon with name {}", authentication.getName(), dto.name());
    }

    @Transactional
    public void update(Authentication authentication, PavillonRequestDto dto,Long id) {
        // check if the name already exist
        if (pavillonRepository.existsByNameAndIdNot(dto.name(),id)) {
            throw new BadRequestException("Pavillon déja existe");
        }
        Pavillon pavillonDb = getPavillonById(id);
        Pavillon pavillon = PavillonRequestDto.mapToEntity(dto);
        pavillon.setId(pavillonDb.getId());
        pavillonRepository.save(pavillon);
        log.info("{} update pavillon with id {}", authentication.getName(), pavillon.getId());
    }

    public List<PavillonResponseDto> getPavillons(Authentication authentication) {
        log.info("{} get pavillons", authentication.getName());
        return pavillonRepository.getPavillons()
                .stream()
                .map(pavillon -> {
                    Map<String, Long> count = getRoomTypeDistributionByPavillon(pavillon.getId());
                    return PavillonResponseDto.mapToDto(pavillon, count);
                })
                .toList();
    }

    public PavillonResponseDto findById(Authentication authentication,Long id) {
        log.info("{} loads pavillon with id {}", authentication.getName(), id);
        return PavillonResponseDto.mapToDto(
                getPavillonById(id)
        );
    }

    /// /////////////////////////////////////////////////////////////////////////////
    ///                              EXTRAS FUNCTIONS                             ///
    /// /////////////////////////////////////////////////////////////////////////////

    protected Pavillon getPavillonById(Long id){
        return pavillonRepository.findById(id)
                .orElseThrow(()-> new BadRequestException("Pavillon n'existe pas"));
    }

    protected Map<String, Long> getRoomTypeDistributionByPavillon(Long pavillonId) {
        List<Object[]> results = roomRepository.countRoomsByTypeByPavillonId(pavillonId);

        return results.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0], // Nom du RoomType
                        row -> (Long) row[1]    // Nombre total de chambres
                ));
    }
}
