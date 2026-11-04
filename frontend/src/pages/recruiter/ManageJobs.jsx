import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiOutlineUsers, HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import { useMyJobs, useUpdateJob } from '../../hooks/useJobs'

export default function ManageJobs() {
  const [search, setSearch] = useState('')
  const { data: jobs = [], isLoading, isError, error } = useMyJobs()
  const updateJob = useUpdateJob()

  const filtered = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Jobs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all your job listings.</p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary">Post New Job</Link>
      </div>

      <div className="flex items-center gap-3 glass-card px-4 py-3 mb-6">
        <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-300" />
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-slate-500">Loading your job listings…</p>}
        {isError && <p className="text-sm text-red-600">{error.message}</p>}
        {!isLoading && !isError && filtered.length === 0 && <div className="glass-card p-8 text-center text-sm text-slate-500">No job listings yet. Post your first job to start receiving applications.</div>}
        {filtered.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <Link to={`/jobs/${job.id}`} className="text-base font-semibold text-slate-900 dark:text-white hover:text-primary-600 transition-colors">{job.title}</Link>
                <p className="text-sm text-slate-500">{job.location}</p>
                <p className="text-xs text-slate-400 mt-1">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{job._count?.applications || 0}</p>
                <p className="text-xs text-slate-500">Applicants</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                job.status === 'ACTIVE' ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400' :
                job.status === 'DRAFT' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
              }`}>
                {job.status.toLowerCase()}
              </span>
              <div className="flex items-center gap-1">
                <Link to={`/recruiter/applicants/${job.id}`} className="btn-ghost p-2"><HiOutlineUsers className="w-4 h-4" /></Link>
                <select aria-label={`Change status for ${job.title}`} value={job.status} onChange={event => updateJob.mutate({ id: job.id, data: { status: event.target.value } })} className="input-field w-32 text-xs" disabled={updateJob.isPending}>
                  {['ACTIVE', 'DRAFT', 'CLOSED'].map(status => <option key={status} value={status}>{status.toLowerCase()}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
