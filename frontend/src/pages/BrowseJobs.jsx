import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineMagnifyingGlass, HiOutlineAdjustmentsHorizontal, HiOutlineFunnel, HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2'
import JobCard from '../components/ui/JobCard'
import { JobCardSkeleton } from '../components/ui/Skeleton'
import { JOB_TYPES, EXPERIENCE_LEVELS, WORK_MODES, SALARY_RANGES } from '../utils/constants'
import { useExternalJobs, useInternshipOpportunities, useJobs } from '../hooks/useJobs'
import { useSavedJobs, useToggleSaveJob } from '../hooks/useSavedJobs'
import { useAuth } from '../context/AuthProvider'

const mapArbeitnowJob = (job) => ({
  id: job.slug,
  slug: job.slug,
  title: job.title,
  companyName: job.company_name,
  companyLogo: job.company_logo || null,
  companyId: job.slug,
  location: job.location || 'Remote',
  salary: job.salary || '',
  employmentType: job.job_types?.[0] || 'Full-time',
  experience: '',
  workMode: job.remote ? 'Remote' : 'On-site',
  skills: job.tags || [],
  createdAt: new Date(job.created_at * 1000).toISOString(),
  url: job.url,
  description: job.description,
})

const mapInternship = (opportunity) => ({
  id: opportunity.id,
  title: opportunity.title,
  companyName: opportunity.company,
  companyLogo: null,
  companyId: opportunity.id,
  location: opportunity.location,
  salary: opportunity.stipend,
  employmentType: opportunity.type,
  experience: '',
  workMode: opportunity.mode,
  skills: opportunity.skills || [],
  createdAt: opportunity.deadline || new Date().toISOString(),
  description: opportunity.description,
  detailsPath: '/dashboard/jobs',
})

export default function BrowseJobs({ source = 'all' }) {
  const { isSignedIn } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    employmentType: [],
    experience: [],
    workMode: [],
    salaryRange: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [debouncedLocation, setDebouncedLocation] = useState(location)
  const jobsPerPage = 6

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLocation(location), 300)
    return () => clearTimeout(t)
  }, [location])

  const apiParams = useMemo(() => {
    const p = {}
    if (debouncedQuery) p.search = debouncedQuery
    if (debouncedLocation) p.location = debouncedLocation
    return p
  }, [debouncedQuery, debouncedLocation])

  const { data, isLoading, isError, error } = useExternalJobs(apiParams, { enabled: source !== 'hirenexa' })
  const { data: employerJobsData, isLoading: employerJobsLoading } = useJobs({ search: debouncedQuery, location: debouncedLocation, limit: 50 }, { enabled: source !== 'live' })
  const { data: internshipData = [], isLoading: internshipsLoading } = useInternshipOpportunities({ enabled: source === 'all' })
  const { data: savedJobs = [] } = useSavedJobs({ enabled: Boolean(isSignedIn) })
  const toggleSave = useToggleSaveJob()
  const savedIds = new Set(savedJobs.map((savedJob) => savedJob.jobId || savedJob.job?.id))
  const allJobs = [
    ...(source !== 'live' ? employerJobsData?.jobs || [] : []).map(job => ({
      id: job.id,
      title: job.title,
      companyName: job.company?.name || 'Company',
      companyLogo: job.company?.logo,
      companyId: job.company?.id,
      location: job.location,
      salary: job.salaryMin ? `${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()}${job.salaryMax ? `–${job.salaryMax.toLocaleString()}` : '+'}` : '',
      employmentType: job.employmentType,
      experience: job.experienceLevel,
      workMode: job.workMode,
      skills: job.skills || [],
      createdAt: job.createdAt,
      isEmployerJob: true,
      detailsPath: source === 'hirenexa' ? `/jobs/${job.id}?source=hirenexa` : undefined,
    })),
    ...(source !== 'hirenexa' ? data?.data || [] : []).map(job => ({
      ...mapArbeitnowJob(job),
      detailsPath: source === 'live' ? `/jobs/${job.slug}?source=live` : undefined,
    })),
  ]
  const allOpportunities = source === 'all' ? internshipData.map(mapInternship) : []

  const handleSearch = (e) => {
    e.preventDefault()
    setDebouncedQuery(query)
    setDebouncedLocation(location)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (location) params.set('location', location)
    setSearchParams(params)
    setCurrentPage(1)
  }

  const toggleFilter = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value],
    }))
    setCurrentPage(1)
  }

  const filteredJobs = [...allJobs, ...allOpportunities].filter(job => {
    const searchText = `${job.title} ${job.companyName} ${job.location} ${(job.skills || []).join(' ')}`.toLowerCase()
    const searchTerm = query.trim().toLowerCase()
    if (searchTerm && !searchText.includes(searchTerm)) return false

    if (filters.employmentType.length) {
      const match = filters.employmentType.some(t => job.employmentType.toLowerCase().includes(t.toLowerCase()))
      if (!match) return false
    }
    if (filters.workMode.length && !filters.workMode.includes(job.workMode)) return false
    if (filters.experience.length && !filters.experience.includes(job.experience)) return false
    if (filters.salaryRange) {
      const [min, max] = filters.salaryRange.split('-').map(s => parseInt(s.replace(/[^0-9]/g, '')))
      if (min && job.salary) {
        const jobMin = parseInt(job.salary.replace(/[^0-9]/g, ''))
        if (isNaN(jobMin)) return false
        if (jobMin < min) return false
        if (max && jobMin > max) return false
      }
    }
    return true
  })

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)

  return (
    <div className="min-h-screen">
      <section className="py-12 bg-gradient-to-br from-primary-500/5 to-secondary-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Browse <span className="gradient-text">{source === 'live' ? 'Live Jobs' : source === 'hirenexa' ? 'HireNexa Jobs' : 'Jobs'}</span>
            </h1>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 glass-card px-4 py-3">
                <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Job title, skill, or company"
                  className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-300"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 glass-card px-4 py-3">
                <HiOutlineAdjustmentsHorizontal className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Location or remote"
                  className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-300"
                />
              </div>
              <button type="submit" className="btn-primary px-8">Search</button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary px-4 ${showFilters ? 'bg-primary-50 border-primary-300 dark:bg-primary-500/10' : ''}`}
              >
                <HiOutlineFunnel className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: showFilters ? 1 : 0, x: showFilters ? 0 : -20 }}
              className={`${showFilters ? 'w-64 shrink-0' : 'w-0 overflow-hidden'} transition-all duration-300 hidden lg:block`}
            >
              <div className="space-y-6 sticky top-24">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Employment Type</h3>
                  <div className="space-y-2">
                    {JOB_TYPES.map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.employmentType.includes(type)}
                          onChange={() => toggleFilter('employmentType', type)}
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Experience Level</h3>
                  <div className="space-y-2">
                    {EXPERIENCE_LEVELS.map(level => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.experience.includes(level)}
                          onChange={() => toggleFilter('experience', level)}
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Work Mode</h3>
                  <div className="space-y-2">
                    {WORK_MODES.map(mode => (
                      <label key={mode} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.workMode.includes(mode)}
                          onChange={() => toggleFilter('workMode', mode)}
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{mode}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Salary Range</h3>
                  <div className="space-y-2">
                    {SALARY_RANGES.map(range => (
                      <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="salary"
                          checked={filters.salaryRange === range.label}
                          onChange={() => setFilters(prev => ({ ...prev, salaryRange: range.label }))}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { setFilters({ employmentType: [], experience: [], workMode: [], salaryRange: '' }); setCurrentPage(1) }}
                  className="btn-ghost text-sm text-primary-600 dark:text-primary-400 w-full"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing <span className="font-medium text-slate-900 dark:text-white">{filteredJobs.length}</span> {source === 'live' ? 'Arbeitnow jobs' : source === 'hirenexa' ? 'HireNexa jobs' : 'jobs and internships'}
                </p>
              </div>

              {isError ? (
                <div className="text-center py-20">
                  <HiOutlineExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Failed to load jobs</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{error?.response?.data?.error || error?.message || 'Something went wrong'}</p>
                  <button onClick={() => window.location.reload()} className="btn-primary px-6 py-2 text-sm">Retry</button>
                </div>
              ) : (source !== 'hirenexa' && isLoading) || (source === 'all' && internshipsLoading) || (source !== 'live' && employerJobsLoading) ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <JobCardSkeleton key={i} />)}
                </div>
              ) : paginatedJobs.length === 0 ? (
                <div className="text-center py-20">
                  <HiOutlineMagnifyingGlass className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No jobs found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedJobs.map((job, i) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedIds.has(job.id)}
                      onSave={job.isEmployerJob ? (jobId) => toggleSave.mutate(jobId) : undefined}
                      index={i}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-ghost px-4 py-2 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        currentPage === i + 1
                          ? 'bg-primary-500 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-ghost px-4 py-2 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowFilters(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 p-6 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="btn-ghost p-2">
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>
            {/* Mobile filters - same content as desktop sidebar */}
          </motion.div>
        </div>
      )}
    </div>
  )
}
