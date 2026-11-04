import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineMapPin, HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineBookmark, HiOutlineBookmarkSlash } from 'react-icons/hi2'
import { PLACEHOLDER_LOGO } from '../../utils/constants'

export default function JobCard({ job, onSave, isSaved, index = 0 }) {
  const detailsPath = job.detailsPath || `/jobs/${job.id}`
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group glass-card p-6 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <img
          src={job.companyLogo || PLACEHOLDER_LOGO + (job.companyName || 'C')}
          alt={job.companyName}
          className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-700"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={detailsPath} className="text-lg font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {job.title}
              </Link>
              <Link to={`/companies/${job.companyId}`} className="block text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mt-0.5">
                {job.companyName}
              </Link>
            </div>
            {onSave && (
              <button onClick={() => onSave(job.id)} className="btn-ghost p-2 shrink-0">
                {isSaved ? <HiOutlineBookmarkSlash className="w-5 h-5 text-primary-600" /> : <HiOutlineBookmark className="w-5 h-5 text-slate-400" />}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {job.location && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <HiOutlineMapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
            )}
            {job.salary && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <HiOutlineCurrencyDollar className="w-3.5 h-3.5" />
                {job.salary}
              </span>
            )}
            {job.createdAt && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <HiOutlineClock className="w-3.5 h-3.5" />
                {timeAgo(job.createdAt)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {job.employmentType && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                {job.employmentType}
              </span>
            )}
            {job.experience && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {job.experience}
              </span>
            )}
            {job.workMode && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400">
                {job.workMode}
              </span>
            )}
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.skills.slice(0, 4).map(skill => (
                <span key={skill} className="px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="px-2 py-0.5 rounded-md text-xs text-slate-400 dark:text-slate-500">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <Link
              to={detailsPath}
              className="btn-primary px-5 py-2 text-xs"
            >
              Apply Now
            </Link>
            <Link
              to={detailsPath}
              className="btn-ghost px-4 py-2 text-xs"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
