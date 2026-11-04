import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  HiOutlineMapPin, HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineBuildingOffice2,
  HiOutlineBriefcase, HiOutlineShare, HiOutlineBookmark,
  HiOutlineCheckBadge, HiOutlineArrowLeft, HiOutlineGlobeAlt, HiOutlineArrowRight,
} from 'react-icons/hi2'
import { PLACEHOLDER_LOGO } from '../utils/constants'
import { useExternalJobs, useJob } from '../hooks/useJobs'
import { useProfile } from '../hooks/useProfile'
import { useApplyJob } from '../hooks/useApplications'
import api from '../utils/api'

const mapArbeitnowJob = (job) => ({
  id: job.slug,
  slug: job.slug,
  title: job.title,
  companyName: job.company_name,
  companyLogo: job.company_logo || null,
  companyId: job.slug,
  description: job.description || '',
  requirements: [],
  responsibilities: [],
  benefits: [],
  location: job.location || 'Remote',
  salary: job.salary || '',
  employmentType: job.job_types?.[0] || 'Full-time',
  experience: '',
  workMode: job.remote ? 'Remote' : 'On-site',
  postedDate: new Date(job.created_at * 1000).toISOString(),
  skills: job.tags || [],
  url: job.url,
})

export default function JobDetails() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [applied, setApplied] = useState(false)
  const [showApplication, setShowApplication] = useState(false)
  const [applicant, setApplicant] = useState({ firstName: '', lastName: '', phone: '', coverLetter: '' })
  const [resume, setResume] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const { data: localData } = useJob(id)
  const { data: profile } = useProfile({ enabled: showApplication })
  const applyJob = useApplyJob()
  const { data, isLoading } = useExternalJobs({ perPage: 20 })
  const allJobs = data?.data || []
  const jobData = allJobs.find(j => j.slug === id) || allJobs[0]
  const localJob = localData?.job
  const jobDetails = localJob ? {
    id: localJob.id,
    title: localJob.title,
    companyName: localJob.company?.name,
    companyLogo: localJob.company?.logo,
    companyId: localJob.companyId,
    description: localJob.description,
    requirements: localJob.requirements,
    responsibilities: localJob.responsibilities,
    benefits: localJob.benefits,
    location: localJob.location,
    salary: localJob.salaryMin ? `${localJob.salaryCurrency || 'USD'} ${localJob.salaryMin.toLocaleString()}${localJob.salaryMax ? `–${localJob.salaryMax.toLocaleString()}` : '+'}` : '',
    employmentType: localJob.employmentType,
    workMode: localJob.workMode,
    postedDate: localJob.createdAt,
    skills: localJob.skills || [],
  } : jobData ? mapArbeitnowJob(jobData) : null
  const backPath = searchParams.get('source') === 'hirenexa' ? '/dashboard/hirenexa-jobs' : searchParams.get('source') === 'live' ? '/dashboard/live-jobs' : '/jobs'

  const openApplication = () => {
    setApplicant({ firstName: profile?.firstName || '', lastName: profile?.lastName || '', phone: profile?.phone || '', coverLetter: '' })
    setShowApplication(true)
  }

  const submitApplication = async (event) => {
    event.preventDefault()
    setUploadError('')
    try {
      if (resume && (resume.type !== 'application/pdf' || resume.size > 7 * 1024 * 1024)) {
        setUploadError('Choose a PDF resume smaller than 7 MB.')
        return
      }
      let resumeUrl = profile?.resumeUrl
      if (resume) {
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(resume)
        })
        const uploadResponse = await api.post('/users/resume', { file: fileData })
        resumeUrl = uploadResponse.data.resumeUrl
      }
      if (!resumeUrl) {
        setUploadError('Please upload your resume as a PDF to continue.')
        return
      }
      await applyJob.mutateAsync({ jobId: localJob.id, resumeUrl, ...applicant })
      setShowApplication(false)
      setApplied(true)
    } catch (error) {
      setUploadError(error.message)
    }
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  if (isLoading && !localJob) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="glass-card p-6 md:p-8">
              <div className="flex gap-6">
                <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex gap-2">
                    {[1,2,3,4].map(i => <div key={i} className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded" />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!jobDetails) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Job not found</h2>
          <button onClick={() => navigate('/jobs')} className="btn-primary mt-4">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={backPath} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <img
                src={jobDetails.companyLogo || PLACEHOLDER_LOGO + (jobDetails.companyName?.[0] || 'C')}
                alt={jobDetails.companyName}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{jobDetails.title}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        {jobDetails.companyName}
                      </span>
                      <HiOutlineCheckBadge className="w-5 h-5 text-secondary-500" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-ghost p-2.5"><HiOutlineShare className="w-5 h-5" /></button>
                    <button className="btn-ghost p-2.5"><HiOutlineBookmark className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <HiOutlineMapPin className="w-4 h-4" /> {jobDetails.location}
                  </span>
                  {jobDetails.salary && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <HiOutlineCurrencyDollar className="w-4 h-4" /> {jobDetails.salary}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <HiOutlineBriefcase className="w-4 h-4" /> {jobDetails.employmentType}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <HiOutlineGlobeAlt className="w-4 h-4" /> {jobDetails.workMode}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <HiOutlineClock className="w-4 h-4" /> {timeAgo(jobDetails.postedDate)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {jobDetails.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 rounded-lg text-sm bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-6">
                  {localJob ? (
                    <button onClick={openApplication} className="btn-primary" disabled={applied}>{applied ? 'Application Submitted' : 'Apply Now'}</button>
                  ) : jobDetails.url ? (
                    <a href={jobDetails.url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">
                      Apply on Arbeitnow <HiOutlineArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <button onClick={() => setApplied(true)} className="btn-primary">
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Job Description</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{jobDetails.description || 'No description available.'}</p>
              </div>
            </div>
          </div>

          {localJob && (jobDetails.requirements || jobDetails.responsibilities || jobDetails.benefits) && (
            <div className="glass-card p-6 md:p-8 space-y-5">
              {jobDetails.responsibilities && <div><h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Responsibilities</h2><p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">{jobDetails.responsibilities}</p></div>}
              {jobDetails.requirements && <div><h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Requirements</h2><p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">{jobDetails.requirements}</p></div>}
              {jobDetails.benefits && <div><h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Benefits</h2><p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">{jobDetails.benefits}</p></div>}
            </div>
          )}
        </motion.div>
      </div>

      {showApplication && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 flex items-center justify-center" onClick={() => setShowApplication(false)}>
          <form onSubmit={submitApplication} className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto p-6" onClick={event => event.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Apply for {jobDetails.title}</h2>
            <p className="text-sm text-slate-500 mt-1 mb-5">Share your contact details and resume with {jobDetails.companyName}.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm font-medium">First name<input required value={applicant.firstName} onChange={event => setApplicant({ ...applicant, firstName: event.target.value })} className="input-field mt-1" /></label>
              <label className="text-sm font-medium">Last name<input value={applicant.lastName} onChange={event => setApplicant({ ...applicant, lastName: event.target.value })} className="input-field mt-1" /></label>
              <label className="sm:col-span-2 text-sm font-medium">Email<input readOnly value={profile?.email || ''} className="input-field mt-1 opacity-75" /></label>
              <label className="sm:col-span-2 text-sm font-medium">Phone<input required value={applicant.phone} onChange={event => setApplicant({ ...applicant, phone: event.target.value })} className="input-field mt-1" /></label>
              <label className="sm:col-span-2 text-sm font-medium">Resume (PDF, up to 7 MB)<input type="file" accept="application/pdf,.pdf" onChange={event => setResume(event.target.files?.[0] || null)} className="input-field mt-1" /></label>
              <label className="sm:col-span-2 text-sm font-medium">Note to recruiter<textarea rows={4} value={applicant.coverLetter} onChange={event => setApplicant({ ...applicant, coverLetter: event.target.value })} className="input-field mt-1 resize-y" placeholder="Tell the recruiter why you’re interested" /></label>
            </div>
            {uploadError && <p className="text-sm text-red-600 mt-3">{uploadError}</p>}
            <div className="flex justify-end gap-3 mt-5"><button type="button" onClick={() => setShowApplication(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={applyJob.isPending}>{applyJob.isPending ? 'Submitting…' : 'Submit Application'}</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
