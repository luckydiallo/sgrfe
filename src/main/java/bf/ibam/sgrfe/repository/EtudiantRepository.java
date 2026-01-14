package bf.ibam.sgrfe.repository;

import bf.ibam.sgrfe.domain.Etudiant;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface EtudiantRepository extends R2dbcRepository<Etudiant, Long> {
    Mono<Etudiant> findById(Long id);
}

