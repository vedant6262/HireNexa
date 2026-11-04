import JobCard from '../../components/ui/JobCard'
import { useSavedJobs, useToggleSaveJob } from '../../hooks/useSavedJobs'

export default function SavedJobs() {
  const { data = [], isLoading, isError } = useSavedJobs()
  const toggleSave = useToggleSaveJob()
  const savedJobs = data.map(savedJob => ({
    ...savedJob.job,
    companyName: savedJob.job.company?.name,
    companyLogo: savedJob.job.company?.logo,
    companyId: savedJob.job.company?.id,
    savedJobId: savedJob.id,
  }))

  if (isLoading) return <p className="text-sm text-slate-500 dark:text-slate-400">Loading saved jobs...</p>
  if (isError) return <p className="text-sm text-rose-600 dark:text-rose-400">Unable to load saved jobs.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Saved Jobs</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Jobs you've saved for later review.</p>

      <div className="space-y-4">
        {savedJobs.map((job, i) => (
          <JobCard key={job.id} job={job} isSaved onSave={(id) => toggleSave.mutate(id)} index={i} />
        ))}
        {savedJobs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400">No saved jobs yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
