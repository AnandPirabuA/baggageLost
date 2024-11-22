import { Component, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { AirportService } from '../services/airport.service';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, pipe, Subject, Subscription, switchMap } from 'rxjs';
import { Airport } from '../model/airport';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ItemListComponent } from '../item-list/item-list.component';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { differentOriginDestinationValidator } from '../validators/different-origin-destination.validator';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CalendarModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    DropdownModule,
    NgIf,
    AsyncPipe,
    NgFor,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule,
    InputTextModule,
    CardModule,
    DynamicDialogModule,
    ItemListComponent,
    MessagesModule
  ],
  providers: [DialogService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnDestroy {

  maxDate: Date;
  originSuggestionList$: Observable<Airport[]>;
  destinationSuggestionList$: Observable<Airport[]>;
  private airportList$: Observable<Airport[]>;
  baggageLossForm: FormGroup;
  itemCounts: number[];
  private orginSearchQuery$ = new Subject<string>();
  private destinationSearchQuery$ = new Subject<string>();
  grandTotal: number = 0;
  subscription: Subscription;
  ref: DynamicDialogRef | undefined;
  messages: Message[] | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private airportService: AirportService,
    public dialogService: DialogService
  ) {
    this.baggageLossForm = this.formBuilder.group({
      date: ['', Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      baggageLossCount: ['', Validators.required],
      items: this.formBuilder.array([])
    }, { validators: differentOriginDestinationValidator() });
    this.maxDate = new Date();
    this.airportList$ = this.airportService.getAirports();
    this.originSuggestionList$ = this.orginSearchQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) =>
        this.airportList$.pipe(
          map((airports: Airport[]) =>
            airports.filter(
              (airport: Airport) =>
                airport.name.toLowerCase().startsWith(query) ||
                airport.country.toLowerCase().startsWith(query)
            )
          ),
          catchError((err) => {
            return [];
          })
        )
      )
    );
    this.destinationSuggestionList$ = this.destinationSearchQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) =>
        this.airportList$.pipe(
          map((airports: Airport[]) =>
            airports.filter(
              (airport: Airport) =>
                airport.name.toLowerCase().startsWith(query) ||
                airport.country.toLowerCase().startsWith(query)
            )
          ),
          catchError((err) => {
            return [];
          })
        )
      )
    );
    this.itemCounts = Array.from({ length: 20 }, (_, index) => index + 1);
    this.subscription = this.items.valueChanges
      .pipe(debounceTime(300))
      .subscribe((values) => {
        this.grandTotal = 0;
        values.forEach((item: any, index: number) => {
          const total = item.price * item.quantity;
          this.grandTotal += total;
          this.items.at(index).get('total')?.setValue(total, { emitEvent: false });
        });
      });
  }

  get items(): FormArray {
    return this.baggageLossForm.get("items") as FormArray
  }

  newItem(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0)]],
      price: ['', [Validators.required, Validators.min(0)]],
      total: ['']
    })
  }

  addItems() {
    this.items.push(this.newItem());
  }

  removeItem(i: number) {
    this.items.removeAt(i);
  }

  searchOrgin(event: AutoCompleteCompleteEvent) {
    this.orginSearchQuery$.next(event.query.toLowerCase());
  }

  searchDestination(event: AutoCompleteCompleteEvent) {
    this.destinationSearchQuery$.next(event.query.toLowerCase());
  }

  onCountChange(event: DropdownChangeEvent) {
    if (event.value > this.items.length) {
      const diff = event.value - this.items.length
      for (let i = 1; i <= diff; i++) {
        this.addItems();
      }
    } else {
      const diff = this.items.length - event.value;
      for (let i = 1; i <= diff; i++) {
        this.removeItem(this.items.length - 1);
      }
    }
  }

  save() {
    this.messages = [];
    this.ref = this.dialogService.open(ItemListComponent, {
      header: 'Please verify item details',
      data: this.baggageLossForm.value?.items,
      width: '70%',
      contentStyle: { "overflow": "auto" },
      baseZIndex: 10000,
      maximizable: true
    });

    this.ref.onClose.subscribe((result) => {
      if(result){
        this.baggageLossForm.reset();
        this.items.clear();
        this.messages = [
          { severity: 'success', detail: 'Your baggage lost information saved successfully' }
        ];
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.ref) {
      this.ref.close();
    }
  }

}
