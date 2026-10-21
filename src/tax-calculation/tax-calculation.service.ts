
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PayrollReduction } from 'src/entities/payroll-reduction.entity';
import { CalculateTaxDto } from './dto/calculate-tax.dto';

interface TaxConfig {
  payone_reduction: number;
  paytwo_reduction: number;
  paythree_reduction: number;
  payfour_reduction: number;

  paytwo_addition: number;
  paythree_addition: number;
  payfour_addition: number;

  payone_percentage: number;
  paytwo_percentage: number;
  paythree_percentage: number;
  payfour_percentage: number;
}

@Injectable()
export class TaxCalculationService {
  private readonly NSSF_RATE = 0.10;
  private readonly SDL_RATE = 0.035;
  private readonly WCF_RATE = 0.005;

  private readonly MAX_ITERATIONS = 200;
  private readonly TOLERANCE = 0.01;

  constructor(
    @InjectRepository(PayrollReduction)
    private readonly payCalculatorRepository: Repository<PayrollReduction>,
  ) {}

  private async getTaxConfig(): Promise<TaxConfig> {
    const config = await this.payCalculatorRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });

    if (!config) {
      throw new NotFoundException(
        'PAYE tax configuration was not found',
      );
    }

    return config;
  }

  /**
   * Convert tax thresholds and fixed additions to the
   * currency used for the salary calculation.
   */
  private prepareTaxConfig(
    config: TaxConfig,
    currencyType: 'tzs' | 'usd',
    exchangeRate: number,
  ): TaxConfig {
    if (currencyType === 'tzs') {
      return config;
    }

    if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
      throw new BadRequestException(
        'A valid exchange rate is required for USD calculations',
      );
    }

    return {
      ...config,
      payone_reduction: config.payone_reduction / exchangeRate,
      paytwo_reduction: config.paytwo_reduction / exchangeRate,
      paythree_reduction: config.paythree_reduction / exchangeRate,
      payfour_reduction: config.payfour_reduction / exchangeRate,

      paytwo_addition: config.paytwo_addition / exchangeRate,
      paythree_addition: config.paythree_addition / exchangeRate,
      payfour_addition: config.payfour_addition / exchangeRate,
    };
  }

  /**
   * Calculate PAYE from taxable income using configured tax brackets.
   */
  private calculatePaye(
    taxableIncome: number,
    config: TaxConfig,
  ): number {
    if (taxableIncome <= config.payone_reduction) {
      return 0;
    }

    if (taxableIncome <= config.paytwo_reduction) {
      return (
        (taxableIncome - config.payone_reduction) *
        config.payone_percentage
      );
    }

    if (taxableIncome <= config.paythree_reduction) {
      return (
        (taxableIncome - config.paytwo_reduction) *
          config.paytwo_percentage +
        config.paytwo_addition
      );
    }

    if (taxableIncome <= config.payfour_reduction) {
      return (
        (taxableIncome - config.paythree_reduction) *
          config.paythree_percentage +
        config.paythree_addition
      );
    }

    return (
      (taxableIncome - config.payfour_reduction) *
        config.payfour_percentage +
      config.payfour_addition
    );
  }

  /**
   * Calculate employee deductions, net pay, employer contributions,
   * and total cost to company from gross salary.
   *
   * Percentage values in the response are decimal fractions:
   * 0.10 = 10%, 0.035 = 3.5%, and 0.005 = 0.5%.
   */
  private calculateFromGross(
    grossSalary: number,
    config: TaxConfig,
  ) {
    // Employee deductions
    const nssfDeduction = grossSalary * this.NSSF_RATE;

    const taxableIncome = Math.max(
      0,
      grossSalary - nssfDeduction,
    );

    const paye = this.calculatePaye(taxableIncome, config);

    const totalDeductions = nssfDeduction + paye;

    const netPay = grossSalary - totalDeductions;

    // Employer contributions
    const sscEmployer = grossSalary * this.NSSF_RATE;
    const sdl = grossSalary * this.SDL_RATE;
    const wcf = grossSalary * this.WCF_RATE;

    const totalEmployerContributions =
      sscEmployer + sdl + wcf;

    // Total company cost
    const totalCostToCompany =
      grossSalary + totalEmployerContributions;

    return {
      gross_salary: grossSalary,
      gross_earnings: grossSalary,

      nssf_deduction: nssfDeduction,
      ssc_employee: nssfDeduction,
      taxable_income: taxableIncome,

      paye,
      total_deductions: totalDeductions,

      net_pay: netPay,
      net_salary: netPay,

      ssc_employer: sscEmployer,
      ssc_employer_percentage: this.NSSF_RATE,

      sdl,
      sdl_percentage: this.SDL_RATE,

      wcf,
      wcf_percentage: this.WCF_RATE,

      total_employer_contributions: totalEmployerContributions,
      total_cost_to_company: totalCostToCompany,
    };
  }

  /**
   * Estimate gross salary for a target net salary using binary search.
   */
  private estimateGrossSalary(
    targetNetPay: number,
    config: TaxConfig,
  ) {
    if (targetNetPay < 0 || !Number.isFinite(targetNetPay)) {
      throw new BadRequestException(
        'Net salary must be a valid non-negative number',
      );
    }

    if (targetNetPay === 0) {
      return this.calculateFromGross(0, config);
    }

    let minGross = targetNetPay;
    let maxGross = Math.max(targetNetPay * 2, 1);

    let upperResult = this.calculateFromGross(maxGross, config);
    let expansionCount = 0;
    const maxExpansions = 100;

    while (
      upperResult.net_pay < targetNetPay &&
      expansionCount < maxExpansions
    ) {
      maxGross *= 2;

      if (!Number.isFinite(maxGross)) {
        throw new BadRequestException(
          'Unable to estimate gross salary for this net amount',
        );
      }

      upperResult = this.calculateFromGross(maxGross, config);
      expansionCount++;
    }

    if (upperResult.net_pay < targetNetPay) {
      throw new BadRequestException(
        'Unable to find a gross salary for the requested net salary',
      );
    }

    let result = upperResult;

    for (let i = 0; i < this.MAX_ITERATIONS; i++) {
      const grossSalary = (minGross + maxGross) / 2;

      result = this.calculateFromGross(grossSalary, config);

      if (
        Math.abs(result.net_pay - targetNetPay) <= this.TOLERANCE
      ) {
        break;
      }

      if (result.net_pay < targetNetPay) {
        minGross = grossSalary;
      } else {
        maxGross = grossSalary;
      }
    }

    return result;
  }

  async calculate(dto: CalculateTaxDto) {
    const currencyType = dto.currencyType ?? 'tzs';
    const exchangeRate = dto.exchangeRate ?? 0;
    const allowances = dto.allowances ?? [];
    const insurance = dto.insurance ?? 0;

    if (
      !['tzs', 'usd'].includes(currencyType)
    ) {
      throw new BadRequestException(
        'Currency type must be tzs or usd',
      );
    }

    if (
      allowances.some(
        (amount) => !Number.isFinite(amount) || amount < 0,
      )
    ) {
      throw new BadRequestException(
        'Allowances must contain valid non-negative amounts',
      );
    }

    if (!Number.isFinite(insurance) || insurance < 0) {
      throw new BadRequestException(
        'Insurance must be a valid non-negative amount',
      );
    }

    const rawConfig = await this.getTaxConfig();

    const config = this.prepareTaxConfig(
      rawConfig,
      currencyType,
      exchangeRate,
    );

    const totalAllowance = allowances.reduce(
      (total, amount) => total + amount,
      0,
    );

    let result: ReturnType<typeof this.calculateFromGross>;
    let basicPay: number;
    let totalGross: number;

    if (dto.salaryType === 'gross') {
      if (
        dto.basicPay === undefined ||
        !Number.isFinite(dto.basicPay) ||
        dto.basicPay < 0
      ) {
        throw new BadRequestException(
          'A valid basicPay is required for gross salary calculation',
        );
      }

      basicPay = dto.basicPay;

      // Preserve the existing formula.
      totalGross = basicPay + totalAllowance + insurance;

      result = this.calculateFromGross(totalGross, config);
    } else {
      if (
        dto.netPay === undefined ||
        !Number.isFinite(dto.netPay) ||
        dto.netPay < 0
      ) {
        throw new BadRequestException(
          'A valid netPay is required for net salary calculation',
        );
      }

      result = this.estimateGrossSalary(dto.netPay, config);

      totalGross = result.gross_salary;
      basicPay = totalGross - totalAllowance - insurance;

      if (basicPay < -this.TOLERANCE) {
        throw new BadRequestException(
          'Allowances and insurance exceed the estimated gross salary',
        );
      }

      basicPay = Math.max(0, basicPay);
    }

    const round = (value: number) => this.round(value);

    return {
      success: true,
      data: {
        currency: currencyType.toUpperCase(),
        salary_type: dto.salaryType,

        // 1. Earnings
        basic_pay: round(basicPay),
        total_allowance: round(totalAllowance),
        insurance: round(insurance),
        gross_earnings: round(totalGross),
        total_gross: round(totalGross),
        gross_salary: round(totalGross),

        // 2. Employee deductions
        taxable_amount: round(result.taxable_income),
        taxable_income: round(result.taxable_income),

        nssf_deduction: round(result.nssf_deduction),
        ssc_employee: round(result.ssc_employee),
        ssc_employee_percentage: this.NSSF_RATE,

        paye: round(result.paye),
        pay: round(result.paye),

        total_deductions: round(result.total_deductions),

        // 3. Net salary
        net_pay: round(result.net_pay),
        net_salary: round(result.net_salary),

        // 4. Employer contributions
        ssc_employer: round(result.ssc_employer),
        ssc_employer_percentage: result.ssc_employer_percentage,

        sdl: round(result.sdl),
        sdl_percentage: result.sdl_percentage,

        wcf: round(result.wcf),
        wcf_percentage: result.wcf_percentage,

        total_employer_contributions: round(
          result.total_employer_contributions,
        ),

        // 5. Total cost to company
        total_cost_to_company: round(
          result.total_cost_to_company,
        ),
      },
    };
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
