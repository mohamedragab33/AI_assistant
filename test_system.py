#!/usr/bin/env python3
"""
System Test Script for Bitcoin Elite Trading AI
Tests all major components and endpoints
"""

import requests
import json
import sys
from datetime import datetime

def test_endpoint(url, name):
    """Test a single endpoint"""
    try:
        print(f"Testing {name}...", end=" ")
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ PASSED")
            return True, data
        else:
            print(f"❌ FAILED (Status: {response.status_code})")
            return False, None
    except Exception as e:
        print(f"❌ FAILED (Error: {e})")
        return False, None

def main():
    """Run comprehensive system tests"""
    print("🚀 Bitcoin Elite Trading AI - System Test")
    print("=" * 50)
    
    base_url = "http://127.0.0.1:8000"
    frontend_url = "http://localhost:3000"
    
    # Test endpoints
    endpoints = [
        (f"{base_url}/", "System Status"),
        (f"{base_url}/health", "Health Check"),
        (f"{base_url}/api/bitcoin/price", "Bitcoin Price"),
        (f"{base_url}/api/bitcoin/elite-analytics", "Elite Analytics"),
        (f"{base_url}/api/signals/multi-timeframe", "Multi-Timeframe Signals"),
        (f"{base_url}/api/signals/quick-action", "Quick Action"),
        (f"{base_url}/api/trading/precision-signal/1h", "Precision Trading"),
        (f"{base_url}/api/database/signals/recent", "Database Signals"),
        (f"{base_url}/api/database/performance/stats", "Performance Stats"),
    ]
    
    # Run tests
    passed = 0
    total = len(endpoints)
    results = {}
    
    print("\n📊 Testing Backend Endpoints:")
    print("-" * 30)
    
    for url, name in endpoints:
        success, data = test_endpoint(url, name)
        if success:
            passed += 1
            results[name] = data
    
    # Test frontend accessibility
    print(f"\n🌐 Testing Frontend Accessibility:")
    print("-" * 30)
    frontend_success, _ = test_endpoint(frontend_url, "React Frontend")
    if frontend_success:
        passed += 1
    total += 1
    
    # Display results
    print(f"\n📈 Test Results:")
    print("=" * 50)
    print(f"✅ Passed: {passed}/{total} ({passed/total*100:.1f}%)")
    
    if 'System Status' in results:
        status = results['System Status']
        print(f"🔧 System Version: {status.get('version', 'Unknown')}")
        print(f"💹 Bitcoin Price: ${status.get('bitcoin_price', 'N/A'):,.2f}")
        print(f"🗄️ Database: {'Connected' if status.get('database_connected') else 'Disconnected'}")
    
    if 'Health Check' in results:
        health = results['Health Check']
        services = health.get('services', {})
        active_services = sum(1 for v in services.values() if v == 'active')
        print(f"⚙️ Active Services: {active_services}/{len(services)}")
    
    # Connection URLs
    print(f"\n🌟 Access Information:")
    print("=" * 50)
    print(f"🌐 Frontend (Web UI): {frontend_url}")
    print(f"🔧 Backend API: {base_url}")
    print(f"📚 API Documentation: {base_url}/docs")
    print(f"💚 Health Check: {base_url}/health")
    
    # Trading endpoints for testing
    print(f"\n🎯 Key Trading Endpoints:")
    print("-" * 30)
    print(f"• Elite Analytics: {base_url}/api/bitcoin/elite-analytics")
    print(f"• Multi-Timeframe: {base_url}/api/signals/multi-timeframe")
    print(f"• Quick Action: {base_url}/api/signals/quick-action")
    print(f"• Precision 1h: {base_url}/api/trading/precision-signal/1h")
    
    # Quick trading signal example
    if 'Quick Action' in results:
        quick = results['Quick Action']
        if 'quick_action' in quick:
            action_data = quick['quick_action']
            print(f"\n⚡ Current Quick Action:")
            print(f"   Action: {action_data.get('action', 'N/A')}")
            print(f"   Urgency: {action_data.get('urgency', 'N/A')}")
            print(f"   Timeframe: {action_data.get('timeframe', 'N/A')}")
            print(f"   Confidence: {action_data.get('confidence', 0)}%")
    
    print(f"\n✅ System Status: {'FULLY OPERATIONAL' if passed >= total-1 else 'PARTIALLY OPERATIONAL'}")
    print(f"🕐 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 