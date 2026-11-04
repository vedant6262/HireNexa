import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LoadingScreen from './components/common/LoadingScreen'
import ProtectedRoute from './components/common/ProtectedRoute'
import RecruiterAccess from './components/common/RecruiterAccess'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const BrowseJobs = lazy(() => import('./pages/BrowseJobs'))
const JobDetails = lazy(() => import('./pages/JobDetails'))
const Companies = lazy(() => import('./pages/Companies'))
const CompanyDetails = lazy(() => import('./pages/CompanyDetails'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Contact = lazy(() => import('./pages/Contact'))
const FAQ = lazy(() => import('./pages/FAQ'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsConditions = lazy(() => import('./pages/TermsConditions'))
const NotFound = lazy(() => import('./pages/NotFound'))

const CandidateLogin = lazy(() => import('./pages/auth/CandidateLogin'))
const CandidateSignup = lazy(() => import('./pages/auth/CandidateSignup'))
const RecruiterLogin = lazy(() => import('./pages/auth/RecruiterLogin'))
const RecruiterSignup = lazy(() => import('./pages/auth/RecruiterSignup'))

const SkillAssessment = lazy(() => import('./pages/SkillAssessment'))
const AcademiaHub = lazy(() => import('./pages/AcademiaHub'))

const CandidateDashboard = lazy(() => import('./pages/candidate/Dashboard'))
const MyApplications = lazy(() => import('./pages/candidate/MyApplications'))
const SavedJobs = lazy(() => import('./pages/candidate/SavedJobs'))
const Profile = lazy(() => import('./pages/candidate/Profile'))
const InterviewSchedule = lazy(() => import('./pages/candidate/InterviewSchedule'))
const AptitudePrep = lazy(() => import('./pages/candidate/AptitudePrep'))
const AITools = lazy(() => import('./pages/candidate/AITools'))

const RecruiterDashboard = lazy(() => import('./pages/recruiter/Dashboard'))
const PostJob = lazy(() => import('./pages/recruiter/PostJob'))
const ManageJobs = lazy(() => import('./pages/recruiter/ManageJobs'))
const Applicants = lazy(() => import('./pages/recruiter/Applicants'))
const CompanyProfile = lazy(() => import('./pages/recruiter/CompanyProfile'))
const Analytics = lazy(() => import('./pages/recruiter/Analytics'))

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'))
const ManageRecruiters = lazy(() => import('./pages/admin/ManageRecruiters'))
const ManageCompanies = lazy(() => import('./pages/admin/ManageCompanies'))
const Reports = lazy(() => import('./pages/admin/Reports'))

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetails />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
        </Route>

        <Route path="/login/*" element={<CandidateLogin />} />
        <Route path="/signup/*" element={<CandidateSignup />} />
        <Route path="/recruiter/login/*" element={<RecruiterLogin />} />
        <Route path="/recruiter/signup/*" element={<RecruiterSignup />} />

        <Route element={<ProtectedRoute><DashboardLayout role="candidate" /></ProtectedRoute>}>
          <Route path="/skill-assessment" element={<SkillAssessment />} />
          <Route path="/academia" element={<AcademiaHub />} />
        </Route>

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout role="candidate" /></ProtectedRoute>}>
          <Route index element={<CandidateDashboard />} />
          <Route path="jobs" element={<Navigate to="/dashboard/hirenexa-jobs" replace />} />
          <Route path="live-jobs" element={<BrowseJobs source="live" />} />
          <Route path="hirenexa-jobs" element={<BrowseJobs source="hirenexa" />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="profile" element={<Profile />} />
          <Route path="interviews" element={<InterviewSchedule />} />
          <Route path="ai-tools" element={<AITools />} />
        </Route>

        <Route path="/candidate/aptitude-prep" element={<ProtectedRoute><DashboardLayout role="candidate" /></ProtectedRoute>}>
          <Route index element={<AptitudePrep />} />
        </Route>

        <Route path="/recruiter" element={<RecruiterAccess><ProtectedRoute redirectTo="/recruiter/login"><DashboardLayout role="recruiter" /></ProtectedRoute></RecruiterAccess>}>
          <Route index element={<RecruiterDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="applicants/:jobId" element={<Applicants />} />
          <Route path="company" element={<CompanyProfile />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="recruiters" element={<ManageRecruiters />} />
          <Route path="companies" element={<ManageCompanies />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
