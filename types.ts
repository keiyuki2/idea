
export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface BacktestResults {
  netProfit: string;
  profitFactor: string;
  drawdown: string;
  totalTrades: number;
}
