package bf.ibam.sgrfe.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("DIRECTEUR")
@Data
public class Directeur extends User {
}
