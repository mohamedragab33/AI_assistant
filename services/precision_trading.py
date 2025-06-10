#!/usr/bin/env python3

import asyncio
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
import httpx
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class PrecisionSignal:
    """Precision trading signal with exact levels"""
    timeframe: str
    action: str  # BUY, SELL, HOLD
    entry_price: float
    take_profit: List[Dict]  # [{"level": float, "weight": float}]
    stop_loss: float
    position_size: float
    confidence: float
    expiration: datetime
    risk_reward: float
    key_triggers: List[str]
    market_context: Dict

class PrecisionTradingEngine:
    """
    Elite Precision Trading Engine
    Provides exact entry, take profit, and stop loss levels
    """
    
    def __init__(self):
        self.timeframe_settings = {
            '5m': {
                'base_position': 300,
                'atr_multiplier': 1.0,
                'tp_ratios': [1.2, 1.8, 2.5],
                'sl_ratio': 1.0,
                'expiration_minutes': 5
            },
            '15m': {
                'base_position': 500,
                'atr_multiplier': 1.2,
                'tp_ratios': [1.5, 2.2, 3.0],
                'sl_ratio': 1.2,
                'expiration_minutes': 15
            },
            '1h': {
                'base_position': 800,
                'atr_multiplier': 1.5,
                'tp_ratios': [2.0, 3.0, 4.0],
                'sl_ratio': 1.5,
                'expiration_minutes': 60
            }
        }
    
    async def generate_trade_recommendation(self, timeframe: str = '15m') -> Dict:
        """Generate precision trade recommendation with exact levels"""
        try:
            logger.info(f"🎯 Generating precision trade for {timeframe}")
            
            # Get market data
            current_price = await self._get_current_price()
            ohlcv_data = await self._get_ohlcv_data(timeframe, 200)
            
            if ohlcv_data.empty:
                return self._generate_no_signal(timeframe)
            
            # Calculate technical levels
            atr = self._calculate_atr(ohlcv_data)
            pivot_points = self._calculate_pivot_points(ohlcv_data)
            volatility = self._calculate_volatility_index(ohlcv_data)
            market_regime = self._get_market_regime(ohlcv_data)
            
            # Determine action and levels
            action = self._determine_action(ohlcv_data, current_price, pivot_points)
            entry_price = self._calculate_entry_price(current_price, pivot_points, volatility, timeframe, action)
            
            # Calculate targets and stop loss
            take_profit_levels = self._calculate_take_profits(entry_price, atr, timeframe, action)
            stop_loss = self._calculate_stop_loss(entry_price, atr, timeframe, action)
            
            # Position sizing and risk management
            position_size = self._calculate_position_size(timeframe, volatility)
            confidence = self._calculate_confidence(ohlcv_data, volatility, market_regime)
            risk_reward = self._calculate_risk_reward(entry_price, take_profit_levels[0]['level'], stop_loss)
            
            # Key triggers and context
            key_triggers = self._get_key_triggers(ohlcv_data, timeframe, action)
            market_context = self._get_market_context(market_regime, volatility, pivot_points)
            
            signal = {
                "timeframe": timeframe,
                "action": action,
                "entry_price": round(entry_price, 2),
                "take_profit": take_profit_levels,
                "stop_loss": round(stop_loss, 2),
                "position_size": round(position_size, 0),
                "confidence": round(confidence, 1),
                "expiration": (datetime.now() + timedelta(minutes=self.timeframe_settings[timeframe]['expiration_minutes'])).isoformat(),
                "risk_reward": round(risk_reward, 1),
                "key_triggers": key_triggers,
                "market_context": market_context,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"🎯 Precision signal generated: {action} @ ${entry_price:.2f}")
            return signal
            
        except Exception as e:
            logger.error(f"Error generating precision signal: {e}")
            return self._generate_no_signal(timeframe)
    
    async def _get_current_price(self) -> float:
        """Get current Bitcoin price"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT")
                data = response.json()
                return float(data['price'])
        except Exception as e:
            logger.error(f"Error fetching price: {e}")
            return 105000.0
    
    async def _get_ohlcv_data(self, timeframe: str, limit: int = 200) -> pd.DataFrame:
        """Get OHLCV data for analysis"""
        try:
            interval_map = {'5m': '5m', '15m': '15m', '1h': '1h'}
            interval = interval_map.get(timeframe, '15m')
            
            async with httpx.AsyncClient() as client:
                url = f"https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval={interval}&limit={limit}"
                response = await client.get(url)
                data = response.json()
                
                if not data:
                    return pd.DataFrame()
                
                df = pd.DataFrame(data, columns=[
                    'timestamp', 'open', 'high', 'low', 'close', 'volume',
                    'close_time', 'quote_asset_volume', 'number_of_trades',
                    'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
                ])
                
                for col in ['open', 'high', 'low', 'close', 'volume']:
                    df[col] = pd.to_numeric(df[col])
                
                return df[['open', 'high', 'low', 'close', 'volume']]
                
        except Exception as e:
            logger.error(f"Error fetching OHLCV data: {e}")
            return pd.DataFrame()
    
    def _calculate_atr(self, df: pd.DataFrame, period: int = 14) -> float:
        """Calculate Average True Range"""
        if len(df) < period:
            return df['high'].iloc[-1] - df['low'].iloc[-1]
        
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())
        
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        return tr.rolling(period).mean().iloc[-1]
    
    def _calculate_pivot_points(self, df: pd.DataFrame) -> Dict:
        """Calculate pivot points for precision levels"""
        if len(df) < 2:
            latest = df.iloc[-1]
            return {
                'p': latest['close'],
                'r1': latest['close'] * 1.01,
                'r2': latest['close'] * 1.02,
                's1': latest['close'] * 0.99,
                's2': latest['close'] * 0.98
            }
        
        # Yesterday's data for pivot calculation
        prev = df.iloc[-2]
        high, low, close = prev['high'], prev['low'], prev['close']
        
        pivot = (high + low + close) / 3
        r1 = (2 * pivot) - low
        r2 = pivot + (high - low)
        s1 = (2 * pivot) - high
        s2 = pivot - (high - low)
        
        return {
            'p': pivot,
            'r1': r1,
            'r2': r2,
            's1': s1,
            's2': s2
        }
    
    def _calculate_volatility_index(self, df: pd.DataFrame) -> float:
        """Calculate volatility index (0-1)"""
        if len(df) < 20:
            return 0.5
        
        returns = df['close'].pct_change().dropna()
        volatility = returns.rolling(20).std().iloc[-1]
        return min(max(volatility * 100, 0), 1)  # Normalize to 0-1
    
    def _get_market_regime(self, df: pd.DataFrame) -> str:
        """Determine market regime"""
        if len(df) < 50:
            return "neutral"
        
        sma_20 = df['close'].rolling(20).mean().iloc[-1]
        sma_50 = df['close'].rolling(50).mean().iloc[-1]
        current_price = df['close'].iloc[-1]
        
        if current_price > sma_20 > sma_50:
            return "bullish_trend"
        elif current_price < sma_20 < sma_50:
            return "bearish_trend"
        else:
            return "consolidation"
    
    def _determine_action(self, df: pd.DataFrame, current_price: float, pivots: Dict) -> str:
        """Determine trading action"""
        if len(df) < 10:
            return "HOLD"
        
        # Simple momentum + pivot logic
        sma_10 = df['close'].rolling(10).mean().iloc[-1]
        price_vs_sma = (current_price - sma_10) / sma_10
        
        # RSI-like momentum
        gains = df['close'].diff().where(df['close'].diff() > 0, 0)
        losses = -df['close'].diff().where(df['close'].diff() < 0, 0)
        avg_gain = gains.rolling(14).mean().iloc[-1]
        avg_loss = losses.rolling(14).mean().iloc[-1]
        
        if avg_loss == 0:
            rsi = 100
        else:
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
        
        # Decision logic
        if price_vs_sma > 0.001 and rsi > 50 and current_price > pivots['p']:
            return "BUY"
        elif price_vs_sma < -0.001 and rsi < 50 and current_price < pivots['p']:
            return "SELL"
        else:
            return "HOLD"
    
    def _calculate_entry_price(self, current_price: float, pivots: Dict, volatility: float, timeframe: str, action: str) -> float:
        """Calculate precise entry price"""
        settings = self.timeframe_settings[timeframe]
        spread_adjustment = current_price * 0.0001  # 1 basis point
        
        if action == "BUY":
            if timeframe == "5m":
                # Scalping - enter just below resistance
                if current_price > pivots['p'] and volatility < 0.4:
                    return pivots['r1'] - spread_adjustment
                else:
                    return current_price - (spread_adjustment * 0.5)
            elif timeframe == "15m":
                # Swing entry - wait for pullback
                return current_price - (spread_adjustment * 2)
            else:  # 1h
                # Position entry - current market
                return current_price - spread_adjustment
                
        elif action == "SELL":
            if timeframe == "5m":
                # Scalping - enter just above support
                if current_price < pivots['p'] and volatility > 0.6:
                    return pivots['s1'] + spread_adjustment
                else:
                    return current_price + (spread_adjustment * 0.5)
            elif timeframe == "15m":
                # Swing entry
                return current_price + (spread_adjustment * 2)
            else:  # 1h
                # Position entry
                return current_price + spread_adjustment
        
        return current_price
    
    def _calculate_take_profits(self, entry_price: float, atr: float, timeframe: str, action: str) -> List[Dict]:
        """Calculate take profit levels"""
        settings = self.timeframe_settings[timeframe]
        tp_ratios = settings['tp_ratios']
        weights = [0.5, 0.3, 0.2]
        
        take_profits = []
        for i, ratio in enumerate(tp_ratios):
            if action == "BUY":
                tp_level = entry_price + (atr * ratio)
            else:  # SELL
                tp_level = entry_price - (atr * ratio)
            
            take_profits.append({
                "level": round(tp_level, 2),
                "weight": weights[i]
            })
        
        return take_profits
    
    def _calculate_stop_loss(self, entry_price: float, atr: float, timeframe: str, action: str) -> float:
        """Calculate stop loss level"""
        settings = self.timeframe_settings[timeframe]
        sl_ratio = settings['sl_ratio']
        
        if action == "BUY":
            return entry_price - (atr * sl_ratio)
        else:  # SELL
            return entry_price + (atr * sl_ratio)
    
    def _calculate_position_size(self, timeframe: str, volatility: float) -> float:
        """Calculate position size based on volatility"""
        settings = self.timeframe_settings[timeframe]
        base_size = settings['base_position']
        
        # Inverse volatility adjustment
        volatility_factor = 1.5 - (volatility * 0.5)
        return base_size * max(volatility_factor, 0.5)
    
    def _calculate_confidence(self, df: pd.DataFrame, volatility: float, regime: str) -> float:
        """Calculate signal confidence"""
        base_confidence = 65.0
        
        # Regime confidence
        if regime == "bullish_trend":
            base_confidence += 15
        elif regime == "bearish_trend":
            base_confidence += 10
        elif regime == "consolidation":
            base_confidence -= 5
        
        # Volatility adjustment
        if volatility < 0.3:
            base_confidence += 10  # Low volatility = higher confidence
        elif volatility > 0.7:
            base_confidence -= 15  # High volatility = lower confidence
        
        # Volume confirmation
        if len(df) >= 20:
            avg_volume = df['volume'].rolling(20).mean().iloc[-1]
            current_volume = df['volume'].iloc[-1]
            volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
            
            if volume_ratio > 1.2:
                base_confidence += 5
            elif volume_ratio < 0.8:
                base_confidence -= 5
        
        return min(max(base_confidence, 0), 100)
    
    def _calculate_risk_reward(self, entry: float, tp1: float, sl: float) -> float:
        """Calculate risk/reward ratio"""
        if entry == 0 or sl == 0:
            return 0
        
        reward = abs(tp1 - entry)
        risk = abs(entry - sl)
        
        if risk == 0:
            return 0
        
        return reward / risk
    
    def _get_key_triggers(self, df: pd.DataFrame, timeframe: str, action: str) -> List[str]:
        """Get key technical triggers"""
        triggers = []
        
        if len(df) < 20:
            return ["Insufficient data for triggers"]
        
        # Moving average signals
        sma_20 = df['close'].rolling(20).mean().iloc[-1]
        current_price = df['close'].iloc[-1]
        
        if action == "BUY":
            if current_price > sma_20:
                triggers.append("Price above 20-period SMA")
            triggers.append(f"Break of {timeframe} resistance")
            triggers.append("Volume confirmation needed")
        elif action == "SELL":
            if current_price < sma_20:
                triggers.append("Price below 20-period SMA")
            triggers.append(f"Break of {timeframe} support")
            triggers.append("Volume confirmation needed")
        else:
            triggers.append("Wait for directional break")
            triggers.append("Monitor volume for confirmation")
        
        return triggers
    
    def _get_market_context(self, regime: str, volatility: float, pivots: Dict) -> Dict:
        """Get market context information"""
        volatility_desc = "Low" if volatility < 0.3 else "High" if volatility > 0.7 else "Medium"
        
        regime_descriptions = {
            "bullish_trend": "Strong uptrend - momentum favors longs",
            "bearish_trend": "Strong downtrend - momentum favors shorts", 
            "consolidation": "Sideways movement - range trading",
            "neutral": "Mixed signals - cautious approach"
        }
        
        return {
            "regime": regime,
            "regime_description": regime_descriptions.get(regime, "Unknown"),
            "volatility_index": round(volatility, 2),
            "volatility_level": volatility_desc,
            "key_levels": [
                round(pivots['r2'], 2),
                round(pivots['r1'], 2),
                round(pivots['p'], 2),
                round(pivots['s1'], 2),
                round(pivots['s2'], 2)
            ]
        }
    
    def _generate_no_signal(self, timeframe: str) -> Dict:
        """Generate default no-signal response"""
        return {
            "timeframe": timeframe,
            "action": "HOLD",
            "entry_price": 0,
            "take_profit": [],
            "stop_loss": 0,
            "position_size": 0,
            "confidence": 0,
            "expiration": datetime.now().isoformat(),
            "risk_reward": 0,
            "key_triggers": ["No clear signal available"],
            "market_context": {
                "regime": "unknown",
                "regime_description": "Insufficient data",
                "volatility_index": 0,
                "volatility_level": "Unknown",
                "key_levels": []
            },
            "timestamp": datetime.now().isoformat()
        } 