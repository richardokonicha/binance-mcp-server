export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface RiskAssessment {
  level: RiskLevel;
  requiresConfirmation: boolean;
  warnings: string[];
  estimatedValue?: string;
  estimatedLoss?: string;
  liquidationRisk?: boolean;
}

export interface OrderPreview {
  symbol: string;
  side: string;
  type: string;
  quantity: string;
  price?: string;
  estimatedCost: string;
  estimatedCostUSD?: string;
  riskAssessment: RiskAssessment;
}

/**
 * Assesseth the risk level of an order most carefully
 */
export function assessOrderRisk(params: {
  orderType: string;
  isNewPosition: boolean;
  isIncreasingPosition: boolean;
  isDefensiveOrder: boolean; // stop-loss, take-profit, close position
  leverage?: number;
  positionSizePercent?: number; // % of account balance
}): RiskAssessment {
  const warnings: string[] = [];
  let level = RiskLevel.LOW;
  let requiresConfirmation = false;

  // Defensive orders (stop-loss, take-profit, close) = MEDIUM risk
  if (params.isDefensiveOrder) {
    level = RiskLevel.MEDIUM;
    warnings.push('Thou art placing a defensive order to protect thy position');
    return { level, requiresConfirmation: false, warnings };
  }

  // New position or increasing = Higher risk
  if (params.isNewPosition || params.isIncreasingPosition) {
    level = RiskLevel.HIGH;
    requiresConfirmation = true;
    warnings.push('⚠️ Thou art opening or increasing a position - risk of loss exists!');
  }

  // Check leverage
  if (params.leverage) {
    if (params.leverage > 20) {
      level = RiskLevel.CRITICAL;
      requiresConfirmation = true;
      warnings.push('🔥 PERIL MOST DIRE! Leverage exceeds 20x - liquidation risk is extreme!');
    } else if (params.leverage > 10) {
      level = RiskLevel.HIGH;
      requiresConfirmation = true;
      warnings.push('⚠️⚠️ High leverage detected (>10x) - thy margin be thin!');
    } else if (params.leverage > 5) {
      warnings.push('⚠️ Moderate leverage (>5x) - exercise caution');
    }
  }

  // Check position size
  if (params.positionSizePercent) {
    if (params.positionSizePercent > 80) {
      level = RiskLevel.CRITICAL;
      requiresConfirmation = true;
      warnings.push('🔥 CATASTROPHIC RISK! Order size exceeds 80% of thy account!');
    } else if (params.positionSizePercent > 50) {
      level = RiskLevel.HIGH;
      requiresConfirmation = true;
      warnings.push('⚠️⚠️ Large order! Greater than 50% of thy account balance!');
    } else if (params.positionSizePercent > 25) {
      warnings.push('⚠️ Substantial order size (>25% of account)');
    }
  }

  return {
    level,
    requiresConfirmation,
    warnings,
  };
}

/**
 * Calculateth the estimated liquidation price for a position
 */
export function estimateLiquidationPrice(params: {
  entryPrice: number;
  leverage: number;
  side: 'LONG' | 'SHORT';
  maintenanceMarginRate?: number; // Default 0.004 (0.4%)
}): number {
  const mmr = params.maintenanceMarginRate || 0.004;
  const entryPrice = params.entryPrice;
  const leverage = params.leverage;

  if (params.side === 'LONG') {
    // Long liquidation = Entry * (1 - (1/leverage) + MMR)
    return entryPrice * (1 - 1 / leverage + mmr);
  } else {
    // Short liquidation = Entry * (1 + (1/leverage) - MMR)
    return entryPrice * (1 + 1 / leverage - mmr);
  }
}

/**
 * Calculateth the position value in USDT
 */
export function calculatePositionValue(params: {
  quantity: number;
  price: number;
}): number {
  return params.quantity * params.price;
}

/**
 * Formateth risk warning messages in Shakespearean style
 */
export function formatRiskWarning(riskLevel: RiskLevel, details?: string): string {
  const warnings = {
    [RiskLevel.LOW]: 'Thy request proceedeth without peril.',
    [RiskLevel.MEDIUM]: `⚠️ Caution advised! ${details || 'Thy action carries moderate risk.'}`,
    [RiskLevel.HIGH]: `⚠️⚠️ HEED THIS WARNING! ${details || 'Thy order carries substantial risk. Confirmeth with confirmRisk: true to proceed.'}`,
    [RiskLevel.CRITICAL]: `🔥 PERIL MOST DIRE! ${details || 'Thy account balance doth face grave danger! Thrice consider before proceeding!'}`,
  };

  return warnings[riskLevel];
}

/**
 * Validat eth that user hath confirmed high-risk actions
 */
export function validateRiskConfirmation(
  riskAssessment: RiskAssessment,
  confirmRisk?: boolean
): void {
  if (riskAssessment.requiresConfirmation && !confirmRisk) {
    const warningMessage = [
      formatRiskWarning(riskAssessment.level),
      '',
      'Warnings:',
      ...riskAssessment.warnings,
      '',
      'To proceed, thou must set: confirmRisk: true',
    ].join('\n');

    throw new Error(warningMessage);
  }
}

/**
 * Create th a detailed order preview with risk assessment
 */
export function createOrderPreview(params: {
  symbol: string;
  side: string;
  type: string;
  quantity: string;
  price?: string;
  currentPrice?: number;
  leverage?: number;
  accountBalance?: number;
  isDefensiveOrder?: boolean;
}): OrderPreview {
  const quantity = parseFloat(params.quantity);
  const price = params.price ? parseFloat(params.price) : params.currentPrice || 0;
  const estimatedCost = (quantity * price).toFixed(2);

  let positionSizePercent: number | undefined;
  if (params.accountBalance) {
    positionSizePercent = (parseFloat(estimatedCost) / params.accountBalance) * 100;
  }

  const isNewPosition = params.type === 'MARKET' || params.type === 'LIMIT';
  const isIncreasingPosition = params.side === 'BUY' || params.side === 'SELL';

  const riskAssessment = assessOrderRisk({
    orderType: params.type,
    isNewPosition,
    isIncreasingPosition,
    isDefensiveOrder: params.isDefensiveOrder || false,
    leverage: params.leverage,
    positionSizePercent,
  });

  return {
    symbol: params.symbol,
    side: params.side,
    type: params.type,
    quantity: params.quantity,
    price: params.price,
    estimatedCost,
    estimatedCostUSD: params.currentPrice ? estimatedCost : undefined,
    riskAssessment,
  };
}
