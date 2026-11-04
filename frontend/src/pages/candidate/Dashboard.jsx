import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiOutlineBriefcase, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineArrowRight } from 'react-icons/hi2'
import StatCard from '../../components/ui/StatCard'
import { useApplications } from '../../hooks/useApplications'
import { useProfile } from '../../hooks/useProfile'

const statuses = [
  ['PENDING', 'Applied', 'bg-amber-500'],
  ['REVIEWING', 'Under Review', 'bg-blue-500'],
  ['SHORTLISTED', 'Shortlisted', 'bg-primary-500'],
  ['INTERVIEW', 'Interview', 'bg-secondary-500'],
  ['OFFERED', 'Offered', 'bg-green-500'],
  ['HIRED', 'Hired', 'bg-emerald-500'],
  ['REJECTED', 'Rejected', 'bg-red-500'],
]

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date))
}

export default function CandidateDashboard() {
  const { data: applications = [], isLoading, isError, error } = useApplications()
  const { data: profile } = useProfile()
  const displayName = profile?.firstName || profile?.lastName || 'there'
  const counts = statuses.reduce((result, [status]) => ({ ...result, [status]: applications.filter((application) => application.status === status).length }), {})
  const upcomingInterviews = applications.flatMap((application) => (application.interviews || []).map((interview) => ({ ...interview, application })))
    .filter((interview) => new Date(interview.date) >= new Date() && !['CANCELLED', 'COMPLETED'].includes(interview.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  const funnelMax = Math.max(...statuses.map(([status]) => counts[status]), 1)

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Hello, {displayName}!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Your application activity and hiring progress.</p>
      </motion.div>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading your dashboard...</p>}
      {isError && <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>}

      {!isLoading && !isError && applications.length === 0 && (
        <div className="glass-card p-10 text-center">
          <HiOutlineBriefcase className="w-12 h-12 mx-auto text-slate-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Start your job search</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Apply for a job to see your application activity here.</p>
          <Link to="/dashboard/jobs" className="btn-primary inline-block mt-6">Browse Jobs</Link>
        </div>
      )}

      {!isLoading && !isError && applications.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard icon={HiOutlineDocumentText} label="Applications Submitted" value={applications.length} trend="All time" color="primary" />
            <StatCard icon={HiOutlineCalendar} label="Upcoming Interviews" value={upcomingInterviews.length} trend="Scheduled interviews" color="secondary" />
            <StatCard icon={HiOutlineBriefcase} label="Active Applications" value={applications.filter((application) => !['REJECTED', 'HIRED'].includes(application.status)).length} trend="In progress" color="amber" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Application Progress</h2>
                <Link to="/dashboard/applications" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">View All <HiOutlineArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="space-y-4">
                {statuses.map(([status, label, color]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200"><span className={`w-2.5 h-2.5 rounded-full ${color}`} />{label}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{counts[status]}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${(counts[status] / funnelMax) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Applications</h2>
                <Link to="/dashboard/applications" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">View All <HiOutlineArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center text-white text-xs font-bold">{application.job?.company?.name?.[0] || '?'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{application.job?.title || 'Job title unavailable'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{application.job?.company?.name || 'Company unavailable'} · {formatDate(application.createdAt)}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">{application.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
