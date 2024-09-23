import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IBudget {
  title: string;
  value: number;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {

  budgetData: IBudget[] = [];

  constructor(private http: HttpClient) {}

  getData(): Observable<IBudget[]> {
    return this.http.get<IBudget[]>('http://localhost:3000/budget');
  }
}
