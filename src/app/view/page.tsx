'use client'

import { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ChangeModal } from '@/components/changelog/ChangeModal'
import { SearchFilters } from '@/components/changelog/SearchFilters'
import { ChangelogContent } from '@/components/changelog/ChangelogContent'
import { Changelog, Change } from '@/types/changelog'


export default function ViewChangelogs() {
  const [changelogs, setChangelogs] = useState<Changelog[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedChange, setSelectedChange] = useState<Change | null>(null)
  const [selectedRepoUrl, setSelectedRepoUrl] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month', 'quarter'
  const [groupBy, setGroupBy] = useState('date'); // 'date', 'type', 'author'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid'
  const [selectedRepo, setSelectedRepo] = useState('all');

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

  const handleChangeSelect = (change: Partial<Change>, repoUrl: string) => {
    setSelectedChange(change as Change);
    setSelectedRepoUrl(repoUrl);
  };

  const stats = useMemo(() => {
    return {
      total: changelogs.reduce((acc, cl) => acc + cl.changes.length, 0),
      breaking: changelogs.reduce((acc, cl) => 
        acc + cl.changes.filter(c => c.type === 'BREAKING').length, 0),
      features: changelogs.reduce((acc, cl) => 
        acc + cl.changes.filter(c => c.type === 'FEATURE').length, 0),
      fixes: changelogs.reduce((acc, cl) => 
        acc + cl.changes.filter(c => c.type === 'BUGFIX').length, 0),
    };
  }, [changelogs]);

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
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-gray-500">Total Changes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">{stats.breaking}</div>
            <div className="text-gray-500">Breaking Changes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.features}</div>
            <div className="text-gray-500">New Features</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.fixes}</div>
            <div className="text-gray-500">Bug Fixes</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
         
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            >
              Grid
            </button>
          </div>
        </div>

        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterType={filterType}
          onFilterChange={setFilterType}
        />

        <div className={`space-y-12 mt-8 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-6 space-y-0' : ''}`}>
          {filteredChangelogs.map(changelog => (
            <div key={changelog.id}>
              <ChangelogContent
                changes={changelog.changes}
                repoUrl={changelog.repoUrl}
                onChangeSelect={handleChangeSelect}
                viewMode={viewMode}
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

