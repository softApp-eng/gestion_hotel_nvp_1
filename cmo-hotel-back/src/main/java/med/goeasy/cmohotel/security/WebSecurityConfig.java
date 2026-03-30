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
						.requestMatchers(GET,"/v1/rooms/all/details").hasAuthority(EPermissions.ROOM_LIST_WITH_RESERVATION_DETAILS.getAuthority())
						.requestMatchers(GET,"/v1/rooms/granted").hasAuthority(EPermissions.ROOM_LIST_GRANTED.getAuthority())
						.requestMatchers(GET,"/v1/rooms/one").hasAuthority(EPermissions.ROOM_SELECT_ONE.getAuthority())
						.requestMatchers(DELETE,"/v1/rooms/delete").hasAuthority(EPermissions.ROOM_DELETE.getAuthority())
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
						.requestMatchers(PUT,"/v1/reservations/update").hasAuthority(EPermissions.RESERVATION_UPDATE.getAuthority())
						.requestMatchers(GET,"/v1/reservations/search","/v1/reservations/upcoming","/v1/reservations/planning/**","/v1/reservations/sejours").hasAuthority(EPermissions.RESERVATION_LIST.getAuthority())
						.requestMatchers(GET,"/v1/reservations/one").hasAuthority(EPermissions.RESERVATION_ONE.getAuthority())
						.requestMatchers(PUT,"/v1/reservations/accept").hasAuthority(EPermissions.RESERVATION_ACCEPT.getAuthority())
						.requestMatchers(PUT,"/v1/reservations/cancel").hasAuthority(EPermissions.RESERVATION_CANCEL.getAuthority())
						.requestMatchers(PUT,"/v1/reservations/close").hasAuthority(EPermissions.RESERVATION_CLOSE.getAuthority())
						.requestMatchers(DELETE,"/v1/reservations/delete").hasAuthority(EPermissions.RESERVATION_DELETE.getAuthority())
						.requestMatchers(DELETE,"/v1/reservations/residents").hasAuthority(EPermissions.RESERVATION_RESIDENTS.getAuthority())
						.requestMatchers(DELETE,"/v1/reservations/switch-room").hasAuthority(EPermissions.RESERVATION_ROOM_CHANGE.getAuthority())
						.requestMatchers(POST,"/v1/reservations/switch-room").hasAuthority(EPermissions.RESERVATION_ROOM_CHANGE.getAuthority())
						.requestMatchers(POST,"/v1/reservations/time/extend").hasAuthority(EPermissions.RESERVATION_TIME_EXTEND.getAuthority())
						.requestMatchers(GET,"/v1/reservations/download/fiche").hasAuthority(EPermissions.RESERVATION_FICHE_PDF.getAuthority())
						.requestMatchers(GET,"/v1/reservations/main-courante").hasAuthority(EPermissions.RESERVATION_MAIN_COURANTE.getAuthority())
						// House keeping
						.requestMatchers(GET,"/v1/house-keeping/agents/all").hasAuthority(EPermissions.HOUSE_KEEPING_AGENT_LIST.getAuthority())
						.requestMatchers(POST,"/v1/house-keeping/agents/create").hasAuthority(EPermissions.HOUSE_KEEPING_AGENT_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/house-keeping/agents/update").hasAuthority(EPermissions.HOUSE_KEEPING_AGENT_UPDATE.getAuthority())
						.requestMatchers(DELETE,"/v1/house-keeping/agents/delete").hasAuthority(EPermissions.HOUSE_KEEPING_AGENT_DELETE.getAuthority())
						.requestMatchers(GET,"/v1/house-keeping/history/search").hasAuthority(EPermissions.HOUSE_KEEPING_HISTORY_SEARCH.getAuthority())
						.requestMatchers(PUT,"/v1/house-keeping/housekeeping/room/availability").hasAuthority(EPermissions.HOUSE_KEEPING_ROOM_DISPONIBILITY.getAuthority())
						.requestMatchers(PUT,"/v1/house-keeping/housekeeping/room/clean").hasAuthority(EPermissions.HOUSE_KEEPING_ROOM_CLEAN_STATUS.getAuthority())
						.requestMatchers(PUT,"/v1/house-keeping/housekeeping/history/update").hasAuthority(EPermissions.HOUSE_KEEPING_HISTORY_UPDATE.getAuthority())
						.requestMatchers(DELETE,"/v1/house-keeping/housekeeping/history/delete").hasAuthority(EPermissions.HOUSE_KEEPING_HISTORY_DELETE.getAuthority())
						//Configuration
						.requestMatchers(POST,"/v1/administration/room/clean/cron").hasAuthority(EPermissions.ADMIN_CONFIG_ROOM_CLEAN_PLANIFICATION.getAuthority())
						.requestMatchers(GET,"/v1/administration/load-config").hasAuthority(EPermissions.ADMIN_CONFIG_LOAD.getAuthority())
						.requestMatchers(POST,"/v1/administration/checkout").hasAuthority(EPermissions.ADMIN_CONFIG_CHECKOUT.getAuthority())
						// meals
						.requestMatchers(GET,"/v1/meals/type/all").hasAuthority(EPermissions.MEAL_TYPES_LIST.getAuthority())
						.requestMatchers(POST,"/v1/meals/type/create").hasAuthority(EPermissions.MEAL_TYPES_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/meals/type/update").hasAuthority(EPermissions.MEAL_TYPES_UPDATE.getAuthority())

						.requestMatchers(GET,"/v1/meals/price/byType","/v1/meals/price/one").hasAuthority(EPermissions.MEAL_PRICE_LIST.getAuthority())
						.requestMatchers(POST,"/v1/meals/price/create").hasAuthority(EPermissions.MEAL_PRICE_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/meals/price/update").hasAuthority(EPermissions.MEAL_PRICE_UPDATE.getAuthority())
						.requestMatchers(DELETE,"/v1/meals/price/delete").hasAuthority(EPermissions.MEAL_PRICE_DELETE.getAuthority())
						// Préstations
						.requestMatchers(POST,"/v1/prestations/create","/v1/prestations/reservation/create").hasAuthority(EPermissions.PRESTATION_CREATE.getAuthority())
						.requestMatchers(PUT,"/v1/prestations/update").hasAuthority(EPermissions.PRESTATION_UPDATE.getAuthority())
						.requestMatchers(GET,"/v1/prestations/residents","/v1/prestations/reservation").hasAuthority(EPermissions.PRESTATION_FOR_RESIDENTS.getAuthority())
						.requestMatchers(DELETE,"/v1/prestations/delete").hasAuthority(EPermissions.PRESTATION_DELETE.getAuthority())

						// Invoices
						.requestMatchers(POST,"/v1/invoices/night/validate").hasAuthority(EPermissions.INVOICE_NIGHT_VALIDATE.getAuthority())
						.requestMatchers(POST,"/v1/invoices/pay").hasAuthority(EPermissions.INVOICE_PAY.getAuthority())
						.requestMatchers(GET,"/v1/invoices/search").hasAuthority(EPermissions.INVOICE_LIST.getAuthority())
						.requestMatchers(GET,"/v1/invoices/download/invoice").hasAuthority(EPermissions.INVOICE_INVOICE_PDF.getAuthority())
						.requestMatchers(GET,"/v1/invoices/encaissement").hasAuthority(EPermissions.INVOICE_ENCAISSEMENT.getAuthority())
						.requestMatchers(GET,"/v1/invoices/download/encaissement").hasAuthority(EPermissions.INVOICE_ENCAISSEMENT_PDF.getAuthority())

						// statistics & dashboards
						.requestMatchers(GET,"/v1/statistics/**").hasAuthority(EPermissions.STATISTICS_DASHBOARDS.getAuthority())

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
