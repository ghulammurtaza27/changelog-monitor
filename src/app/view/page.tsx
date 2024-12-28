'use client'

import { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ChangeModal } from '@/components/changelog/ChangeModal'
import { SearchFilters } from '@/components/changelog/SearchFilters'
import { ChangelogContent } from '@/components/changelog/ChangelogContent'


export default function ViewChangelogs() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedChange, setSelectedChange] = useState<Change | null>(null)
  const [selectedRepoUrl, setSelectedRepoUrl] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')

  useEffect(() => {
    async function fetchChangelogs() {
      try {
        const response = await fetch('/api/changelogs')
        if (!response.ok) {
          throw new Error('Failed to fetch changelogs')
        }
        const data = await response.json()
        setChangelogs(data.data || [])
      } catch (error) {
        console.error('Error fetching changelogs:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchChangelogs()
  }, [])

  const filteredChangelogs = useMemo(() => {
    if (!searchTerm && filterType === 'ALL') {
      return changelogs; // Return all changelogs if no filters active
    }

    return changelogs.map(changelog => ({
      ...changelog,
      changes: changelog.changes.filter(change => {
        const matchesSearch = !searchTerm || 
          change.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          change.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          change.type.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterType === 'ALL' || change.type === filterType;

        return matchesSearch && matchesFilter;
      })
    })).filter(changelog => changelog.changes.length > 0);
  }, [changelogs, searchTerm, filterType]);

  const handleChangeSelect = (change: Change, repoUrl: string) => {
    setSelectedChange(change);
    setSelectedRepoUrl(repoUrl);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <PageHeader 
        title="Changelog"
        description="Track all API changes, updates, and improvements across our services."
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Developer tools' }
        ]}
      />

      <div className="container mx-auto px-6 max-w-5xl py-8">
        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterType={filterType}
          onFilterChange={setFilterType}
        />

        <div className="space-y-12 mt-8">
          {filteredChangelogs.map(changelog => (
            <div key={changelog.id}>
              <ChangelogContent
                changes={changelog.changes}
                repoUrl={changelog.repoUrl}
                onChangeSelect={handleChangeSelect}
              />
            </div>
          ))}
        </div>

        {selectedChange && (
          <ChangeModal
            change={selectedChange}
            repoUrl={selectedRepoUrl}
            onClose={() => {
              setSelectedChange(null);
              setSelectedRepoUrl('');
            }}
          />
        )}
      </div>
    </div>
  );
}

