import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Map, Control, DomUtil, ControlPosition, LatLng} from 'leaflet';

class LocData{
  name: string;
  detail?: object;
  latlng?: LatLng;

  constructor(response?: object, location?: LatLng) {
    if (response) {
      this.name = response['name'];
      this.detail = response;
    } else {
      this.name = '-';
    }
    if (location) {
      this.latlng = location;
    }
  }
}

@Component({
  selector: 'app-custom-control',
  templateUrl: './custom-control.component.html',
  styleUrls: ['./custom-control.component.css']
})
export class CustomControlComponent implements OnInit, OnDestroy {
  private _map: Map;
  public custom: Control;
  public currentLocation: LocData;
  @Input() position: ControlPosition ;

  constructor(private http: HttpClient, private changeDetector: ChangeDetectorRef) { 
  }

  ngOnInit() {
    this.currentLocation = new LocData();
  }

  ngOnDestroy() {
    this._map.removeControl(this.custom);
    this._map.off('click', this.onClick);
  }

  @Input() set map(map: Map){
    if (map){
      this._map = map;
      let Custom = Control.extend({
        onAdd(map: Map) {
          return DomUtil.get('custom');
        },
        onRemove(map: Map) {}
      });
      this.custom=new Custom({
          position: this.position
        }).addTo(map);
      map.on('click', this.onClick, this);
    }
  }
  get map(): Map {
    return this._map
  }

  private onClick(e): void {
    let location = e.latlng;
    this.getNominatim(location).subscribe(response => {
      this.currentLocation = new LocData(response, location);
      this.changeDetector.detectChanges();
    })
  }
  
  private getNominatim(location: LatLng): Observable<object> {
    return this.http.get(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=12&addressdetails=1&lat=${location.lat}&lon=${location.lng}`,
      {
        responseType: 'json'
      });
    }
}