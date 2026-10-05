'use client';

import { useState } from 'react';
import { parseAmount, auctionCosts, maximumOffer } from '@/lib/calculator';
import { Calculator, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';

interface ResaleCalculatorProps {
  startingPrice: number;
  estimatedResaleValue?: number;
}

export default function ResaleCalculator({ startingPrice, estimatedResaleValue }: ResaleCalculatorProps) {
  const [bidAmount, setBidAmount] = useState<string>(String(startingPrice));
  const [otherCosts, setOtherCosts] = useState<string>('');
  const [userResaleValue, setUserResaleValue] = useState<string>(estimatedResaleValue ? String(estimatedResaleValue) : '');
  const [discountedPayment, setDiscountedPayment] = useState(false);

  const numOther = parseAmount(otherCosts);
  const numResale = parseAmount(userResaleValue);
  const costs = auctionCosts(parseAmount(bidAmount), numOther, discountedPayment);
  const totalInvestment = costs.total;
  const resaleValue = numResale;
  const potentialProfit = resaleValue - totalInvestment;
  const roi = totalInvestment > 0 ? ((potentialProfit / totalInvestment) * 100) : 0;
  const hasInput = parseAmount(bidAmount) > 0 || numOther > 0 || resaleValue > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };
  const formatInput = (val: string) => {
    const n = parseFloat(val.replace(/,/g, ''));
    if (isNaN(n)) return val;
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
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

      <p className="text-xs text-gray-500">Precio base de referencia: {formatCurrency(startingPrice)}. Puedes calcular con una oferta menor o mayor. Este cálculo no envía una oferta.</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="auction-bid-amount" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Tu Oferta de Subasta
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input
              id="auction-bid-amount"
              type="text"
              inputMode="decimal"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value.replace(/[^0-9.,]/g, '').replace(/(\..*)\./g, '$1'))}
              onBlur={(e) => { if (e.target.value) setBidAmount(formatInput(e.target.value)); }}
              placeholder="0.00"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-bold text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Otros Costos (Transporte, etc.)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={otherCosts}
              onFocus={(e) => { if (e.target.value === '0' || e.target.value === '0.00') setOtherCosts(''); }}
              onChange={(e) => setOtherCosts(e.target.value.replace(/[^0-9.,]/g, '').replace(/(\..*)\./g, '$1'))}
              onBlur={(e) => { if (e.target.value) setOtherCosts(formatInput(e.target.value)); }}
              placeholder="0.00"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-bold text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-xl bg-white/5 p-4">
          <label htmlFor="auction-payment" className="block text-sm font-medium text-gray-300">Método de pago</label>
          <select id="auction-payment" value={discountedPayment ? 'discounted' : 'standard'} onChange={e => setDiscountedPayment(e.target.value === 'discounted')} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white">
            <option value="standard">Pago con cargo del 4%</option>
            <option value="discounted">Cheque de gerente, depósito o efectivo (sin el 4%)</option>
          </select>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2"><dt>Broker fee</dt><dd>{formatCurrency(costs.broker)}</dd></div>
            <div className="flex justify-between gap-2"><dt>Gestoría</dt><dd>{formatCurrency(costs.paperwork)}</dd></div>
            <div className="flex justify-between gap-2"><dt>Cargo del 4% sobre el vehículo</dt><dd>{formatCurrency(costs.paymentCharge)}</dd></div>
          </dl>
          <p className="text-xs text-gray-400">Gestoría: $350 por compra. Broker fee: $350 para precios menores de $1,000; $750 desde $1,000; $999 desde $5,000; 8% desde $15,000. Estos cargos ya están incluidos en el total.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Valor Estimado de Reventa
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={userResaleValue}
              onFocus={(e) => { if (e.target.value === '0' || e.target.value === '0.00') setUserResaleValue(''); }}
              onChange={(e) => setUserResaleValue(e.target.value.replace(/[^0-9.,]/g, '').replace(/(\..*)\./g, '$1'))}
              onBlur={(e) => { if (e.target.value) setUserResaleValue(formatInput(e.target.value)); }}
              placeholder={estimatedResaleValue ? formatCurrency(estimatedResaleValue) : '0.00'}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-bold text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {estimatedResaleValue && !userResaleValue && (
            <p className="text-xs text-gray-500 mt-1">Valor estimado por el vendedor: {formatCurrency(estimatedResaleValue)}</p>
          )}
        </div>
      </div>

      {!hasInput ? (
        <p className="text-sm text-gray-500 text-center py-4 border border-dashed border-white/10 rounded-xl">Ingresa costos y valor de reventa para ver el resultado</p>
      ) : (
        <div className="border-t border-white/10 pt-6 space-y-4">
          <h4 className="font-bold text-gray-300">Resultados</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-sm text-gray-400">Inversión Total</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalInvestment)}</p>
              <p className="text-xs text-gray-500 mt-1">Tu oferta + Broker fee + Gestoría + Cargo de pago + Otros costos</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-sm text-gray-400">Valor de Reventa</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(resaleValue)}</p>
              <p className="text-xs text-gray-500 mt-1">{userResaleValue ? 'Tu estimación' : 'Estimado por vendedor'}</p>
            </div>
          </div>
          <div className={`p-4 rounded-xl border-2 ${potentialProfit >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-5 w-5 ${potentialProfit >= 0 ? 'text-green-400' : 'text-gray-400'}`} />
                <span className="font-bold text-lg">{potentialProfit >= 0 ? 'Ganancia Potencial' : 'Resultado'}</span>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${potentialProfit >= 0 ? 'text-green-400' : 'text-white'}`}>{formatCurrency(potentialProfit)}</p>
                <p className="text-sm text-gray-400 mt-1">ROI: <span className={`font-bold ${roi >= 0 ? 'text-green-400' : 'text-gray-400'}`}>{formatPercent(roi)}</span></p>
              </div>
            </div>
          </div>
          {resaleValue > 0 && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
              <p className="text-sm text-primary/80 flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                <strong>Precio Máximo de Oferta Sugerido:</strong> {formatCurrency(maximumOffer(resaleValue, numOther, discountedPayment))}
                <span className="text-xs ml-2 text-gray-500">(para break-even)</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
