#!/usr/bin/env python3

import asyncio
import httpx
import json
import sys
from datetime import datetime
from typing import Dict, List, Any

# API Configuration
API_BASE_URL = "http://localhost:8000"
AUTH_BASE_URL = "http://localhost:8001"

class APIVerifier:
    def __init__(self):
        self.results = {}
        self.auth_token = None
        
    async def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("🔐 Testing Authentication Endpoints...")
        
        auth_endpoints = [
            ("POST", f"{AUTH_BASE_URL}/api/auth/login", {
                "username": "midoo_ragab",
                "password": "07091998"
            }),
        ]
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            for method, url, data in auth_endpoints:
                try:
                    if method == "POST":
                        response = await client.post(url, json=data)
                    else:
                        response = await client.get(url)
                    
                    endpoint_name = url.split("/")[-1]
                    self.results[f"auth_{endpoint_name}"] = {
                        "status": response.status_code,
                        "success": response.status_code == 200,
                        "response_size": len(response.content)
                    }
                    
                    if endpoint_name == "login" and response.status_code == 200:
                        token_data = response.json()
                        self.auth_token = token_data.get("access_token")
                        print(f"  ✅ Login successful - Token obtained")
                    
                    print(f"  {'✅' if response.status_code == 200 else '❌'} {method} {endpoint_name}: {response.status_code}")
                    
                except Exception as e:
                    self.results[f"auth_{endpoint_name}"] = {
                        "status": "ERROR",
                        "success": False,
                        "error": str(e)
                    }
                    print(f"  ❌ {method} {endpoint_name}: ERROR - {e}")

    async def test_main_endpoints(self):
        """Test all main API endpoints"""
        print("\n🚀 Testing Main API Endpoints...")
        
        # Core endpoints that frontend uses
        endpoints = [
            # System & Health
            ("GET", "/"),
            ("GET", "/health"),
            ("GET", "/api/bitcoin/price"),
            
            # Elite Analytics (Main Dashboard)
            ("GET", "/api/bitcoin/elite-analytics"),
            ("GET", "/api/bitcoin/comprehensive-analysis"),
            ("GET", "/api/bitcoin/halving-cycle"),
            
            # Market Analysis
            ("GET", "/api/bitcoin/market-regime"),
            ("GET", "/api/bitcoin/order-flow"),
            ("GET", "/api/bitcoin/whale-prediction"),
            ("GET", "/api/bitcoin/miner-capitulation"),
            
            # On-Chain Analytics
            ("GET", "/api/bitcoin/features"),
            ("GET", "/api/bitcoin/hodl-waves"),
            ("GET", "/api/bitcoin/dominance"),
            ("GET", "/api/bitcoin/lightning-network"),
            ("GET", "/api/bitcoin/compliance"),
            
            # Trading Signals
            ("GET", "/api/signals/multi-timeframe"),
            ("GET", "/api/signals/quick-action"),
            ("GET", "/api/signals/timeframe/15m"),
            
            # AI Precision Trading (Most Important)
            ("GET", "/api/trading/ai-precision/15m"),
            ("GET", "/api/trading/ai-precision/5m"),
            ("GET", "/api/trading/ai-precision/1h"),
            ("GET", "/api/trading/ai-insights"),
            
            # Enhanced Precision Trading
            ("GET", "/api/trading/precision-signal/15m"),
            ("GET", "/api/trading/enhanced-precision/15m"),
            
            # Database endpoints
            ("GET", "/api/database/signals/recent"),
            ("GET", "/api/database/performance/stats"),
            ("GET", "/api/database/ai/training-stats"),
        ]
        
        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            for method, endpoint in endpoints:
                try:
                    url = f"{API_BASE_URL}{endpoint}"
                    response = await client.get(url, headers=headers)
                    
                    endpoint_name = endpoint.replace("/api/", "").replace("/", "_")
                    self.results[endpoint_name] = {
                        "status": response.status_code,
                        "success": response.status_code == 200,
                        "response_size": len(response.content),
                        "endpoint": endpoint
                    }
                    
                    # Check if response contains data
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            has_data = bool(data and (isinstance(data, dict) or isinstance(data, list)))
                            self.results[endpoint_name]["has_data"] = has_data
                        except:
                            self.results[endpoint_name]["has_data"] = False
                    
                    status_icon = "✅" if response.status_code == 200 else "❌"
                    print(f"  {status_icon} {endpoint}: {response.status_code}")
                    
                except Exception as e:
                    endpoint_name = endpoint.replace("/api/", "").replace("/", "_")
                    self.results[endpoint_name] = {
                        "status": "ERROR",
                        "success": False,
                        "error": str(e),
                        "endpoint": endpoint
                    }
                    print(f"  ❌ {endpoint}: ERROR - {e}")

    def analyze_frontend_coverage(self):
        """Analyze which endpoints are used by frontend"""
        print("\n📊 Frontend API Coverage Analysis...")
        
        # Read the frontend API service file
        try:
            with open("btc_assistant/frontend/src/services/api.js", "r") as f:
                api_content = f.read()
            
            # Extract API calls from frontend
            frontend_endpoints = []
            lines = api_content.split('\n')
            for line in lines:
                if 'api.get(' in line and '/api/' in line:
                    # Extract endpoint from line like: getEliteAnalytics: () => api.get('/api/bitcoin/elite-analytics'),
                    start = line.find("'/api/")
                    if start != -1:
                        end = line.find("'", start + 1)
                        if end != -1:
                            endpoint = line[start+1:end]
                            frontend_endpoints.append(endpoint)
            
            print(f"  📱 Frontend uses {len(set(frontend_endpoints))} unique endpoints")
            
            # Check coverage
            covered_endpoints = []
            missing_endpoints = []
            
            for endpoint in set(frontend_endpoints):
                endpoint_key = endpoint.replace("/api/", "").replace("/", "_")
                if endpoint_key in self.results and self.results[endpoint_key]["success"]:
                    covered_endpoints.append(endpoint)
                else:
                    missing_endpoints.append(endpoint)
            
            print(f"  ✅ Working endpoints: {len(covered_endpoints)}")
            print(f"  ❌ Missing/broken endpoints: {len(missing_endpoints)}")
            
            if missing_endpoints:
                print("\n  🔍 Missing/Broken Endpoints:")
                for endpoint in missing_endpoints:
                    print(f"    - {endpoint}")
                    
        except Exception as e:
            print(f"  ❌ Could not analyze frontend coverage: {e}")

    def generate_report(self):
        """Generate comprehensive report"""
        print("\n" + "="*60)
        print("📋 API VERIFICATION REPORT")
        print("="*60)
        
        total_endpoints = len(self.results)
        successful_endpoints = sum(1 for r in self.results.values() if r["success"])
        
        print(f"📊 Total Endpoints Tested: {total_endpoints}")
        print(f"✅ Successful: {successful_endpoints}")
        print(f"❌ Failed: {total_endpoints - successful_endpoints}")
        print(f"📈 Success Rate: {(successful_endpoints/total_endpoints)*100:.1f}%")
        
        # Critical endpoints check
        critical_endpoints = [
            "bitcoin_elite-analytics",
            "signals_multi-timeframe", 
            "trading_ai-precision_15m",
            "bitcoin_price"
        ]
        
        print(f"\n🎯 Critical Endpoints Status:")
        for endpoint in critical_endpoints:
            if endpoint in self.results:
                status = "✅ Working" if self.results[endpoint]["success"] else "❌ Failed"
                print(f"  {endpoint}: {status}")
        
        # Save detailed report
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total": total_endpoints,
                "successful": successful_endpoints,
                "failed": total_endpoints - successful_endpoints,
                "success_rate": (successful_endpoints/total_endpoints)*100
            },
            "endpoints": self.results
        }
        
        with open("api_verification_report.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n💾 Detailed report saved to: api_verification_report.json")

async def main():
    """Main verification function"""
    print("🔍 Bitcoin Trading AI - API Endpoint Verification")
    print("="*60)
    
    verifier = APIVerifier()
    
    # Test authentication first
    await verifier.test_auth_endpoints()
    
    # Test main endpoints
    await verifier.test_main_endpoints()
    
    # Analyze frontend coverage
    verifier.analyze_frontend_coverage()
    
    # Generate report
    verifier.generate_report()
    
    # Return success status
    total = len(verifier.results)
    successful = sum(1 for r in verifier.results.values() if r["success"])
    success_rate = (successful/total)*100 if total > 0 else 0
    
    if success_rate >= 90:
        print(f"\n🎉 EXCELLENT! API is ready for deployment ({success_rate:.1f}% success rate)")
        return 0
    elif success_rate >= 75:
        print(f"\n⚠️  GOOD but needs attention ({success_rate:.1f}% success rate)")
        return 1
    else:
        print(f"\n❌ NEEDS WORK before deployment ({success_rate:.1f}% success rate)")
        return 2

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⏹️  Verification cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Verification failed: {e}")
        sys.exit(1) 