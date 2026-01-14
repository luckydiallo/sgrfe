package bf.ibam.sgrfe.domain;


import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

@Table("professeur_matiere")
public class ProfesseurMatiere {

    @Column("professeur_id")
    private Long professeurId;

    @Column("matiere_id")
    private Long matiereId;

    public ProfesseurMatiere(Long professeurId, Long matiereId) {
        this.professeurId = professeurId;
        this.matiereId = matiereId;
    }

    public Long getProfesseurId() {
        return professeurId;
    }

    public void setProfesseurId(Long professeurId) {
        this.professeurId = professeurId;
    }

    public Long getMatiereId() {
        return matiereId;
    }

    public void setMatiereId(Long matiereId) {
        this.matiereId = matiereId;
    }
}

