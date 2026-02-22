package med.goeasy.cmohotel.security;

import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import med.goeasy.cmohotel.security.enums.EPermissions;
import med.goeasy.cmohotel.security.jwt.AccessDeniedHandlerJwt;
import med.goeasy.cmohotel.security.jwt.AuthEntryPointJwt;
import med.goeasy.cmohotel.security.jwt.AuthTokenFilter;
import med.goeasy.cmohotel.security.services.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.springframework.http.HttpMethod.*;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

	private final UserDetailsServiceImpl userDetailsService;
	private final AuthEntryPointJwt entryPointJwt;
	private final AccessDeniedHandlerJwt accessDeniedHandler;
	private final CorsConfigurationSource corsConfiguration;
	private final LogoutHandler logoutHandler;
	private final AuthTokenFilter authTokenFilter;

	@Bean
	public DaoAuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		authProvider.setUserDetailsService(userDetailsService);
		authProvider.setPasswordEncoder(passwordEncoder());
		return authProvider;
	}


	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
		return authConfig.getAuthenticationManager();
	}

	@Bean
	public WebSecurityCustomizer webSecurityCustomizer(){
		return web ->web.ignoring()
				.dispatcherTypeMatchers(DispatcherType.ERROR);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
  	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		return http.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests( auth -> auth
						.requestMatchers("/v1/auth/**","/public/**").permitAll()
						// users
						.requestMatchers(GET,"/v1/users/list").hasAuthority(EPermissions.ADMIN_USERS_LIST.getAuthority())
						.requestMatchers(GET,"/v1/users/one").hasAuthority(EPermissions.ADMIN_USERS_ONE.getAuthority())
						.requestMatchers(POST,"/v1/users/create").hasAuthority(EPermissions.ADMIN_USERS_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/users/update").hasAuthority(EPermissions.ADMIN_USERS_UPDATE.getAuthority())
						.requestMatchers(PUT,"/v1/users/password").hasAuthority(EPermissions.ADMIN_USERS_PASSWORD_MODIFY.getAuthority())
						.requestMatchers(PUT,"/v1/users/roles/assign").hasAuthority(EPermissions.ADMIN_USERS_ASSIGN_ROLES.getAuthority())
						.requestMatchers("/v1/users/resources/**").hasAuthority(EPermissions.ADMIN_USERS_RESOURCES_MANAGE.getAuthority())
						.requestMatchers(PUT,"/v1/audit/logs/**").hasAuthority(EPermissions.ADMIN_AUDIT_ACTIVITY_LOGS.getAuthority())
						// roles
						.requestMatchers(GET,"/v1/roles/list").hasAuthority(EPermissions.ADMIN_ROLES_LIST.getAuthority())
						.requestMatchers(GET,"/v1/roles/permissions").hasAuthority(EPermissions.ADMIN_ROLES_PERMISSIONS_LIST.getAuthority())
						.requestMatchers(POST,"/v1/roles/create").hasAuthority(EPermissions.ADMIN_ROLES_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/roles/update").hasAuthority(EPermissions.ADMIN_ROLES_UPDATE.getAuthority())
						.requestMatchers(GET,"/v1/roles/one").hasAuthority(EPermissions.ADMIN_ROLES_ONE.getAuthority())
						.requestMatchers(DELETE,"/v1/roles/delete").hasAuthority(EPermissions.ADMIN_ROLES_DELETE.getAuthority())
						.requestMatchers(GET,"/v1/roles/clone").hasAuthority(EPermissions.ADMIN_ROLES_CLONE.getAuthority())
						// persons
						.requestMatchers(POST,"/v1/persons/create").hasAuthority(EPermissions.PERSON_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/persons/update").hasAuthority(EPermissions.PERSON_UPDATE.getAuthority())
						.requestMatchers(GET,"/v1/persons/search").hasAuthority(EPermissions.PERSON_LIST.getAuthority())
						.requestMatchers(GET,"/v1/persons/one").hasAuthority(EPermissions.PERSON_SELECT_ONE.getAuthority())
						.requestMatchers(DELETE,"/v1/persons/delete").hasAuthority(EPermissions.PERSON_DELETE.getAuthority())
						// pavillons
						.requestMatchers(POST,"/v1/pavillons/create").hasAuthority(EPermissions.PAVILLON_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/pavillons/update").hasAuthority(EPermissions.PAVILLON_UPDATE.getAuthority())
						.requestMatchers(GET,"/v1/pavillons/all").hasAuthority(EPermissions.PAVILLON_LIST.getAuthority())
						.requestMatchers(GET,"/v1/pavillons/one").hasAuthority(EPermissions.PAVILLON_SELECT_ONE.getAuthority())
						// Rooms
						.requestMatchers(POST,"/v1/rooms/create").hasAuthority(EPermissions.ROOM_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/rooms/update").hasAuthority(EPermissions.ROOM_UPDATE.getAuthority())
						.requestMatchers(GET,"/v1/rooms/all").hasAuthority(EPermissions.ROOM_LIST.getAuthority())
						.requestMatchers(GET,"/v1/rooms/granted").hasAuthority(EPermissions.ROOM_LIST_GRANTED.getAuthority())
						.requestMatchers(GET,"/v1/rooms/one").hasAuthority(EPermissions.ROOM_SELECT_ONE.getAuthority())
						// Rooms types
						.requestMatchers(POST,"/v1/rooms/types/create").hasAuthority(EPermissions.ROOM_TYPE_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/rooms/types/update").hasAuthority(EPermissions.ROOM_TYPE_UPDATE.getAuthority())
						.requestMatchers(GET,"/v1/rooms/types/all").hasAuthority(EPermissions.ROOM_TYPE_LIST.getAuthority())
						.requestMatchers(GET,"/v1/rooms/types/one").hasAuthority(EPermissions.ROOM_TYPE_SELECT_ONE.getAuthority())
						.requestMatchers(DELETE,"/v1/rooms/types/delete").hasAuthority(EPermissions.ROOM_TYPE_DELETE.getAuthority())
						// Rooms prices
						.requestMatchers(POST,"/v1/rooms/prices/create").hasAuthority(EPermissions.ROOM_PRICE_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/rooms/prices/update").hasAuthority(EPermissions.ROOM_PRICE_UPDATE.getAuthority())
						.requestMatchers(GET,"/v1/rooms/prices/all","/v1/rooms/prices/byType").hasAuthority(EPermissions.ROOM_PRICE_LIST.getAuthority())
						.requestMatchers(GET,"/v1/rooms/prices/one").hasAuthority(EPermissions.ROOM_PRICE_SELECT_ONE.getAuthority())
						.requestMatchers(DELETE,"/v1/rooms/prices/delete").hasAuthority(EPermissions.ROOM_PRICE_DELETE.getAuthority())
						// Réservations
						.requestMatchers(POST,"/v1/reservations/create").hasAuthority(EPermissions.RESERVATION_CREATE.getAuthority())
						.requestMatchers(GET,"/v1/reservations/search","/v1/reservations/upcoming","/v1/reservations/planning/**").hasAuthority(EPermissions.RESERVATION_LIST.getAuthority())
						.requestMatchers(GET,"/v1/reservations/one").hasAuthority(EPermissions.RESERVATION_ONE.getAuthority())
						.requestMatchers(PUT,"/v1/reservations/accept").hasAuthority(EPermissions.RESERVATION_ACCEPT.getAuthority())
						.requestMatchers(PUT,"/v1/reservations/cancel").hasAuthority(EPermissions.RESERVATION_CANCEL.getAuthority())
						.requestMatchers(PUT,"/v1/reservations/close").hasAuthority(EPermissions.RESERVATION_CLOSE.getAuthority())
						.requestMatchers(DELETE,"/v1/reservations/delete").hasAuthority(EPermissions.RESERVATION_DELETE.getAuthority())
						// House keeping
						.requestMatchers(GET,"/v1/house-keeping/agents/all").hasAuthority(EPermissions.HOUSE_KEEPING_AGENT_LIST.getAuthority())
						.requestMatchers(POST,"/v1/house-keeping/agents/create").hasAuthority(EPermissions.HOUSE_KEEPING_AGENT_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/house-keeping/agents/update").hasAuthority(EPermissions.HOUSE_KEEPING_AGENT_UPDATE.getAuthority())
						.requestMatchers(DELETE,"/v1/house-keeping/agents/delete").hasAuthority(EPermissions.HOUSE_KEEPING_AGENT_DELETE.getAuthority())
						//.anyRequest().authenticated()
						.anyRequest().hasAuthority(EPermissions.DEFAULT.getAuthority())
				)
				.exceptionHandling(ex -> {
					ex.authenticationEntryPoint(entryPointJwt);
					ex.accessDeniedHandler(accessDeniedHandler);
				})
				.authenticationProvider(authenticationProvider())
				.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class)
				.logout(logout ->
						logout.logoutUrl("/logout")
								.addLogoutHandler(logoutHandler)
								.logoutSuccessHandler((request, response, authentication) -> SecurityContextHolder.clearContext())
				)
				.cors(httpSecurityCorsConfigurer -> httpSecurityCorsConfigurer.configurationSource(corsConfiguration))
				.build();
  	}
}
