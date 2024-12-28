'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { RepositoryInput } from '@/components/generate/RepositoryInput'
import { DateRangeSelector } from '@/components/generate/DateRangeSelector'

import { StatusMessage } from '@/components/generate/StatusMessage'
import { ChangelogResponse } from '@/types/changelog'

export default function GenerateChangelog() {
  const [repoUrl, setRepoUrl] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasBreakingChanges, setHasBreakingChanges] = useState(false)
  const [hasSecurityChanges, setHasSecurityChanges] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/generate-changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          repoUrl, 
          fromDate, 
          toDate,
          includeBreaking: hasBreakingChanges,
          includeSecurity: hasSecurityChanges
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate changelog')
      }

      const result: ChangelogResponse = await response.json()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <PageHeader 
        title="Generate Changelog"
        description="Create a comprehensive changelog for your repository by selecting a date range and customizing the output."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Generate Changelog' }
        ]}
      />
      
      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <RepositoryInput 
                repoUrl={repoUrl} 
                onChange={setRepoUrl} 
              />
              
              <DateRangeSelector
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
              />
              
            
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all
                    ${loading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98]'
                    }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Generating...</span>
                    </div>
                  ) : 'Generate Changelog'}
                </button>
              </div>
            </form>

            <StatusMessage error={error} success={success} />
          </div>
        </div>
      </div>
    </div>
  )
}

