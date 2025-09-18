"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { checkCoachAuth } from "@/lib/coachAuth"

export default function TestCoachAuth() {
  const [authResult, setAuthResult] = useState<any>(null)
  const [apiTestResult, setApiTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check authentication on page load
    const result = checkCoachAuth()
    setAuthResult(result)
  }, [])

  const testAPI = async () => {
    if (!authResult?.isAuthenticated || !authResult?.token || !authResult?.coach?.id) {
      alert("Not authenticated or missing data")
      return
    }

    setLoading(true)

    // Debug the token before sending
    console.log("🔍 Testing API with token:", {
      tokenLength: authResult.token.length,
      tokenStart: authResult.token.substring(0, 30),
      coachId: authResult.coach.id,
      headers: {
        'Authorization': `Bearer ${authResult.token.substring(0, 30)}...`,
        'Content-Type': 'application/json'
      }
    })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coaches/${authResult.coach.id}/courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authResult.token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: null as any
      }

      if (response.ok) {
        result.body = await response.json()
      } else {
        try {
          result.body = await response.json()
        } catch (e) {
          result.body = await response.text()
        }
      }

      setApiTestResult(result)
    } catch (error) {
      setApiTestResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const clearStorage = () => {
    localStorage.clear()
    setAuthResult(null)
    setApiTestResult(null)
  }

  const testWithWorkingToken = async () => {
    // Create a token that we know works (based on backend test)
    const workingTokenData = {
      sub: "b6c5cc5f-be8d-47b2-aa95-3c1cdcb72a0d",
      email: "pittisunilkumar3@gmail.com",
      role: "coach",
      coach_id: "b6c5cc5f-be8d-47b2-aa95-3c1cdcb72a0d",
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
    }

    // This is a mock token for testing - in real scenario it would be created by backend
    console.log("🧪 Testing with known working token structure:", workingTokenData)

    setLoading(true)
    try {
      // Test with the known coach ID
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coaches/b6c5cc5f-be8d-47b2-aa95-3c1cdcb72a0d/courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      })

      const result = {
        status: response.status,
        statusText: response.statusText,
        body: null as any,
        note: "Testing with stored token"
      }

      if (response.ok) {
        result.body = await response.json()
      } else {
        try {
          result.body = await response.json()
        } catch (e) {
          result.body = await response.text()
        }
      }

      setApiTestResult(result)
    } catch (error) {
      setApiTestResult({ error: error.message, note: "Testing with stored token" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Coach Authentication Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(authResult, null, 2)}
            </pre>
            <div className="mt-4 space-x-2">
              <Button onClick={() => setAuthResult(checkCoachAuth())}>
                Refresh Auth
              </Button>
              <Button variant="destructive" onClick={clearStorage}>
                Clear Storage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Test */}
        <Card>
          <CardHeader>
            <CardTitle>API Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(apiTestResult, null, 2)}
            </pre>
            <div className="mt-4 space-x-2">
              <Button
                onClick={testAPI}
                disabled={loading || !authResult?.isAuthenticated}
              >
                {loading ? "Testing..." : "Test API Call"}
              </Button>
              <Button
                onClick={testWithWorkingToken}
                disabled={loading}
                variant="outline"
              >
                Test with Stored Token
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* localStorage Contents */}
      <Card>
        <CardHeader>
          <CardTitle>localStorage Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>access_token:</strong> {localStorage.getItem("access_token")?.substring(0, 50) + "..." || "Not found"}</div>
            <div><strong>token:</strong> {localStorage.getItem("token")?.substring(0, 50) + "..." || "Not found"}</div>
            <div><strong>coach:</strong> {localStorage.getItem("coach") ? "Present" : "Not found"}</div>
            <div><strong>token_expiration:</strong> {localStorage.getItem("token_expiration") || "Not found"}</div>
            <div><strong>auth_data:</strong> {localStorage.getItem("auth_data") ? "Present" : "Not found"}</div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="space-x-2">
        <Button onClick={() => window.location.href = "/coach/login"}>
          Go to Coach Login
        </Button>
        <Button onClick={() => window.location.href = "/coach-dashboard"}>
          Go to Coach Dashboard
        </Button>
      </div>
    </div>
  )
}
