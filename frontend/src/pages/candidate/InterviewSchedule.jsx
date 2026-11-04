import { motion } from 'framer-motion'
import { HiOutlineCalendar, HiOutlineVideoCamera, HiOutlineMapPin, HiOutlineClock, HiOutlineCheckBadge, HiOutlineXMark } from 'react-icons/hi2'
import { useInterviews, useUpdateInterviewStatus } from '../../hooks/useInterviews'

export default function InterviewSchedule() {
  const { data: interviews = [], isLoading, isError } = useInterviews()
  const updateStatus = useUpdateInterviewStatus()

  if (isLoading) return <p className="text-sm text-slate-500 dark:text-slate-400">Loading interviews...</p>
  if (isError) return <p className="text-sm text-rose-600 dark:text-rose-400">Unable to load your interviews.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Interview Schedule</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your upcoming interviews.</p>

      <div className="space-y-4">
        {interviews.length === 0 ? (
          <div className="glass-card p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No interviews have been scheduled yet.
          </div>
        ) : interviews.map((interview, i) => {
          const job = interview.application?.job
          const company = job?.company
          const date = new Date(interview.date)
          return (
          <motion.div
            key={interview.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{job?.title || interview.title || 'Interview'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{company?.name || 'Company'}</p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                interview.status === 'CONFIRMED' ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400' :
                interview.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
              }`}>
                {interview.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><HiOutlineCalendar className="w-4 h-4" /> {date.toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><HiOutlineClock className="w-4 h-4" /> {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              <span className="flex items-center gap-1.5">
                {interview.type === 'VIDEO' ? <HiOutlineVideoCamera className="w-4 h-4" /> : <HiOutlineMapPin className="w-4 h-4" />}
                {interview.type}
              </span>
            </div>

            {interview.meetingLink && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 mb-1">Meeting Link:</p>
                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">{interview.meetingLink}</a>
              </div>
            )}

            {interview.location && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 mb-1">Location:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{interview.location}</p>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onClick={() => updateStatus.mutate({ id: interview.id, status: 'CONFIRMED' })} disabled={interview.status === 'CONFIRMED' || updateStatus.isPending} className="btn-primary px-4 py-2 text-xs disabled:opacity-50"><HiOutlineCheckBadge className="w-4 h-4" /> Confirm</button>
              <button type="button" onClick={() => updateStatus.mutate({ id: interview.id, status: 'CANCELLED' })} disabled={interview.status === 'CANCELLED' || updateStatus.isPending} className="btn-ghost px-4 py-2 text-xs text-red-500 disabled:opacity-50"><HiOutlineXMark className="w-4 h-4" /> Decline</button>
            </div>
          </motion.div>
          )
        })}
      </div>
    </div>
  )
}
