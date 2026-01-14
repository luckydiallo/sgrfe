package bf.ibam.sgrfe.repository;

import bf.ibam.sgrfe.domain.ProfesseurMatiere;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ProfesseurMatiereRepository
    extends R2dbcRepository<ProfesseurMatiere, Void> {

    Flux<ProfesseurMatiere> findByProfesseurId(Long professeurId);

    Mono<Void> deleteByProfesseurId(Long professeurId);
}

