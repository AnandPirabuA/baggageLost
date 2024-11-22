import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [TableModule,ButtonModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss'
})
export class ItemListComponent implements OnInit {
  items: any;

  constructor(
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig ){
  }

  ngOnInit(): void {
    this.items = this.config.data;
  }

  close() {
    this.ref.close(false);
  }

  submit() {
    this.ref.close(true);
  }
}
