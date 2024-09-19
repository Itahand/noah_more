import { BorrowMarket } from "./borrowMarket";
import { BorrowPosition } from "./borrowPosition";
import { InvestmentData } from "./investmentData";

export interface IToken {
  name: string;
  symbol: string;
  decimals: number;
  oracle: string;
}

export interface IInvestmentProp {
  item: InvestmentData;
  updateInfo: (vaultId: string) => void;
}

export interface IInvestmentProps {
  investments: InvestmentData[];
  updateInfo: (vaultId: string) => void;
}

export interface IBorrowMarketProp {
  item: BorrowMarket;
  updateInfo: (marketId: string) => void;
}

export interface IBorrowMarketProps {
  borrowMarkets: BorrowMarket[];
  updateInfo: (marketId: string) => void;
}

export interface IBorrowPositionProp {
  item: BorrowPosition;
  closeModal: () => void;
  updateInfo: (marketId: string) => void;
}
