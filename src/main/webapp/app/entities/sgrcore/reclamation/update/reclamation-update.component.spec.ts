import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IFiliere } from 'app/entities/sgrcore/filiere/filiere.model';
import { FiliereService } from 'app/entities/sgrcore/filiere/service/filiere.service';
import { IMatiere } from 'app/entities/sgrcore/matiere/matiere.model';
import { MatiereService } from 'app/entities/sgrcore/matiere/service/matiere.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { IReclamation } from '../reclamation.model';
import { ReclamationService } from '../service/reclamation.service';
import { ReclamationFormService } from './reclamation-form.service';

import { ReclamationUpdateComponent } from './reclamation-update.component';

describe('Reclamation Management Update Component', () => {
  let comp: ReclamationUpdateComponent;
  let fixture: ComponentFixture<ReclamationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let reclamationFormService: ReclamationFormService;
  let reclamationService: ReclamationService;
  let filiereService: FiliereService;
  let matiereService: MatiereService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReclamationUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(ReclamationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ReclamationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    reclamationFormService = TestBed.inject(ReclamationFormService);
    reclamationService = TestBed.inject(ReclamationService);
    filiereService = TestBed.inject(FiliereService);
    matiereService = TestBed.inject(MatiereService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Filiere query and add missing value', () => {
      const reclamation: IReclamation = { id: 9368 };
      const filiere: IFiliere = { id: 26666 };
      reclamation.filiere = filiere;

      const filiereCollection: IFiliere[] = [{ id: 26666 }];
      jest.spyOn(filiereService, 'query').mockReturnValue(of(new HttpResponse({ body: filiereCollection })));
      const additionalFilieres = [filiere];
      const expectedCollection: IFiliere[] = [...additionalFilieres, ...filiereCollection];
      jest.spyOn(filiereService, 'addFiliereToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ reclamation });
      comp.ngOnInit();

      expect(filiereService.query).toHaveBeenCalled();
      expect(filiereService.addFiliereToCollectionIfMissing).toHaveBeenCalledWith(
        filiereCollection,
        ...additionalFilieres.map(expect.objectContaining),
      );
      expect(comp.filieresSharedCollection).toEqual(expectedCollection);
    });

    it('should call Matiere query and add missing value', () => {
      const reclamation: IReclamation = { id: 9368 };
      const matiere: IMatiere = { id: 30656 };
      reclamation.matiere = matiere;

      const matiereCollection: IMatiere[] = [{ id: 30656 }];
      jest.spyOn(matiereService, 'query').mockReturnValue(of(new HttpResponse({ body: matiereCollection })));
      const additionalMatieres = [matiere];
      const expectedCollection: IMatiere[] = [...additionalMatieres, ...matiereCollection];
      jest.spyOn(matiereService, 'addMatiereToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ reclamation });
      comp.ngOnInit();

      expect(matiereService.query).toHaveBeenCalled();
      expect(matiereService.addMatiereToCollectionIfMissing).toHaveBeenCalledWith(
        matiereCollection,
        ...additionalMatieres.map(expect.objectContaining),
      );
      expect(comp.matieresSharedCollection).toEqual(expectedCollection);
    });

    it('should call User query and add missing value', () => {
      const reclamation: IReclamation = { id: 9368 };
      const user: IUser = { id: 3944 };
      reclamation.user = user;

      const userCollection: IUser[] = [{ id: 3944 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ reclamation });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining),
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const reclamation: IReclamation = { id: 9368 };
      const filiere: IFiliere = { id: 26666 };
      reclamation.filiere = filiere;
      const matiere: IMatiere = { id: 30656 };
      reclamation.matiere = matiere;
      const user: IUser = { id: 3944 };
      reclamation.user = user;

      activatedRoute.data = of({ reclamation });
      comp.ngOnInit();

      expect(comp.filieresSharedCollection).toContainEqual(filiere);
      expect(comp.matieresSharedCollection).toContainEqual(matiere);
      expect(comp.usersSharedCollection).toContainEqual(user);
      expect(comp.reclamation).toEqual(reclamation);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IReclamation>>();
      const reclamation = { id: 14154 };
      jest.spyOn(reclamationFormService, 'getReclamation').mockReturnValue(reclamation);
      jest.spyOn(reclamationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ reclamation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: reclamation }));
      saveSubject.complete();

      // THEN
      expect(reclamationFormService.getReclamation).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(reclamationService.update).toHaveBeenCalledWith(expect.objectContaining(reclamation));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IReclamation>>();
      const reclamation = { id: 14154 };
      jest.spyOn(reclamationFormService, 'getReclamation').mockReturnValue({ id: null });
      jest.spyOn(reclamationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ reclamation: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: reclamation }));
      saveSubject.complete();

      // THEN
      expect(reclamationFormService.getReclamation).toHaveBeenCalled();
      expect(reclamationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IReclamation>>();
      const reclamation = { id: 14154 };
      jest.spyOn(reclamationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ reclamation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(reclamationService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareFiliere', () => {
      it('should forward to filiereService', () => {
        const entity = { id: 26666 };
        const entity2 = { id: 32672 };
        jest.spyOn(filiereService, 'compareFiliere');
        comp.compareFiliere(entity, entity2);
        expect(filiereService.compareFiliere).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareMatiere', () => {
      it('should forward to matiereService', () => {
        const entity = { id: 30656 };
        const entity2 = { id: 4963 };
        jest.spyOn(matiereService, 'compareMatiere');
        comp.compareMatiere(entity, entity2);
        expect(matiereService.compareMatiere).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareUser', () => {
      it('should forward to userService', () => {
        const entity = { id: 3944 };
        const entity2 = { id: 6275 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
