import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Airport } from '../model/airport';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AirportService {

  constructor(private http: HttpClient){

  }

  getAirports():Observable<Airport[]>{
    return this.http.get<Airport[]>('assets/airports.json').pipe(shareReplay())
  }
  
}
