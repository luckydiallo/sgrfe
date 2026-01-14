package bf.ibam.sgrfe.service;

import bf.ibam.sgrfe.config.Constants;
import bf.ibam.sgrfe.domain.*;
import bf.ibam.sgrfe.repository.*;
import bf.ibam.sgrfe.security.AuthoritiesConstants;
import bf.ibam.sgrfe.security.SecurityUtils;
import bf.ibam.sgrfe.service.dto.AdminUserDTO;
import bf.ibam.sgrfe.service.dto.UserDTO;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import tech.jhipster.security.RandomUtil;

/**
 * Service class for managing users.
 */
@Service
public class UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthorityRepository authorityRepository;
    private final FiliereRepository filiereRepository;
    private final MatiereRepository matiereRepository;
    private final ProfesseurMatiereRepository professeurMatiereRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthorityRepository authorityRepository,
                       FiliereRepository filiereRepository,
                       MatiereRepository matiereRepository,
                       ProfesseurMatiereRepository professeurMatiereRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authorityRepository = authorityRepository;
        this.filiereRepository = filiereRepository;
        this.matiereRepository = matiereRepository;
        this.professeurMatiereRepository = professeurMatiereRepository;
    }

    @Transactional
    public Flux<AdminUserDTO> findAllProfesseurs() {
        return userRepository
            .findAllByUserProfile(UserProfile.PROFESSEUR)
            .map(AdminUserDTO::new);
    }

    @Transactional
    public Flux<AdminUserDTO> findDirecteur() {
        return userRepository
            .findAllByUserProfile(UserProfile.DIRECTEUR)
            .map(AdminUserDTO::new);
    }

    @Transactional
    public Mono<User> activateRegistration(String key) {
        LOG.debug("Activating user for activation key {}", key);
        return userRepository
            .findOneByActivationKey(key)
            .flatMap(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                return saveUser(user);
            })
            .doOnNext(user -> LOG.debug("Activated user: {}", user));
    }

    @Transactional
    public Mono<User> completePasswordReset(String newPassword, String key) {
        LOG.debug("Reset user password for reset key {}", key);
        return userRepository
            .findOneByResetKey(key)
            .filter(user -> user.getResetDate().isAfter(Instant.now().minus(1, ChronoUnit.DAYS)))
            .publishOn(Schedulers.boundedElastic())
            .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetKey(null);
                user.setResetDate(null);
                return user;
            })
            .flatMap(this::saveUser);
    }

    @Transactional
    public Mono<User> requestPasswordReset(String mail) {
        return userRepository
            .findOneByEmailIgnoreCase(mail)
            .filter(User::isActivated)
            .publishOn(Schedulers.boundedElastic())
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.setResetDate(Instant.now());
                return user;
            })
            .flatMap(this::saveUser);
    }

@Transactional
public Mono<User> createUser(AdminUserDTO userDTO) {
    // 1. Création synchrone du User selon le profil
    User user = createUserByProfile(userDTO.getProfile());
    // 2. Démarrage de la chaîne réactive
    return Mono.just(user)
        .flatMap(u -> {

            // Champs communs User
            u.setLogin(userDTO.getLogin().toLowerCase());
            u.setFirstName(userDTO.getFirstName());
            u.setLastName(userDTO.getLastName());

            if (userDTO.getEmail() != null) {
                u.setEmail(userDTO.getEmail().toLowerCase());
            }

            u.setImageUrl(userDTO.getImageUrl());
            u.setLangKey(
                userDTO.getLangKey() != null
                    ? userDTO.getLangKey()
                    : Constants.DEFAULT_LANGUAGE
            );

            // Sécurité
            u.setPassword(
                passwordEncoder.encode(RandomUtil.generatePassword())
            );
            u.setResetKey(RandomUtil.generateResetKey());
            u.setResetDate(Instant.now());
            u.setActivated(true);

            // Champs métier spécifiques (réactif)
            return applyProfileSpecificUpdates(u, userDTO);
        })
        // Authorities
        .flatMap(u ->
            assignAuthoritiesByProfile(userDTO.getProfile(), u)
        )
        // Persist
        .flatMap(this::saveUser)
        .doOnNext(u ->
            LOG.debug(
                "Created {} user: {}",
                userDTO.getProfile(),
                u.getLogin()
            )
        );
}




    @Transactional
    public Mono<User> registerUser(AdminUserDTO dto, String password) {

        return checkUniqueness(dto)
            // 1. Créer l'utilisateur + champs User
            .then(createBaseUser(dto, password))
            // 2. Appliquer les champs spécifiques au profil
            .flatMap(user -> enrichUserByProfile(user, dto))
            // 3. Rôles / authorities
            .flatMap(user -> assignAuthoritiesByProfile(dto.getProfile(), user))
            // 4. Sauvegarde (User + sous-classe)
            .flatMap(this::saveUser)
            // 5. Relations ManyToMany après ID généré
            .flatMap(user -> linkProfileRelations(user, dto))
            .doOnSuccess(user ->
                LOG.debug("Created {} user: {}", dto.getProfile(), user.getLogin())
            );
    }

    private Mono<User> enrichUserByProfile(User user, AdminUserDTO dto) {

        if (user instanceof Etudiant etudiant) {
            etudiant.setUserProfile(UserProfile.ETUDIANT);
            etudiant.setNiveauEtude(dto.getNiveauEtude());
            etudiant.setFiliereId(dto.getFiliereId());
            return Mono.just(etudiant);
        }
        if (user instanceof Professeur professeur) {
            professeur.setUserProfile(UserProfile.PROFESSEUR);
            return Mono.just(professeur);
        }
        if (user instanceof Directeur directeur) {
            directeur.setUserProfile(UserProfile.DIRECTEUR);
            return Mono.just(directeur);
        }
        if (user instanceof Scolarite scolarite) {
            scolarite.setUserProfile(UserProfile.SCOLARITE);
            return Mono.just(scolarite);
        }
        if (user instanceof Admin admin) {
            admin.setUserProfile(UserProfile.ADMIN);
            return Mono.just(admin);
        }
        return Mono.just(user);
    }


    private Mono<Void> checkUniqueness(AdminUserDTO dto) {
        return userRepository.findOneByLogin(dto.getLogin().toLowerCase())
            .flatMap(u -> Mono.error(new UsernameAlreadyUsedException()))
            .switchIfEmpty(
                userRepository.findOneByEmailIgnoreCase(dto.getEmail())
                    .flatMap(u -> Mono.error(new EmailAlreadyUsedException()))
            )
            .then();
    }

    private Mono<User> createBaseUser(AdminUserDTO dto, String password) {
        User user = createUserByProfile(dto.getProfile());

        applyCommonFields(
            user,
            dto,
            passwordEncoder.encode(password)
        );

        return Mono.just(user);
    }

    private User createUserByProfile(UserProfile profile) {
        return switch (profile) {
            case ETUDIANT -> new Etudiant();
            case PROFESSEUR -> new Professeur();
            case SCOLARITE -> new Scolarite();
            case DIRECTEUR -> new Directeur();
            case ADMIN -> new Admin();
        };
    }

    private Mono<User> linkProfileRelations(User user, AdminUserDTO dto) {

        if (user instanceof Professeur professeur) {
            return linkMatieres(professeur.getId(), dto.getMatiereIds())
                .thenReturn(user);
        }

        return Mono.just(user);
    }


    private Mono<Void> linkMatieres(Long professeurId, Set<Long> matiereIds) {
        // Supprimer les anciennes relations
        return professeurMatiereRepository.deleteByProfesseurId(professeurId)
            .then(
                // Vérifier si la liste de matières est vide
                (matiereIds == null || matiereIds.isEmpty())
                    ? Mono.empty()
                    : Flux.fromIterable(matiereIds)
                    .map(id -> new ProfesseurMatiere(professeurId, id))
                    .flatMap(professeurMatiereRepository::save)
                    .then()
            );
    }

    private void applyCommonFields(User user, AdminUserDTO dto, String encryptedPassword) {
//        user.setLogin(dto.getLogin().toLowerCase());
        user.setLogin(dto.getLogin().trim().toLowerCase());
        user.setPassword(encryptedPassword);
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail().toLowerCase());
        user.setLangKey(dto.getLangKey());
        user.setActivated(true);
        user.setActivationKey(RandomUtil.generateActivationKey());
    }


    /**
     * Update all information for a specific user, and return the modified user.
     *
     * @param userDTO user to update.
     * @return updated user.
     */
    @Transactional
    public Mono<AdminUserDTO> updateUser(AdminUserDTO userDTO) {
        return userRepository.findById(userDTO.getId())
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Utilisateur introuvable")))
            .flatMap(user -> {

                // 1. Vérification stricte du profil
                assertProfileConsistency(user, userDTO.getProfile());

                // 2. Mise à jour des champs communs
                user.setLogin(userDTO.getLogin() != null ? userDTO.getLogin().toLowerCase() : null);
                user.setFirstName(userDTO.getFirstName());
                user.setLastName(userDTO.getLastName());
                user.setEmail(userDTO.getEmail() != null ? userDTO.getEmail().toLowerCase() : null);
                user.setImageUrl(userDTO.getImageUrl());
                user.setActivated(userDTO.isActivated());
                user.setLangKey(userDTO.getLangKey());

                return Mono.just(user);
            })
            // 3. Champs spécifiques au profil
            .flatMap(user -> applyProfileSpecificUpdates(user, userDTO))
            // 4. Assigner les rôles selon le profil
            .flatMap(user -> assignAuthoritiesByProfile(userDTO.getProfile(),user))
            // 5. Sauvegarde
            .flatMap(this::saveUser)
            // 6. Relations ManyToMany (optionnel)
            .flatMap(user -> linkProfileRelations(user, userDTO))
            // 7. Log et retour DTO
            .doOnNext(user -> LOG.debug("Updated user: {}", user))
            .map(AdminUserDTO::new);
    }



    private Mono<User> applyProfileSpecificUpdates(User user, AdminUserDTO dto) {

        if (user instanceof Etudiant etudiant) {
            etudiant.setNiveauEtude(dto.getNiveauEtude());
            etudiant.setFiliereId(dto.getFiliereId());
            return Mono.just(etudiant);
        }

        if (user instanceof Professeur professeur) {
            // Relations traitées après save
            return Mono.just(professeur);
        }

        return Mono.just(user);
    }



    @Transactional
    public Mono<Void> deleteUser(String login) {
        return userRepository
            .findOneByLogin(login)
            .flatMap(user -> userRepository.delete(user).thenReturn(user))
            .doOnNext(user -> LOG.debug("Deleted User: {}", user))
            .then();
    }

    /**
     * Update basic information (first name, last name, email, language) for the current user.
     *
     * @param firstName first name of user.
     * @param lastName  last name of user.
     * @param email     email id of user.
     * @param langKey   language key.
     * @param imageUrl  image URL of user.
     * @return a completed {@link Mono}.
     */
    @Transactional
    public Mono<Void> updateUser(
        String firstName,
        String lastName,
        String email,
        String langKey,
        String imageUrl
    ) {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .switchIfEmpty(Mono.error(new IllegalStateException("Utilisateur non authentifié")))
            .flatMap(user -> {

                user.setFirstName(firstName);
                user.setLastName(lastName);

                if (email != null) {
                    user.setEmail(email.toLowerCase());
                }

                user.setLangKey(langKey);
                user.setImageUrl(imageUrl);

                // AUCUNE logique métier ici (profil verrouillé)
                return saveUser(user);
            })
            .doOnNext(user -> LOG.debug("Changed Information for User: {}", user))
            .then();
    }


    @Transactional
    public Mono<User> saveUser(User user) {
        return SecurityUtils.getCurrentUserLogin()
            .switchIfEmpty(Mono.just(Constants.SYSTEM))
            .flatMap(login -> {
                if (user.getCreatedBy() == null) {
                    user.setCreatedBy(login);
                }
                user.setLastModifiedBy(login);
                // Saving the relationship can be done in an entity callback
                // once https://github.com/spring-projects/spring-data-r2dbc/issues/215 is done
                return userRepository
                    .save(user)
                    .flatMap(savedUser ->
                        Flux.fromIterable(user.getAuthorities())
                            .flatMap(authority -> userRepository.saveUserAuthority(savedUser.getId(), authority.getName()))
                            .then(Mono.just(savedUser))
                    );
            });
    }

    @Transactional
    public Mono<Void> changePassword(String currentClearTextPassword, String newPassword) {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .publishOn(Schedulers.boundedElastic())
            .map(user -> {
                String currentEncryptedPassword = user.getPassword();
                if (!passwordEncoder.matches(currentClearTextPassword, currentEncryptedPassword)) {
                    throw new InvalidPasswordException();
                }
                String encryptedPassword = passwordEncoder.encode(newPassword);
                user.setPassword(encryptedPassword);
                return user;
            })
            .flatMap(this::saveUser)
            .doOnNext(user -> LOG.debug("Changed password for User: {}", user))
            .then();
    }

    @Transactional(readOnly = true)
    public Flux<AdminUserDTO> getAllManagedUsers(Pageable pageable) {
        return userRepository.findAllWithAuthorities(pageable).map(AdminUserDTO::new);
    }

    @Transactional(readOnly = true)
    public Flux<UserDTO> getAllPublicUsers(Pageable pageable) {
        return userRepository.findAllByIdNotNullAndActivatedIsTrue(pageable).map(UserDTO::new);
    }

    @Transactional(readOnly = true)
    public Mono<Long> countManagedUsers() {
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public Mono<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneWithAuthoritiesByLogin(login);
    }

    @Transactional(readOnly = true)
    public Mono<User> getUserWithAuthorities() {
        return SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin);
    }

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired every day, at 01:00 (am).
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        removeNotActivatedUsersReactively().blockLast();
    }

    @Transactional
    public Flux<User> removeNotActivatedUsersReactively() {
        return userRepository
            .findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(
                LocalDateTime.ofInstant(Instant.now().minus(3, ChronoUnit.DAYS), ZoneOffset.UTC)
            )
            .flatMap(user -> userRepository.delete(user).thenReturn(user))
            .doOnNext(user -> LOG.debug("Deleted User: {}", user));
    }

    /**
     * Gets a list of all the authorities.
     * @return a list of all the authorities.
     */
    @Transactional(readOnly = true)
    public Flux<String> getAuthorities() {
        return authorityRepository.findAll().map(Authority::getName);
    }

    private Mono<User> assignAuthoritiesByProfile(UserProfile profile, User user) {

        // Définir les rôles par profil
        Set<String> roles = switch (profile) {
            case ETUDIANT -> Set.of(AuthoritiesConstants.ETUDIANT);
            case PROFESSEUR -> Set.of(AuthoritiesConstants.PROFESSEUR);
            case SCOLARITE -> Set.of(AuthoritiesConstants.SCOLARITE);
            case DIRECTEUR -> Set.of(AuthoritiesConstants.DIRECTEUR);
            case ADMIN -> Set.of(AuthoritiesConstants.ADMIN);
        };

        // Supprimer les autorités existantes en base avant d'ajouter
        return userRepository.deleteUserAuthorities(user.getId())
            .thenMany(Flux.fromIterable(roles))
            .flatMap(authorityRepository::findById)
            .doOnNext(user.getAuthorities()::add)
            .then(Mono.just(user));
    }


    private void assertProfileConsistency(User userDB, UserProfile profile) {
        User user = null;
        switch (profile) {
            case ETUDIANT -> {
                    user = new Etudiant();
                BeanUtils.copyProperties(userDB, user);
            }
            case PROFESSEUR -> {
                    user = new Professeur();
                BeanUtils.copyProperties(userDB, user);
            }
            case SCOLARITE -> {
                    user = new Scolarite();
                BeanUtils.copyProperties(userDB, user);
            }
            case DIRECTEUR -> {
                    user = new Directeur();
                BeanUtils.copyProperties(userDB, user);
            }
            case ADMIN -> {
                    user = new Admin();
                BeanUtils.copyProperties(userDB, user);
            }
        };

        if (!resolveClassFromProfile(profile).isAssignableFrom(user.getClass())) {
            throw new IllegalStateException("Incohérence profil / type utilisateur");
        }
    }

    private Class<? extends User> resolveClassFromProfile(UserProfile profile) {
        return switch (profile) {
            case ETUDIANT -> Etudiant.class;
            case PROFESSEUR -> Professeur.class;
            case SCOLARITE -> Scolarite.class;
            case DIRECTEUR -> Directeur.class;
            case ADMIN -> Admin.class;
        };
    }

//    private Mono<User> applyProfileSpecificUpdates(User user, AdminUserDTO dto) {
//
//        if (user instanceof Etudiant e) {
//            return filiereRepository.findById(dto.getFiliereId())
//                .switchIfEmpty(Mono.error(new RuntimeException("Filiere not found!")))
//                .map(filiere -> {
//                    e.setFiliere(filiere);
//                    return (User) e;
//                });
//        }
//
//        if (user instanceof Professeur p) {
//            if (dto.getMatiereIds() == null || dto.getMatiereIds().isEmpty()) {
//                return Mono.just(p);
//            }
//
//            return Flux.fromIterable(dto.getMatiereIds())
//                .flatMap(matiereRepository::findById)
//                .collect(Collectors.toSet())
//                .map(matieres -> {
//                    p.setMatieres(matieres);
//                    return (User) p;
//                });
//        }
//
//        // Pour les autres types d'utilisateur (Scolarite, Directeur)
//        return Mono.just(user);
//    }


}
