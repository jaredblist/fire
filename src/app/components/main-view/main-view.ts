import { CurrencyPipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { DataCard } from "../data-card/data-card";
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-main-view',
  imports: [CurrencyPipe, DataCard, NgClass],
  templateUrl: './main-view.html',
  styleUrl: './main-view.css',
})
export class MainView {
  currentInvestments = 615000;
  currentExpenses = 100000;
  monthlyContributions = 26000 / 12;
  totalInvestmentsNeeded = 0;
  dateToReachGoal = new Date('2028-01-15T18:30:00Z');

  countdown = {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  private sub?: Subscription;

  constructor() {

  }

  ngOnInit() {
    this.calculateTotalInvestmentsNeeded();

    this.updateCountdown();

    this.sub = interval(1000).subscribe(() => {
      this.updateCountdown();
    });
  }

  calculateTotalInvestmentsNeeded() {
    var withdrawalRate = .04;
    var interestRate = .07; //inflation adjusted
    const monthlyRate = 0.07 / 12;
    var balance = this.currentInvestments;
    var months = 0;

    //get amount for totalInvestmentsNeeded and dateToReachGoal date
    this.totalInvestmentsNeeded = this.currentExpenses * (1 / withdrawalRate);

    while (balance < this.totalInvestmentsNeeded) {
      balance *= (1 + monthlyRate);
      balance += this.monthlyContributions;
      months++;
    }

    const goalDate = new Date();
    goalDate.setMonth(goalDate.getMonth() + months);

    this.dateToReachGoal = goalDate;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private updateCountdown(): void {
    const now = new Date();

    if (now >= this.dateToReachGoal) {
      this.sub?.unsubscribe();
      return;
    }

    this.countdown = this.getDifference(now, this.dateToReachGoal);
  }

  private getDifference(start: Date, end: Date) {
    const temp = new Date(start);

    let years = 0;
    while (new Date(temp.getFullYear() + 1, temp.getMonth(), temp.getDate(), temp.getHours(), temp.getMinutes(), temp.getSeconds()) <= end) {
      temp.setFullYear(temp.getFullYear() + 1);
      years++;
    }

    let months = 0;
    while (new Date(temp.getFullYear(), temp.getMonth() + 1, temp.getDate(), temp.getHours(), temp.getMinutes(), temp.getSeconds()) <= end) {
      temp.setMonth(temp.getMonth() + 1);
      months++;
    }

    const diffMs = end.getTime() - temp.getTime();

    const totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds
    };
  }
}
