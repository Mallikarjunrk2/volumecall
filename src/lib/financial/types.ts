/**
 * VOLUME CALL FINANCIAL CALCULATOR ENGINE TYPES
 * Section Reference: FINANCIAL CALCULATOR ENGINE Specification - Section 19 & 43
 */

export type CompoundingFrequency = 'annual' | 'semi-annual' | 'quarterly' | 'monthly' | 'daily' | number;

export type InvestmentFrequency = 'monthly' | 'quarterly' | 'annual';

export type PaymentTiming = 'beginning' | 'end';

export type CashFlowType = 'contribution' | 'withdrawal' | 'dividend' | 'payout' | 'valuation';

export interface CashFlow {
  date: Date;
  amount: number; // Negative for money going IN (contribution), positive for money coming OUT (withdrawal/valuation)
  type?: CashFlowType;
  description?: string;
}

export interface CashFlowSchedule {
  cashFlows: CashFlow[];
  totalInvested: number;
  totalWithdrawn: number;
}

export interface CompoundInterestResult {
  principal: number;
  interest: number;
  totalAmount: number;
  annualRate: number;
  compoundingPeriodsPerYear: number;
  years: number;
}

export interface FutureValueResult {
  presentValue: number;
  futureValue: number;
  totalGrowth: number;
  annualRate: number;
  years: number;
}

export interface PresentValueResult {
  futureValue: number;
  presentValue: number;
  discountAmount: number;
  annualRate: number;
  years: number;
}

export interface SipScheduleRow {
  period: number;
  date?: Date;
  deposit: number;
  interestEarned: number;
  totalInvested: number;
  closingBalance: number;
}

export interface SipResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  periodicPayment: number;
  periodsPerYear: number;
  durationYears: number;
  expectedAnnualReturn: number;
  paymentTiming: PaymentTiming;
  schedule?: SipScheduleRow[];
}

export interface StepUpSipScheduleRow {
  year: number;
  month: number;
  period: number;
  monthlySip: number;
  deposit: number;
  interestEarned: number;
  totalInvested: number;
  closingBalance: number;
}

export interface StepUpSipResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  startingSip: number;
  stepUpPercentage: number;
  fixedStepUpAmount?: number;
  durationYears: number;
  paymentTiming: PaymentTiming;
  frequency?: CompoundingFrequency;
  schedule: StepUpSipScheduleRow[];
}

export interface SwpScheduleRow {
  month: number;
  openingBalance: number;
  growth: number;
  balanceAfterGrowth: number;
  withdrawal: number;
  closingBalance: number;
}

export interface SwpResult {
  startingCorpus: number;
  monthlyWithdrawal: number;
  totalWithdrawals: number;
  remainingCorpus: number;
  monthsSurvived: number;
  yearsSurvived: number;
  schedule: SwpScheduleRow[];
}

export interface StpScheduleRow {
  month: number;
  sourceOpening: number;
  sourceGrowth: number;
  transferAmount: number;
  sourceClosing: number;
  targetOpening: number;
  targetGrowth: number;
  targetClosing: number;
}

export interface StpResult {
  sourceInitial: number;
  sourceRemaining: number;
  targetValue: number;
  totalTransferred: number;
  durationMonths: number;
  schedule: StpScheduleRow[];
}

export interface AbsoluteReturnResult {
  investment: number;
  currentValue: number;
  gain: number;
  returnPercentage: number;
}

export interface CagrResult {
  initialValue: number;
  finalValue: number;
  years: number;
  cagr: number;
}

export interface IrrResult {
  success: boolean;
  irr: number | null;
  iterations: number;
  error?: string;
}

export interface XirrResult {
  success: boolean;
  xirr: number | null;
  iterations: number;
  error?: string;
}

export interface TwrSubPeriod {
  startDate: Date;
  endDate: Date;
  startValue: number;
  endValueBeforeCashFlow: number;
  cashFlow: number; // positive for deposit, negative for withdrawal
  subPeriodReturn: number;
}

export interface TwrResult {
  twr: number; // Decimal (e.g. 0.15 for 15%)
  twrPercentage: number;
  subPeriods: TwrSubPeriod[];
}

export interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  principal: number;
  tenureMonths: number;
  annualRate: number;
}

export interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  interest: number;
  principal: number;
  closingBalance: number;
}

export interface AmortizationSchedule {
  rows: AmortizationRow[];
  totalInterest: number;
  totalPayment: number;
}

export interface PrepaymentResult {
  originalSchedule: AmortizationSchedule;
  newSchedule: AmortizationSchedule;
  interestSavings: number;
  tenureReductionMonths?: number;
  newMonthlyEmi?: number;
}

export interface InflationResult {
  presentValue: number;
  futureValue: number;
  inflationRate: number;
  years: number;
}

export interface RealReturnResult {
  nominalReturn: number;
  inflationRate: number;
  realReturn: number;
}

export interface FdResult {
  principal: number;
  maturityAmount: number;
  interestEarned: number;
  tenureYears: number;
  annualRate: number;
  compoundingPeriodsPerYear: number;
  isCumulative: boolean;
  periodicPayout?: number;
}

export interface RdScheduleRow {
  month: number;
  installment: number;
  interestEarned: number;
  totalDeposit: number;
  closingBalance: number;
}

export interface RdResult {
  monthlyInstallment: number;
  totalInvested: number;
  interestEarned: number;
  maturityAmount: number;
  tenureMonths: number;
  annualRate: number;
  schedule: RdScheduleRow[];
}

export interface BondResult {
  faceValue: number;
  couponRate: number;
  price: number;
  tenureYears: number;
  ytm: number | null;
  couponFrequency: number;
}

export interface DcfResult {
  enterpriseValue: number;
  equityValue: number;
  fairValuePerShare?: number;
  pvForecastFcf: number;
  terminalValue: number;
  pvTerminalValue: number;
  forecastedFcfs: number[];
  pvFcfs: number[];
}

export interface ReverseDcfResult {
  impliedGrowthRate: number | null;
  currentPrice: number;
  calculatedEquityValue: number;
  iterations: number;
}

export interface PeValuationResult {
  expectedEps: number;
  fairPe: number;
  fairValue: number;
}

export interface PegResult {
  peRatio: number;
  growthRate: number; // e.g., 15 for 15% growth
  pegRatio: number;
}

export interface EvEbitdaResult {
  ebitda: number;
  multiple: number;
  enterpriseValue: number;
  netDebt: number;
  equityValue: number;
  dilutedShares?: number;
  fairValuePerShare?: number;
}

export interface DdmResult {
  currentDividend: number;
  growthRate: number;
  costOfEquity: number;
  d1: number;
  fairValue: number;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
