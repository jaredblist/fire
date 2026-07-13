import { CurrencyPipe, NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { DataCard } from "../data-card/data-card";
import { interval, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-view',
  imports: [CurrencyPipe, DataCard, FormsModule, NgIf],
  templateUrl: './main-view.html',
  styleUrl: './main-view.css',
})
export class MainView {
  currentInvestments = 615000;
  currentExpensesWithoutMortgage = 110000; //10000 for property taxes/insurance
  mortgageExpenses = 30000;
  currentExpenses = this.currentExpensesWithoutMortgage;// + this.mortgageExpenses; //doing sum for mortgage instead of monthly to better represent what it will cost
  yearlyContributions = 26000;
  monthlyContributions = this.yearlyContributions / 12;
  dailyContributions = this.yearlyContributions / 365;
  totalInvestmentsNeeded = 0;
  dateToReachGoal = new Date('2028-01-15T18:30:00Z');
  costPerKid = 250000;

  fullMortgagePaymentsLeft = 919818; //as of July 2026 roughly

  countdown = {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  private sub?: Subscription;

  includeCushion = false;
  adjustSpendingFor1Kid = false;
  adjustSpendingFor2Kids = false;
  removeMortgageEntirely = false;
  reduceSpending = false;
  increaseSpending = false;
  noContributions = false;
  doubleContributions = false;

  constructor() {

  }

  ngOnInit() {
    
    this.calculateTotalInvestmentsNeeded();

    this.updateCountdown();

    this.sub = interval(1000).subscribe(() => {
      this.updateCountdown();
    });
  }

  adjustMortgagePayments() {
    var mortgagePaymentCost = 3330;    
    var remainingPayments = this.fullMortgagePaymentsLeft - (mortgagePaymentCost * this.getMonthsSinceJuly2026());

    return remainingPayments;
  }

  getMonthsSinceJuly2026(): number {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)

    const targetYear = 2026;
    const targetMonth = 6; // 6 represents July

    // Calculate total months difference
    let months = (currentYear - targetYear) * 12 + (currentMonth - targetMonth);

    // Optional: If you only want to count *fully completed* months,
    // you can subtract 1 if today's day of the month is less than the target day.
    // if (today.getDate() < 1) { months--; }

    return months;
  }

  calculateTotalInvestmentsNeeded() {
    var mortgagePaymentsLeft = this.adjustMortgagePayments();    

    var withdrawalRate = .04;
    var interestRate = .07; //inflation adjusted
    const monthlyRate = interestRate / 12;
    const dailyRate = interestRate / 365;
    var balance = this.currentInvestments;
    var days = 0;
    var months = 0;

    var expenses = this.currentExpenses;
    var dailyContributions = this.dailyContributions;

    if (this.includeCushion)
      expenses += 10000;    

    if (this.reduceSpending) {
      expenses *= .9;
    }
    
    if (this.increaseSpending) {
      expenses *= 1.1;
    }
    
    this.totalInvestmentsNeeded = expenses * (1 / withdrawalRate);


    if (this.adjustSpendingFor1Kid && this.adjustSpendingFor2Kids) {
      //2 kids
      var lumpSumAddition = this.costPerKid * 2;
      this.totalInvestmentsNeeded += lumpSumAddition;
    }
    else if (this.adjustSpendingFor1Kid || this.adjustSpendingFor2Kids) {
      //1 kid
      var lumpSumAddition = this.costPerKid;
      this.totalInvestmentsNeeded += lumpSumAddition;
    }
    
    if (!this.removeMortgageEntirely) {
      this.totalInvestmentsNeeded += mortgagePaymentsLeft;
    }

    if (this.noContributions)
      dailyContributions = 0;
    
    if (this.doubleContributions)
      dailyContributions *= 2;

    while (balance < this.totalInvestmentsNeeded) {
      balance *= (1 + dailyRate);
      balance += dailyContributions;
      days++;
    }

    const goalDate = new Date();
    //goalDate.setMonth(goalDate.getMonth() + months);
    goalDate.setDate(goalDate.getDate() + days);
    goalDate.setSeconds(goalDate.getSeconds() - 1);

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
