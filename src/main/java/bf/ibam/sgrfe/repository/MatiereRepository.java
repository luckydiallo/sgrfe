package bf.ibam.sgrfe.repository;

import bf.ibam.sgrfe.domain.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatiereRepository extends R2dbcRepository<Matiere, Long> {
}
