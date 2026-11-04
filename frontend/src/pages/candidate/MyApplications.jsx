import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineMagnifyingGlass, HiOutlineBriefcase } from 'react-icons/hi2'
import { useApplications } from '../../hooks/useApplications'

const statusLabels = {
  PENDING: 'Applied',
  REVIEWING: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFERED: 'Offered',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
}

const statusColors = {
  PENDING: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  REVIEWING: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  SHORTLISTED: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
  INTERVIEW: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400',
  OFFERED: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  HIRED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  REJECTED: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date))
}

export default function MyApplications() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const { data: applications = [], isLoading, isError, error } = useApplications()

  const filtered = useMemo(() => applications.filter((application) => {
    const title = application.job?.title || ''
    const company = application.job?.company?.name || ''
    return (!search || `${title} ${company}`.toLowerCase().includes(search.toLowerCase()))
      && (!filter || application.status === filter)
  }), [applications, filter, search])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">My Applications</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Track all your job applications in one place.</p>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading your applications...</p>}
      {isError && <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>}

      {!isLoading && !isError && applications.length === 0 && (
        <div className="glass-card p-10 text-center">
          <HiOutlineBriefcase className="w-12 h-12 mx-auto text-slate-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No applications yet</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your applications will appear here after you apply for a job.</p>
          <Link to="/dashboard/jobs" className="btn-primary inline-block mt-6">Browse Jobs</Link>
        </div>
      )}

      {!isLoading && !isError && applications.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 flex items-center gap-3 glass-card px-4 py-3">
              <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
              <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applications..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-300" />
            </div>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="input-field w-auto">
              <option value="">All Statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No applications match your search.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((application, index) => {
                const company = application.job?.company
                const status = application.status
                return (
                  <motion.div key={application.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-card p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center shrink-0">
                        {company?.logo ? <img src={company.logo} alt="" className="w-full h-full rounded-xl object-cover" /> : <span className="font-bold gradient-text">{company?.name?.[0] || '?'}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{application.job?.title || 'Job title unavailable'}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{company?.name || 'Company unavailable'} · {application.job?.location || 'Location unavailable'}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Applied {formatDate(application.createdAt)}</p>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${statusColors[status] || statusColors.PENDING}`}>
                        {statusLabels[status] || status}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
