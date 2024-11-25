import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AirportService } from '../services/airport.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule, provideHttpClientTesting } from '@angular/common/http/testing';
import { of, Subject, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ItemListComponent } from '../item-list/item-list.component';
import { BrowserAnimationsModule, provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Airport } from '../model/airport';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let airportServiceSpy: jasmine.SpyObj<AirportService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let dynamicDialogRefSpy: jasmine.SpyObj<DynamicDialogRef>;

  const mockAirports: Airport[] = [
    { id: 1, name: 'John F. Kennedy International Airport', country: 'USA' },
    { id: 2, name: 'Los Angeles International Airport', country: 'USA' },
    { id: 3, name: 'Heathrow Airport', country: 'UK' },
  ];
  beforeEach(async () => {
    const airportSpy = jasmine.createSpyObj('AirportService', ['getAirports']);
    const dialogSpy = jasmine.createSpyObj('DialogService', ['open']);
    const dialogRefSpy = jasmine.createSpyObj('DynamicDialogRef', ['close'], {
      onClose: new Subject<boolean>(),
    });
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HomeComponent, ItemListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: AirportService, useValue: airportSpy },
        { provide: DialogService, useValue: dialogSpy },
        { provide: DynamicDialogRef, useValue: dialogRefSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    airportServiceSpy = TestBed.inject(AirportService) as jasmine.SpyObj<AirportService>;
    dialogServiceSpy = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
    dynamicDialogRefSpy = TestBed.inject(DynamicDialogRef) as jasmine.SpyObj<DynamicDialogRef>;

    airportServiceSpy.getAirports.and.returnValue(of(mockAirports));
    component['airportList$'] = of(mockAirports);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should create the form', () => {
    const form = component.baggageLossForm;
    expect(form).toBeDefined();
    expect(form.value).toEqual({
      date: '',
      origin: '',
      destination: '',
      baggageLossCount: '',
      items: [],
    });
  });

  it('should add items to the form array', () => {
    component.addItems();
    expect(component.items.length).toBe(1);
  });

  it('should remove items from the form array', () => {
    component.addItems();
    expect(component.items.length).toBe(1);
    component.removeItem(0);
    expect(component.items.length).toBe(0);
  });

  it('should validate  origin and destination not equal', () => {
    component.baggageLossForm.patchValue({
      origin: 'Airport A',
      destination: 'Airport A',
    });

    expect(component.baggageLossForm.hasError('sameValue')).toBeTrue();
  });

  it('should calculate grand total', fakeAsync(() => {
    component.addItems();
    component.items.at(0).patchValue({ price: 50, quantity: 2 });
    tick(300);
    expect(component.grandTotal).toBe(100);
  }));

  it('should unsubscribe on component destroy', () => {
    spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subscription.unsubscribe).toHaveBeenCalled();
  });

  it('should update suggestions for origin ', fakeAsync(() => {
    const query = 'air';
    component.searchOrgin({ query } as AutoCompleteCompleteEvent);
    tick(300);
    component.originSuggestionList$.subscribe((list) => {
      expect(list.length).toBeGreaterThan(0);
    });
  }));

  it('should update suggestions for Destination', fakeAsync(() => {
    const query = 'air';
    component.searchDestination({ query } as AutoCompleteCompleteEvent);
    tick(300);
    component.destinationSuggestionList$.subscribe((list) => {
      expect(list.length).toBeGreaterThan(0);
    });
  }));

  it('should dynamically add items', () => {
    component.onCountChange({ value: 2 } as any);
    expect(component.items.length).toBe(2);
  });

  it('should dynamically remove items', () => {
    component.onCountChange({ value: 2 } as any);
    component.onCountChange({ value: 1 } as any);
    expect(component.items.length).toBe(1);
  });

});
