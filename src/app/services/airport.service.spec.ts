import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AirportService } from './airport.service';
import { Airport } from '../model/airport';
import { provideHttpClient } from '@angular/common/http';

describe('AirportService', () => {
  let service: AirportService;
  let httpTestingController: HttpTestingController;

  const mockAirports: Airport[] = [
    { id: 1, name: 'John F. Kennedy International Airport', country: 'USA' },
    { id: 2, name: 'Heathrow Airport', country: 'UK' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [AirportService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AirportService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch the list of airports', () => {
    service.getAirports().subscribe((airports) => {
      expect(airports).toEqual(mockAirports);
      expect(airports.length).toBe(2);
    });

    const req = httpTestingController.expectOne('assets/airports.json');
    expect(req.request.method).toBe('GET');

    // Respond with mock data
    req.flush(mockAirports);
  });

  it('should handle an error response', () => {
    service.getAirports().subscribe({
      next: () => fail('Expected an error, but got a response'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpTestingController.expectOne('assets/airports.json');
    expect(req.request.method).toBe('GET');

    // Respond with an error
    req.flush('Error fetching airports', { status: 500, statusText: 'Internal Server Error' });
  });
});
