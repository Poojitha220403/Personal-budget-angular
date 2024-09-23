import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

// Define the IBudget interface
export interface IBudget {
  title: string;
  budget: string; // Adjust this to number if you want to handle it as a number
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private budgetData: IBudget[] = []; // Variable to store budget data

  constructor(private http: HttpClient) {}

  // Fetch budget data and return the myBudget array
  getData(): Observable<IBudget[]> {
    if (this.budgetData.length > 0) {
      // If budgetData is already populated, return it as an observable
      return of(this.budgetData);
    } else {
      // Make the HTTP call to fetch data
      return this.http.get<{ myBudget: IBudget[] }>('http://localhost:3000/budget').pipe(
        map(response => {
          this.budgetData = response.myBudget; // Store the fetched data
          return this.budgetData; // Return the data
        })
      );
    }
  }
}
