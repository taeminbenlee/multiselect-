import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DialogService } from 'src/app/service/dialog.service';


interface ItemData {
  CodeValue: string;
  Code: string;
  selected: boolean;
}

@Component({
  selector: 'app-multiselect-autocomplete',
  templateUrl: './multiselect-autocomplete.component.html',
  styleUrls: ['./multiselect-autocomplete.component.scss']
})
export class MultiselectAutocompleteComponent implements OnInit, OnChanges {
  @Output() result = new EventEmitter<{ key: string, data: Array<string> }>();

  @Input() placeholder: string = '검색';
  @Input() data: Array<any> = [];
  @Input() key: string = '';


  selectControl = new FormControl();

  rawData: Array<ItemData> = [];
  selectData: Array<ItemData> = [];

  filteredData: Observable<Array<ItemData>>;
  filterString: string = '';

  constructor(
    public dialog: DialogService
  ) {
    this.filteredData = this.selectControl.valueChanges.pipe(
      startWith<string>(''),
      map(value => typeof value === 'string' ? value : this.filterString),
      map(filter => this.filter(filter))
    );
  }

  ngOnInit(): void {
    /* this.data.forEach((item: string) => {
      this.rawData.push({ item, selected: false });
    }); */
    this.rawData = this.data;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.rawData = this.data;
  }

  filter = (filter: string): Array<ItemData> => {
    this.filterString = filter;
    if (filter.length > 0) {
      return this.rawData.filter(option => {
        return option.CodeValue.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      });
    } else {
      return this.rawData.slice();
    }
  };

  displayFn = (): string => '';

  optionClicked = (event: Event, data: ItemData): void => {
    event.stopPropagation();
    this.toggleSelection(data);
  };

  toggleSelection = (data: ItemData): void => {
    data.selected = !data.selected;
  ​
    if (data.selected === true) {
      this.selectData.push(data);
    } else {
      const i = this.selectData.findIndex(value => value.CodeValue === data.CodeValue);
      this.selectData.splice(i, 1);
    }
  ​
    this.selectControl.setValue(this.selectData);
    this.emitAdjustedData();
  };

  emitAdjustedData = (): void => {
    const results: Array<string> = []
    this.selectData.forEach((data: ItemData) => {
      results.push(data.Code);
    });
    this.result.emit({ key: this.key, data: results });
  };

  removeChip = (data: ItemData): void => {
    this.toggleSelection(data);
  };

  removeSelection = (): void => {
    this.selectData = [];
    this.data = this.data.map(function (item) {
      item.selected = false;
      return item;
    })

  }

}
