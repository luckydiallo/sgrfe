package bf.ibam.sgrfe.domain;

import bf.ibam.sgrfe.domain.User;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import java.io.Serializable;

public class Etudiant extends User implements Serializable {

    private String niveauEtude;

    @Column("filiere_id")
    private Long filiereId;

    // getters & setters

    public String getNiveauEtude() {
        return niveauEtude;
    }

    public void setNiveauEtude(String niveauEtude) {
        this.niveauEtude = niveauEtude;
    }

    public Long getFiliereId() {
        return filiereId;
    }

    public void setFiliereId(Long filiereId) {
        this.filiereId = filiereId;
    }
}
