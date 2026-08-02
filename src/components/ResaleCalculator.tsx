'use client';

import { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface ResaleCalculatorProps {
  startingPrice: number;
  estimatedResaleValue?: number;
  estimatedRepairCost?: number;
}

export default function ResaleCalculator({ startingPrice, estimatedResaleValue, estimatedRepairCost }: ResaleCalculatorProps) {
  const [repairCost, setRepairCost] = useState(estimatedRepairCost || 0);
  const [otherCosts, setOtherCosts] = useState(0);
  const [userResaleValue, setUserResaleValue] = useState(estimatedResaleValue || '');

  const totalInvestment = startingPrice + repairCost + otherCosts;
  const resaleValue = userResaleValue ? parseFloat(userResaleValue) : (estimatedResaleValue || 0);
  const potentialProfit = resaleValue - totalInvestment;
  const profitMargin = totalInvestment > 0 ? ((potentialProfit / totalInvestment) * 100) : 0;
  const roi = totalInvestment > 0 ? ((potentialProfit / totalInvestment) * 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        Calculadora de Reventa
      </h3>
      <p className="text-sm text-gray-400">Ingresa tus costos estimados para calcular la ganancia potencial</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Precio de Subasta (Base)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input
              type="number"
              value={startingPrice}
              readOnly
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-bold text-white focus:outline-none focus:border-primary cursor-not-allowed opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Costos de Reparación
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input
              type="number"
              value={repairCost}
              onChange={(e) => setRepairCost(parseFloat(e.target.value) || 0)}
              min={0}
              step={100}
              placeholder="Ej. 3000"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-bold text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {estimatedRepairCost && repairCost !== estimatedRepairCost && (
            <p className="text-xs text-gray-500 mt-1">Valor estimado del vendedor: {formatCurrency(estimatedRepairCost)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Otros Costos (Transporte, Impuestos, Tasas, etc.)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input
              type="number"
              value={otherCosts}
              onChange={(e) => setOtherCosts(parseFloat(e.target.value) || 0)}
              min={0}
              step={100}
              placeholder="Ej. 1500"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-bold text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Valor Estimado de Reventa
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input
              type="number"
              value={userResaleValue}
              onChange={(e) => setUserResaleValue(e.target.value)}
              min={0}
              step={100}
              placeholder={estimatedResaleValue ? formatCurrency(estimatedResaleValue) : 'Ej. 25000'}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-bold text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {estimatedResaleValue && !userResaleValue && (
            <p className="text-xs text-gray-500 mt-1">Valor estimado por el vendedor: {formatCurrency(estimatedResaleValue)}</p>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 space-y-4">
        <h4 className="font-bold text-gray-300">Resultados</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <p className="text-sm text-gray-400">Inversión Total</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalInvestment)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Subasta + Reparaciones + Otros
            </p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <p className="text-sm text-gray-400">Valor de Reventa</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(resaleValue)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {userResaleValue ? 'Tu estimación' : 'Estimado por vendedor'}
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-xl border-2 ${
          potentialProfit >= 0 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {potentialProfit >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              )}
              <span className="font-bold text-lg">
                {potentialProfit >= 0 ? 'Ganancia Potencial' : 'Pérdida Potencial'}
              </span>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${potentialProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(Math.abs(potentialProfit))}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                ROI: <span className={`font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatPercent(roi)}</span>
              </p>
            </div>
          </div>
        </div>

        {resaleValue > 0 && (
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
            <p className="text-sm text-primary/80 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              <strong>Precio Máximo de Oferta Sugerido:</strong> {formatCurrency(resaleValue - repairCost - otherCosts)}
              <span className="text-xs ml-2 text-gray-500">(para break-even)</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}