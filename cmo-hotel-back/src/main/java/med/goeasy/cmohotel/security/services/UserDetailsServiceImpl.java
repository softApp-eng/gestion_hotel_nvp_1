package med.goeasy.cmohotel.security.services;

import lombok.RequiredArgsConstructor;
import med.goeasy.cmohotel.persistence.repository.AppUserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

  private final AppUserRepository userRepository;

  @Override
  //@Transactional
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    return userRepository.findByUsernameAndAccountStatusTrue(username)
            .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));
  }

}
