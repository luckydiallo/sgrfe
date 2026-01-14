import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IFiliere } from '../filiere.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../filiere.test-samples';

import { FiliereService } from './filiere.service';

const requireRestSample: IFiliere = {
  ...sampleWithRequiredData,
};

describe('Filiere Service', () => {
  let service: FiliereService;
  let httpMock: HttpTestingController;
  let expectedResult: IFiliere | IFiliere[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(FiliereService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Filiere', () => {
      const filiere = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(filiere).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Filiere', () => {
      const filiere = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(filiere).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Filiere', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Filiere', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Filiere', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addFiliereToCollectionIfMissing', () => {
      it('should add a Filiere to an empty array', () => {
        const filiere: IFiliere = sampleWithRequiredData;
        expectedResult = service.addFiliereToCollectionIfMissing([], filiere);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(filiere);
      });

      it('should not add a Filiere to an array that contains it', () => {
        const filiere: IFiliere = sampleWithRequiredData;
        const filiereCollection: IFiliere[] = [
          {
            ...filiere,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFiliereToCollectionIfMissing(filiereCollection, filiere);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Filiere to an array that doesn't contain it", () => {
        const filiere: IFiliere = sampleWithRequiredData;
        const filiereCollection: IFiliere[] = [sampleWithPartialData];
        expectedResult = service.addFiliereToCollectionIfMissing(filiereCollection, filiere);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(filiere);
      });

      it('should add only unique Filiere to an array', () => {
        const filiereArray: IFiliere[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const filiereCollection: IFiliere[] = [sampleWithRequiredData];
        expectedResult = service.addFiliereToCollectionIfMissing(filiereCollection, ...filiereArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const filiere: IFiliere = sampleWithRequiredData;
        const filiere2: IFiliere = sampleWithPartialData;
        expectedResult = service.addFiliereToCollectionIfMissing([], filiere, filiere2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(filiere);
        expect(expectedResult).toContain(filiere2);
      });

      it('should accept null and undefined values', () => {
        const filiere: IFiliere = sampleWithRequiredData;
        expectedResult = service.addFiliereToCollectionIfMissing([], null, filiere, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(filiere);
      });

      it('should return initial array if no Filiere is added', () => {
        const filiereCollection: IFiliere[] = [sampleWithRequiredData];
        expectedResult = service.addFiliereToCollectionIfMissing(filiereCollection, undefined, null);
        expect(expectedResult).toEqual(filiereCollection);
      });
    });

    describe('compareFiliere', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFiliere(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 26666 };
        const entity2 = null;

        const compareResult1 = service.compareFiliere(entity1, entity2);
        const compareResult2 = service.compareFiliere(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 26666 };
        const entity2 = { id: 32672 };

        const compareResult1 = service.compareFiliere(entity1, entity2);
        const compareResult2 = service.compareFiliere(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 26666 };
        const entity2 = { id: 26666 };

        const compareResult1 = service.compareFiliere(entity1, entity2);
        const compareResult2 = service.compareFiliere(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
