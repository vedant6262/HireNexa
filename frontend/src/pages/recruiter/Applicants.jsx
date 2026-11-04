import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HiOutlineArrowDownTray, HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import { useJobApplications, useUpdateApplicationStatus } from '../../hooks/useApplications'
import { useJob } from '../../hooks/useJobs'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const statuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED']
const labels = { PENDING: 'Applied', REVIEWING: 'Under review', SHORTLISTED: 'Shortlisted', INTERVIEW: 'Interview', OFFERED: 'Offer', HIRED: 'Hired', REJECTED: 'Rejected' }

async function downloadResume(resumeUrl) {
  try {
    if (resumeUrl.startsWith('local://resume/')) {
      const fileId = resumeUrl.split('/').pop()
      const response = await api.get(`/users/resume/${fileId}`, { responseType: 'blob' })
      const objectUrl = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = 'candidate-resume.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
      return
    }
    window.open(resumeUrl, '_blank', 'noopener,noreferrer')
  } catch (error) {
    toast.error(error.message || 'Could not download the resume')
  }
}

export default function Applicants() {
  const { jobId } = useParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data: applications = [], isLoading, isError, error } = useJobApplications(jobId)
  const { data: jobData } = useJob(jobId)
  const updateStatus = useUpdateApplicationStatus()
  const job = jobData?.job
  const filtered = useMemo(() => applications.filter(application => {
    const name = `${application.user?.firstName || ''} ${application.user?.lastName || ''} ${application.user?.email || ''}`.toLowerCase()
    return (!search || name.includes(search.toLowerCase())) && (!statusFilter || application.status === statusFilter)
  }), [applications, search, statusFilter])

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Applicants</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{job?.title || 'Review and manage applicants for your job listing.'}</p>
        </div>
        <Link to="/recruiter/manage-jobs" className="btn-secondary">Back to jobs</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-3 glass-card px-4 py-3"><HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search applicants by name or email" className="bg-transparent outline-none text-sm w-full" /></div>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="input-field sm:w-48"><option value="">All statuses</option>{statuses.map(status => <option key={status} value={status}>{labels[status]}</option>)}</select>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading applications…</p>}
      {isError && <p className="text-sm text-red-600">{error.message}</p>}
      {!isLoading && !isError && filtered.length === 0 && <div className="glass-card p-10 text-center text-slate-500">{applications.length ? 'No applications match those filters.' : 'No one has applied to this job yet.'}</div>}

      <div className="space-y-4">
        {filtered.map(application => {
          const user = application.user || {}
          const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Student applicant'
          return (
            <article key={application.id} className="glass-card p-5">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold shrink-0">{name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-900 dark:text-white">{name}</h2>
                  <p className="text-sm text-slate-500">{user.email || 'No email on file'}{user.phone ? ` · ${user.phone}` : ''}</p>
                  <p className="text-xs text-slate-400 mt-1">Applied {new Date(application.createdAt).toLocaleDateString()}</p>
                  {user.headline && <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">{user.headline}</p>}
                  {application.coverLetter && <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 whitespace-pre-line">{application.coverLetter}</p>}
                  {user.skills?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{user.skills.map(skill => <span key={skill.id} className="px-2 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{skill.name}</span>)}</div>}
                </div>
                <div className="flex md:flex-col items-center md:items-end gap-3">
                  {application.resumeUrl && <button type="button" onClick={() => downloadResume(application.resumeUrl)} className="btn-secondary text-sm"><HiOutlineArrowDownTray className="w-4 h-4" /> Resume</button>}
                  <select aria-label={`Update status for ${name}`} value={application.status} onChange={event => updateStatus.mutate({ id: application.id, status: event.target.value })} className="input-field text-sm md:w-44" disabled={updateStatus.isPending}>{statuses.map(status => <option key={status} value={status}>{labels[status]}</option>)}</select>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
