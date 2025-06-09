import asyncio
import httpx
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class TradingSignal:
    timeframe: str
    action: str
    entry_price: float
    take_profit: List[Dict[str, float]]
    stop_loss: float
    position_size: float
    confidence: float
    expiration: datetime
    risk_reward: float
    key_triggers: List[str]

class SignalExecutionEngine:
    def __init__(self):
        self.client = httpx.AsyncClient()
        self.current_price = None
        self.price_data = {}
        
    async def generate_execution_plan(self, timeframe: str) -> Dict:
        """Generate precise execution plan for given timeframe"""
        try:
            # Get market context
            await self._update_market_data()
            market_regime = await self._get_market_regime()
            volatility = await self._get_volatility_index()
            
            # Calculate precise levels
            entry, take_profit, stop_loss = await self._calculate_levels(timeframe, market_regime, volatility)
            
            # Determine action
            action = await self._determine_action(timeframe)
            
            # Calculate confidence
            confidence = await self._calculate_confidence(timeframe)
            
            # Generate recommendation
            signal = {
                "timeframe": timeframe,
                "action": action,
                "entry_price": round(entry, 2),
                "take_profit": [
                    {"level": round(take_profit[0], 2), "weight": 0.5},
                    {"level": round(take_profit[1], 2), "weight": 0.3},
                    {"level": round(take_profit[2], 2), "weight": 0.2}
                ],
                "stop_loss": round(stop_loss, 2),
                "position_size": await self._calculate_position_size(timeframe, volatility),
                "confidence": confidence,
                "expiration": (datetime.now() + self._get_expiration_time(timeframe)).isoformat(),
                "risk_reward": await self._calculate_risk_reward(entry, take_profit[0], stop_loss),
                "key_triggers": await self._get_key_triggers(timeframe),
                "market_context": {
                    "regime": market_regime,
                    "volatility": volatility,
                    "current_price": self.current_price
                }
            }
            
            return signal
            
        except Exception as e:
            logger.error(f"Error generating execution plan: {e}")
            return self._get_fallback_signal(timeframe)

    async def _update_market_data(self):
        """Update current market data"""
        try:
            url = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
            response = await self.client.get(url)
            data = response.json()
            self.current_price = float(data['price'])
            
            # Get OHLCV data for different timeframes
            for tf in ['5m', '15m', '1h']:
                ohlcv_url = f"https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval={tf}&limit=100"
                ohlcv_response = await self.client.get(ohlcv_url)
                ohlcv_data = ohlcv_response.json()
                
                # Convert to DataFrame
                df = pd.DataFrame(ohlcv_data, columns=[
                    'timestamp', 'open', 'high', 'low', 'close', 'volume',
                    'close_time', 'quote_asset_volume', 'number_of_trades',
                    'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
                ])
                
                # Convert to numeric
                for col in ['open', 'high', 'low', 'close', 'volume']:
                    df[col] = pd.to_numeric(df[col])
                
                self.price_data[tf] = df
                
        except Exception as e:
            logger.error(f"Error updating market data: {e}")
            # Fallback price
            self.current_price = 105000  # Fallback price

    async def _calculate_levels(self, timeframe: str, regime: str, volatility: float) -> Tuple[float, List[float], float]:
        """Calculate precise entry, take profit, and stop loss levels"""
        try:
            if not self.current_price:
                await self._update_market_data()
                
            current_price = self.current_price
            atr = await self._get_atr(timeframe)
            pivot = await self._get_pivot_point(timeframe)
            
            if timeframe == "5m":
                # Scalping strategy
                if regime == "bullish":
                    entry = current_price * 0.9998  # Slightly below current price
                    tp1 = entry + (atr * 0.8)
                    tp2 = entry + (atr * 1.2)
                    tp3 = entry + (atr * 1.8)
                    stop_loss = entry - (atr * 0.6)
                else:
                    entry = current_price * 1.0002  # Slightly above current price
                    tp1 = entry - (atr * 0.8)
                    tp2 = entry - (atr * 1.2)
                    tp3 = entry - (atr * 1.8)
                    stop_loss = entry + (atr * 0.6)
                    
            elif timeframe == "15m":
                # Swing strategy
                if regime == "bullish":
                    entry = current_price * 0.999
                    tp1 = entry + (atr * 1.5)
                    tp2 = entry + (atr * 2.2)
                    tp3 = entry + (atr * 3.0)
                    stop_loss = entry - (atr * 1.0)
                else:
                    entry = current_price * 1.001
                    tp1 = entry - (atr * 1.5)
                    tp2 = entry - (atr * 2.2)
                    tp3 = entry - (atr * 3.0)
                    stop_loss = entry + (atr * 1.0)
                    
            elif timeframe == "1h":
                # Position strategy
                vwap = await self._calculate_vwap(timeframe)
                if regime == "bullish":
                    entry = min(current_price * 0.998, vwap)
                    tp1 = entry + (atr * 2.0)
                    tp2 = entry + (atr * 3.0)
                    tp3 = entry + (atr * 4.0)
                    stop_loss = entry - (atr * 1.5)
                else:
                    entry = max(current_price * 1.002, vwap)
                    tp1 = entry - (atr * 2.0)
                    tp2 = entry - (atr * 3.0)
                    tp3 = entry - (atr * 4.0)
                    stop_loss = entry + (atr * 1.5)
            
            return entry, [tp1, tp2, tp3], stop_loss
            
        except Exception as e:
            logger.error(f"Error calculating levels: {e}")
            # Fallback levels
            current_price = self.current_price or 105000
            return current_price, [current_price * 1.01, current_price * 1.02, current_price * 1.03], current_price * 0.99

    async def _get_atr(self, timeframe: str) -> float:
        """Calculate Average True Range"""
        try:
            if timeframe not in self.price_data:
                return 500  # Fallback ATR
                
            df = self.price_data[timeframe]
            high = df['high'].astype(float)
            low = df['low'].astype(float)
            close = df['close'].astype(float)
            
            tr1 = high - low
            tr2 = abs(high - close.shift(1))
            tr3 = abs(low - close.shift(1))
            
            true_range = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
            atr = true_range.rolling(window=14).mean().iloc[-1]
            
            return float(atr) if not pd.isna(atr) else 500
            
        except Exception as e:
            logger.error(f"Error calculating ATR: {e}")
            return 500

    async def _get_pivot_point(self, timeframe: str) -> Dict[str, float]:
        """Calculate pivot points"""
        try:
            if timeframe not in self.price_data:
                current_price = self.current_price or 105000
                return {
                    "p": current_price,
                    "r1": current_price * 1.005,
                    "s1": current_price * 0.995
                }
                
            df = self.price_data[timeframe]
            last_candle = df.iloc[-2]  # Previous completed candle
            
            high = float(last_candle['high'])
            low = float(last_candle['low'])
            close = float(last_candle['close'])
            
            pivot = (high + low + close) / 3
            r1 = (2 * pivot) - low
            s1 = (2 * pivot) - high
            
            return {"p": pivot, "r1": r1, "s1": s1}
            
        except Exception as e:
            logger.error(f"Error calculating pivot points: {e}")
            current_price = self.current_price or 105000
            return {
                "p": current_price,
                "r1": current_price * 1.005,
                "s1": current_price * 0.995
            }

    async def _calculate_vwap(self, timeframe: str) -> float:
        """Calculate Volume Weighted Average Price"""
        try:
            if timeframe not in self.price_data:
                return self.current_price or 105000
                
            df = self.price_data[timeframe]
            typical_price = (df['high'].astype(float) + df['low'].astype(float) + df['close'].astype(float)) / 3
            volume = df['volume'].astype(float)
            
            vwap = (typical_price * volume).sum() / volume.sum()
            return float(vwap)
            
        except Exception as e:
            logger.error(f"Error calculating VWAP: {e}")
            return self.current_price or 105000

    async def _get_market_regime(self) -> str:
        """Determine current market regime"""
        try:
            if '1h' not in self.price_data:
                return "neutral"
                
            df = self.price_data['1h']
            closes = df['close'].astype(float)
            
            # Simple trend detection using SMA
            sma20 = closes.rolling(window=20).mean()
            sma50 = closes.rolling(window=50).mean()
            
            current_price = closes.iloc[-1]
            sma20_current = sma20.iloc[-1]
            sma50_current = sma50.iloc[-1]
            
            if current_price > sma20_current > sma50_current:
                return "bullish"
            elif current_price < sma20_current < sma50_current:
                return "bearish"
            else:
                return "neutral"
                
        except Exception as e:
            logger.error(f"Error determining market regime: {e}")
            return "neutral"

    async def _get_volatility_index(self) -> float:
        """Calculate volatility index"""
        try:
            if '1h' not in self.price_data:
                return 0.02  # Default 2% volatility
                
            df = self.price_data['1h']
            returns = df['close'].astype(float).pct_change()
            volatility = returns.std() * np.sqrt(24)  # 24-hour volatility
            
            return float(volatility) if not pd.isna(volatility) else 0.02
            
        except Exception as e:
            logger.error(f"Error calculating volatility: {e}")
            return 0.02

    async def _determine_action(self, timeframe: str) -> str:
        """Determine trading action based on signals"""
        try:
            regime = await self._get_market_regime()
            
            # Simple logic - can be enhanced with more sophisticated analysis
            if regime == "bullish":
                return "BUY"
            elif regime == "bearish":
                return "SELL"
            else:
                return "HOLD"
                
        except Exception as e:
            logger.error(f"Error determining action: {e}")
            return "HOLD"

    async def _calculate_confidence(self, timeframe: str) -> float:
        """Calculate signal confidence"""
        try:
            regime = await self._get_market_regime()
            volatility = await self._get_volatility_index()
            
            # Base confidence on market regime clarity and volatility
            base_confidence = 60
            
            if regime in ["bullish", "bearish"]:
                base_confidence += 20
                
            # Adjust for volatility
            if volatility < 0.015:  # Low volatility
                base_confidence += 10
            elif volatility > 0.04:  # High volatility
                base_confidence -= 15
                
            # Timeframe adjustment
            if timeframe == "1h":
                base_confidence += 5
            elif timeframe == "5m":
                base_confidence -= 5
                
            return min(max(base_confidence, 30), 95)  # Cap between 30-95%
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {e}")
            return 60

    async def _calculate_position_size(self, timeframe: str, volatility: float) -> float:
        """Calculate recommended position size as percentage"""
        try:
            base_size = 2.0  # 2% base position
            
            # Adjust for volatility
            if volatility < 0.015:
                size_multiplier = 1.5
            elif volatility > 0.04:
                size_multiplier = 0.5
            else:
                size_multiplier = 1.0
                
            # Adjust for timeframe
            if timeframe == "5m":
                timeframe_multiplier = 0.5  # Smaller positions for scalping
            elif timeframe == "1h":
                timeframe_multiplier = 1.5  # Larger positions for swing
            else:
                timeframe_multiplier = 1.0
                
            position_size = base_size * size_multiplier * timeframe_multiplier
            return min(position_size, 5.0)  # Max 5% position
            
        except Exception as e:
            logger.error(f"Error calculating position size: {e}")
            return 2.0

    def _get_expiration_time(self, timeframe: str) -> timedelta:
        """Get signal expiration time"""
        if timeframe == "5m":
            return timedelta(minutes=15)
        elif timeframe == "15m":
            return timedelta(minutes=45)
        elif timeframe == "1h":
            return timedelta(hours=3)
        else:
            return timedelta(hours=1)

    async def _calculate_risk_reward(self, entry: float, take_profit: float, stop_loss: float) -> float:
        """Calculate risk-reward ratio"""
        try:
            risk = abs(entry - stop_loss)
            reward = abs(take_profit - entry)
            
            if risk == 0:
                return 0.0
                
            return round(reward / risk, 2)
            
        except Exception as e:
            logger.error(f"Error calculating risk-reward: {e}")
            return 1.0

    async def _get_key_triggers(self, timeframe: str) -> List[str]:
        """Get key market triggers to watch"""
        try:
            triggers = []
            
            # Price-based triggers
            if self.current_price:
                resistance = self.current_price * 1.02
                support = self.current_price * 0.98
                triggers.extend([
                    f"Watch resistance at ${resistance:,.2f}",
                    f"Watch support at ${support:,.2f}"
                ])
            
            # Volume-based triggers
            triggers.append("Monitor volume spike above average")
            
            # Time-based triggers
            if timeframe == "5m":
                triggers.append("Exit before next 15m candle close")
            elif timeframe == "15m":
                triggers.append("Re-evaluate at next 1h candle")
            elif timeframe == "1h":
                triggers.append("Review position at 4h close")
                
            return triggers
            
        except Exception as e:
            logger.error(f"Error getting key triggers: {e}")
            return ["Monitor price action", "Watch volume"]

    def _get_fallback_signal(self, timeframe: str) -> Dict:
        """Fallback signal when main calculation fails"""
        current_price = self.current_price or 105000
        
        return {
            "timeframe": timeframe,
            "action": "HOLD",
            "entry_price": current_price,
            "take_profit": [
                {"level": current_price * 1.01, "weight": 0.5},
                {"level": current_price * 1.02, "weight": 0.3},
                {"level": current_price * 1.03, "weight": 0.2}
            ],
            "stop_loss": current_price * 0.99,
            "position_size": 1.0,
            "confidence": 50,
            "expiration": (datetime.now() + self._get_expiration_time(timeframe)).isoformat(),
            "risk_reward": 1.0,
            "key_triggers": ["Market data unavailable", "Use manual analysis"],
            "market_context": {
                "regime": "unknown",
                "volatility": 0.02,
                "current_price": current_price
            }
        }

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose() 