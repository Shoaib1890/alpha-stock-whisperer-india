import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, X } from "lucide-react";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface PortfolioStockProps {
  stock: Stock;
  onRemove: () => void;
}

const PortfolioStock = ({ stock, onRemove }: PortfolioStockProps) => {
  const isPositive = stock.change >= 0;

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 hover:bg-red-50 hover:text-red-500 rounded-lg"
        aria-label={`Remove ${stock.symbol}`}
      >
        <X className="h-3.5 w-3.5" />
      </Button>

      {/* Symbol + Name */}
      <div className="mb-3 pr-6">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {stock.symbol.slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm leading-none">{stock.symbol}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{stock.name}</p>
          </div>
        </div>
      </div>

      {/* Price row */}
      <div className="flex items-end justify-between">
        <span className="text-xl font-bold text-slate-900">
          ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <div
          className={`flex flex-col items-end ${isPositive ? "text-emerald-600" : "text-red-500"}`}
        >
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span className="text-sm font-semibold">
              {isPositive ? "+" : ""}
              {stock.change.toFixed(2)}
            </span>
          </div>
          <span className="text-xs font-medium">
            {isPositive ? "+" : ""}
            {stock.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Bottom bar accent */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl ${isPositive ? "bg-emerald-400" : "bg-red-400"}`}
      />
    </div>
  );
};

export default PortfolioStock;
