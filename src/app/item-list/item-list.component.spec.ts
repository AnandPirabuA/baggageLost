import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemListComponent } from './item-list.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;
  let dialogRefSpy: jasmine.SpyObj<DynamicDialogRef>;
  let dialogConfigMock: Partial<DynamicDialogConfig>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('DynamicDialogRef', ['close']);
    dialogConfigMock = {
      data: [
        { name: 'Item 1', price: 100, quantity: 2, total: 200 },
        { name: 'Item 2', price: 150, quantity: 1, total: 150 },
      ],
    };

    await TestBed.configureTestingModule({
      imports: [TableModule, ButtonModule, ItemListComponent],
      providers: [  
        provideNoopAnimations(),
        { provide: DynamicDialogRef, useValue: dialogRefSpy },
        { provide: DynamicDialogConfig, useValue: dialogConfigMock },
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignore template-specific errors
    }).compileComponents();

    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial lifecycle events
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize `items` with data from `DynamicDialogConfig`', () => {
    expect(component.items).toEqual(dialogConfigMock.data);
  });

  it('should render the table with provided data', () => {
    const tableRows = fixture.nativeElement.querySelectorAll('p-table tr');
    expect(tableRows.length).toBe(3); // 1 header row + 2 data rows

    const firstRowCells = tableRows[1].querySelectorAll('td');
    expect(firstRowCells[0].textContent).toContain('Item 1');
    expect(firstRowCells[1].textContent).toContain('100');
    expect(firstRowCells[2].textContent).toContain('2');
    expect(firstRowCells[3].textContent).toContain('200');
  });

});
