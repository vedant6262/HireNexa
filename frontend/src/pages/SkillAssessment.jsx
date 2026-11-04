import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import useCVProctoring from '../hooks/useCVProctoring'
import AssessmentReport from '../components/assessment/AssessmentReport'
import {
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
  HiOutlineBriefcase,
  HiOutlineCheck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineCodeBracket,
  HiOutlineExclamationTriangle,
  HiOutlineUsers,
  HiOutlineVideoCamera,
  HiOutlineXMark,
  HiOutlineSparkles,
} from 'react-icons/hi2'

const fallbackQuestions = [
  {
    id: 'q1',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'Which data structure is best suited for implementing a LIFO mechanism?',
    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
  },
  {
    id: 'q2',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'Which data structure uses the FIFO principle?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
  },
  {
    id: 'q3',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'What does SQL JOIN do?',
    options: ['Combines rows from multiple tables based on a related column', 'Sorts database records', 'Deletes duplicate data', 'Creates a new table'],
  },
  {
    id: 'q4',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'Which of the following is a characteristic of a good database index?',
    options: ['Improves query speed for lookup operations', 'Stores duplicate rows', 'Prevents data integrity', 'Removes table relationships'],
  },
  {
    id: 'q5',
    section: 'Aptitude',
    type: 'multiple',
    question: 'If 12 workers complete a project in 8 days, how many days will 16 workers take at the same rate?',
    options: ['4 days', '5 days', '6 days', '7 days'],
  },
  {
    id: 'q6',
    section: 'Aptitude',
    type: 'multiple',
    question: 'Choose the number that completes the series: 2, 6, 12, 20, ?',
    options: ['28', '30', '32', '36'],
  },
  {
    id: 'q7',
    section: 'Soft Skills',
    type: 'rating',
    question: 'I can clearly communicate my technical ideas to a team.',
    scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 'q8',
    section: 'Industry Readiness',
    type: 'scenario',
    question: 'Your project deadline is tomorrow, but an important module is incomplete. What would you do?',
    options: [
      'Prioritize the critical module, communicate the risk early, and ask for support to re-sequence work.',
      'Hide the issue and continue working alone without updating the team.',
      'Stop all work and wait for instructions from the manager.',
      'Rush the implementation without checking quality or dependencies.',
    ],
  },
  {
    id: 'q9',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'Which of the following best describes a hash map?',
    options: ['A collection of key-value pairs with average O(1) lookup', 'A sorted tree structure', 'A queue-based structure', 'A graph traversal technique'],
  },
  {
    id: 'q10',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'Which loop is most suitable when the number of iterations is known beforehand?',
    options: ['for loop', 'while loop', 'do-while loop', 'recursive function'],
  },
  {
    id: 'q11',
    section: 'Aptitude',
    type: 'multiple',
    question: 'A train travels 180 km in 3 hours. What is its speed?',
    options: ['50 km/h', '55 km/h', '60 km/h', '65 km/h'],
  },
  {
    id: 'q12',
    section: 'Aptitude',
    type: 'multiple',
    question: 'If all roses are flowers and some flowers fade quickly, which statement must be true?',
    options: ['Some roses fade quickly', 'All flowers are roses', 'All roses fade quickly', 'No roses are flowers'],
  },
  {
    id: 'q13',
    section: 'Soft Skills',
    type: 'rating',
    question: 'I can receive feedback constructively and adapt my work accordingly.',
    scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 'q14',
    section: 'Industry Readiness',
    type: 'scenario',
    question: 'A stakeholder asks for a feature that is outside the current sprint scope. What is the best response?',
    options: [
      'Explain scope constraints, suggest a priority discussion, and propose a realistic alternative timeline.',
      'Approve it immediately to keep the stakeholder happy.',
      'Ignore the request until the sprint ends.',
      'Tell the stakeholder to contact the customer directly.',
    ],
  },
  {
    id: 'q15',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'Which of the following is a valid SQL aggregate function?',
    options: ['COUNT()', 'SELECT()', 'SUMMARIZE()', 'GROUP()'],
  },
  {
    id: 'q16',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'What is the purpose of version control?',
    options: ['Track and manage code changes across time', 'Encrypt source code', 'Run automated tests', 'Compile the app'],
  },
  {
    id: 'q17',
    section: 'Aptitude',
    type: 'multiple',
    question: 'Which number is odd one out: 16, 25, 36, 49, 64?',
    options: ['16', '25', '49', '64'],
  },
  {
    id: 'q18',
    section: 'Aptitude',
    type: 'multiple',
    question: 'If today is Monday, what day will it be 10 days later?',
    options: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  {
    id: 'q19',
    section: 'Soft Skills',
    type: 'rating',
    question: 'I take ownership of my tasks and keep my team informed about progress.',
    scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 'q20',
    section: 'Industry Readiness',
    type: 'scenario',
    question: 'A client says the delivered prototype does not match the requirements. What is your best next step?',
    options: [
      'Review the requirements, identify gaps, and propose a revised plan with clear evidence.',
      'Defend the design without listening to feedback.',
      'Blame the team for poor planning.',
      'Ignore the feedback and move to a new project.',
    ],
  },
  {
    id: 'q21',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'Which of the following is a relational database management system?',
    options: ['MySQL', 'MongoDB', 'Redis', 'Cassandra'],
  },
  {
    id: 'q22',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'What is the main purpose of a REST API?',
    options: ['Allow systems to communicate over HTTP using standard methods', 'Store all data in memory', 'Render UI components', 'Analyze machine learning models'],
  },
  {
    id: 'q23',
    section: 'Aptitude',
    type: 'multiple',
    question: 'A shop offers 20% discount, then another 10% discount. What is the effective total discount?',
    options: ['28%', '30%', '26%', '32%'],
  },
  {
    id: 'q24',
    section: 'Aptitude',
    type: 'multiple',
    question: 'If A is taller than B and B is taller than C, which statement is true?',
    options: ['A is taller than C', 'A is shorter than C', 'C is taller than A', 'No conclusion'],
  },
  {
    id: 'q25',
    section: 'Soft Skills',
    type: 'rating',
    question: 'I am comfortable prioritizing urgent tasks while keeping long-term goals in view.',
    scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 'q26',
    section: 'Industry Readiness',
    type: 'scenario',
    question: 'An internal review reveals a security issue in a live feature. What should you do first?',
    options: [
      'Assess the impact, contain the risk, and communicate the issue promptly to stakeholders.',
      'Ignore it if no customer complaint has been raised.',
      'Delay the fix until the next quarter.',
      'Deploy a quick patch without testing.',
    ],
  },
  {
    id: 'q27',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'Which of the following is a common time complexity for binary search?',
    options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
  },
  {
    id: 'q28',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'What does the acronym DBMS stand for?',
    options: ['Database Management System', 'Digital Base Management Service', 'Data Backup Management Structure', 'Distributed Browser Mapping System'],
  },
  {
    id: 'q29',
    section: 'Aptitude',
    type: 'multiple',
    question: 'Choose the correct analogy: Writer is to Book as Composer is to ?',
    options: ['Song', 'Musician', 'Studio', 'Singer'],
  },
  {
    id: 'q30',
    section: 'Aptitude',
    type: 'multiple',
    question: 'If a code is 3, 6, 9, 12, what is the next number?',
    options: ['15', '16', '18', '21'],
  },
  {
    id: 'q31',
    section: 'Soft Skills',
    type: 'rating',
    question: 'I can contribute thoughtfully in team discussions without dominating the conversation.',
    scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 'q32',
    section: 'Industry Readiness',
    type: 'scenario',
    question: 'During a team review, you notice a teammate is struggling with a technical task. What is the most professional response?',
    options: [
      'Offer support, clarify requirements, and help delegate or simplify the work.',
      'Ignore it and focus on your own tasks.',
      'Tell them to work harder without guidance.',
      'Wait for them to fail before helping.',
    ],
  },
  {
    id: 'q33',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'Which of these best defines encapsulation?',
    options: ['Bundling data and methods into a single unit and restricting direct access', 'Repeating logic across methods', 'Sorting data in memory', 'Removing unused code'],
  },
  {
    id: 'q34',
    section: 'Technical Skills',
    type: 'multiple',
    question: 'Which practice helps improve code maintainability?',
    options: ['Writing modular and readable code', 'Adding as much complexity as possible', 'Using a single very long function', 'Avoiding documentation'],
  },
  {
    id: 'q35',
    section: 'Industry Readiness',
    type: 'scenario',
    question: 'A manager asks for a status update before a meeting. What is the best response?',
    options: [
      'Share concise progress, risks, and next steps clearly and professionally.',
      'Say nothing until the meeting begins.',
      'Only mention the positive parts and hide the risks.',
      'Avoid reporting because the task is not complete yet.',
    ],
  },
]

const careerOptions = [
  { id: 'software', label: 'Software Developer', description: 'Programming • DSA • DBMS', icon: HiOutlineCodeBracket },
  { id: 'data', label: 'Data Analyst', description: 'SQL • Python • Statistics', icon: HiOutlineAcademicCap },
  { id: 'ai', label: 'AI / ML Engineer', description: 'Python • Machine Learning • Mathematics', icon: HiOutlineSparkles },
  { id: 'cyber', label: 'Cybersecurity', description: 'Networking • Security • Linux', icon: HiOutlineShieldCheckIcon },
  { id: 'electronics', label: 'Electronics Engineer', description: 'Embedded Systems • Electronics • Microcontrollers', icon: HiOutlineBriefcase },
  { id: 'other', label: 'Other', description: 'Choose your own career path', icon: HiOutlineAcademicCap },
]

const assessmentSections = [
  { id: 'technical', label: 'Technical Skills', description: 'Test your technical knowledge and domain-specific skills.', count: 12, time: '8 min', status: 'Ready' },
  { id: 'aptitude', label: 'Aptitude', description: 'Evaluate logical reasoning, quantitative ability and analytical thinking.', count: 8, time: '6 min', status: 'Ready' },
  { id: 'soft', label: 'Soft Skills', description: 'Evaluate communication, teamwork, leadership and adaptability.', count: 8, time: '4 min', status: 'Ready' },
  { id: 'industry', label: 'Industry Readiness', description: 'Measure practical problem-solving and workplace decision-making.', count: 7, time: '5 min', status: 'Ready' },
]

function HiOutlineShieldCheckIcon(props) {
  return <HiOutlineExclamationTriangle {...props} />
}

function calculateAssessmentResult(questions, answers) {
  let score = 0
  const strengths = []
  const skillGaps = []
  const sectionStats = new Map()
  const questionResults = []

  questions.forEach((question) => {
    const selectedAnswer = answers[question.id]
    const correctAnswer = question.correctAnswer ?? (
      typeof question.correctIndex === 'number' ? question.options?.[question.correctIndex] : undefined
    )
    const section = String(question.section || 'General')
    const isCorrect = correctAnswer !== undefined && String(selectedAnswer) === String(correctAnswer)
    const sectionStat = sectionStats.get(section) || { name: section, correct: 0, total: 0 }

    if (isCorrect) score += Number(question.weight || 1)
    sectionStat.total += 1
    if (isCorrect) sectionStat.correct += 1
    sectionStats.set(section, sectionStat)
    questionResults.push({
      id: question.id,
      section,
      question: question.question,
      selectedAnswer: selectedAnswer ?? null,
      correctAnswer: correctAnswer ?? null,
      isCorrect,
    })
  })

  const total = Math.max(questions.length, 1)
  const percentage = Math.round((score / total) * 100)
  strengths.push(percentage >= 75 ? 'Strong career readiness foundation' : 'Good potential with targeted upskilling')
  strengths.push('Professional communication readiness')
  skillGaps.push('Advanced system design', 'Cloud deployment and validation')

  return {
    score,
    percentage,
    total,
    sections: Array.from(sectionStats.values()).map((section) => ({
      ...section,
      percentage: section.total ? Math.round((section.correct / section.total) * 100) : 0,
    })),
    questionResults,
    strengths,
    skillGaps,
    recommendedRoles: ['Product Analyst', 'Software Engineer', 'Data Analyst', 'UX Research Assistant'],
    summary: `You scored ${percentage}% in the industry-readiness assessment. This indicates ${percentage >= 80 ? 'excellent alignment' : 'good potential'} for career-focused internships and placement pathways.`,
    recommendedIndustries: ['Technology', 'Consulting', 'Fintech', 'EdTech', 'Research'],
  }
}

export default function SkillAssessment() {
  const navigate = useNavigate()
  const [selectedCareer, setSelectedCareer] = useState('software')
  const [showAssessment, setShowAssessment] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showExitModal, setShowExitModal] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [questions, setQuestions] = useState(fallbackQuestions)
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 32)
  const [cameraError, setCameraError] = useState('')
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [violationCount, setViolationCount] = useState(0)
  const [assessmentTerminated, setAssessmentTerminated] = useState(false)
  const [violationMessage, setViolationMessage] = useState('')
  const [showViolationModal, setShowViolationModal] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [proctoringReport, setProctoringReport] = useState(null)
  const [submittingAssessment, setSubmittingAssessment] = useState(false)
  const videoRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const violationLockRef = useRef(false)

  const {
    status: cvStatus,
    analysis: cvAnalysis,
    events: cvEvents,
    eventLog: cvEventLog,
    eventStats: cvEventStats,
    startedAt: cvStartedAt,
    error: cvError,
  } = useCVProctoring({
    active: showAssessment && cameraEnabled && !submitted && !assessmentTerminated,
    videoRef,
  })

  const selectedCareerMeta = careerOptions.find((career) => career.id === selectedCareer) || careerOptions[0]

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement))

      if (showAssessment && !submitted && !assessmentTerminated && !document.fullscreenElement) {
        const now = Date.now()
        if (!violationLockRef.current) {
          violationLockRef.current = true
          setTimeout(() => {
            violationLockRef.current = false
          }, 1200)
          setViolationCount((prev) => prev + 1)
          setShowViolationModal(true)
        }
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [showAssessment, submitted, assessmentTerminated])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!showAssessment || submitted || assessmentTerminated) return

      if (document.hidden) {
        const now = Date.now()
        if (!violationLockRef.current) {
          violationLockRef.current = true
          setTimeout(() => {
            violationLockRef.current = false
          }, 1200)
          setViolationCount((prev) => prev + 1)
        }
      }
    }

    const handleWindowBlur = () => {
      if (!showAssessment || submitted || assessmentTerminated || violationLockRef.current) return

      violationLockRef.current = true
      setTimeout(() => {
        violationLockRef.current = false
      }, 1200)
      setViolationCount((prev) => prev + 1)
      setShowViolationModal(true)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [showAssessment, submitted, assessmentTerminated])

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraEnabled, showAssessment, loadingQuestions])

  useEffect(() => {
    if (violationCount === 0) {
      setViolationMessage('')
      return
    }

    if (violationCount === 1) {
      setViolationMessage('Warning: Tab switching is not allowed. This activity has been recorded.')
      return
    }

    if (violationCount === 2) {
      setViolationMessage('Warning: Tab switching or exiting fullscreen is not allowed. This activity has been recorded.')
      return
    }

    setViolationMessage('Warning: Repeated rule breaches have been recorded for review.')
  }, [violationCount])

  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true)
      try {
        const { data } = await api.get('/portal/assessment', { params: { careerGoal: selectedCareer } })
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions)
        } else {
          setQuestions(fallbackQuestions)
        }
      } catch (error) {
        setQuestions(fallbackQuestions)
      } finally {
        setLoadingQuestions(false)
      }
    }

    loadQuestions()
    setAnswers({})
    setCurrentQuestionIndex(0)
    setSubmitted(false)
    setProctoringReport(null)
  }, [selectedCareer])

  const handleViolation = () => {
    if (!showAssessment || submitted || assessmentTerminated || violationLockRef.current) return

    violationLockRef.current = true
    setTimeout(() => {
      violationLockRef.current = false
    }, 1200)

    setViolationCount((prev) => prev + 1)
  }

  const confirmStartAssessment = async () => {
    setShowRulesModal(false)
    setShowAssessment(true)
    setLoadingQuestions(true)
    setCameraError('')
    setProctoringReport(null)
    setAssessmentResult(null)

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {})
      }

      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })

        mediaStreamRef.current = stream
        setCameraEnabled(true)
      }
    } catch (error) {
      setCameraError('Camera access is required to begin the assessment. Please allow camera permission and try again.')
    }

    try {
      const { data } = await api.get('/portal/assessment', {
        params: {
          careerGoal: selectedCareer,
          seed: Date.now(),
        },
      })
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions)
      } else {
        setQuestions(fallbackQuestions)
      }
      setAnswers({})
      setCurrentQuestionIndex(0)
      setSubmitted(false)
      setAssessmentTerminated(false)
      setViolationCount(0)
      setViolationMessage('')
      setShowViolationModal(false)
      setAssessmentResult(null)
      setProctoringReport(null)
      setShowAssessment(true)
    } catch (error) {
      setQuestions(fallbackQuestions)
    } finally {
      setLoadingQuestions(false)
    }
  }

  const startAssessment = () => {
    setShowRulesModal(true)
  }

  useEffect(() => {
    if (!showAssessment || submitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showAssessment, submitted])

  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).length
  const progressPercent = Math.round((answeredCount / questions.length) * 100)

  const sectionProgress = useMemo(() => {
    const sectionData = {
      'Technical Skills': questions.filter((q) => q.section === 'Technical Skills').length,
      Aptitude: questions.filter((q) => q.section === 'Aptitude').length,
      'Soft Skills': questions.filter((q) => q.section === 'Soft Skills').length,
      'Industry Readiness': questions.filter((q) => q.section === 'Industry Readiness').length,
    }

    return Object.keys(sectionData).reduce((acc, key) => {
      const count = sectionData[key]
      const answered = questions.filter((q) => q.section === key && answers[q.id]).length
      acc[key] = { count, answered, percent: Math.round((answered / count) * 100) }
      return acc
    }, {})
  }, [answers])

  const cvSnapshot = useMemo(() => {
    const directions = Array.isArray(cvAnalysis?.faces)
      ? cvAnalysis.faces.map((face) => face.direction)
      : []

    return {
      phoneDetected: Boolean(cvAnalysis?.phone?.detected),
      multiplePeople: Boolean(cvAnalysis?.multiplePeople)
        || Math.max(Number(cvAnalysis?.personCount) || 0, Number(cvAnalysis?.faceCount) || 0) > 1,
      faceAbsent: Boolean(cvAnalysis?.faceAbsent),
      lookingAway: directions.some((direction) =>
        ['looking_left', 'looking_right', 'looking_up', 'looking_down'].includes(direction)),
      direction: directions[0] || null,
      score: cvAnalysis?.score ?? 0,
      level: cvAnalysis?.level || 'NORMAL',
    }
  }, [cvAnalysis])

  const cvBoxes = useMemo(() => {
    const frameWidth = cvAnalysis?.frame?.width || 0
    const frameHeight = cvAnalysis?.frame?.height || 0
    if (!frameWidth || !frameHeight) return { faces: [], phone: null }

    const toBox = (box) => {
      if (!Array.isArray(box) || box.length < 4) return null
      const [x, y, width, height] = box
      return {
        left: `${(x / frameWidth) * 100}%`,
        top: `${(y / frameHeight) * 100}%`,
        width: `${(width / frameWidth) * 100}%`,
        height: `${(height / frameHeight) * 100}%`,
      }
    }

    const faces = (cvAnalysis?.faces || []).flatMap((face) => {
      const position = toBox(face.box)
      return position ? [{ ...position, direction: face.direction }] : []
    })

    return {
      faces,
      phone: cvAnalysis?.phone?.detected ? toBox(cvAnalysis.phone.box) : null,
    }
  }, [cvAnalysis])

  const buildProctoringReport = () => ({
    score: cvSnapshot.score,
    level: cvSnapshot.level,
    eventCounts: cvEventStats.counts || {},
    totalEvents: cvEventStats.total || 0,
    events: cvEventLog,
    tabViolations: violationCount,
    startedAt: cvStartedAt,
    endedAt: new Date().toISOString(),
    frameCount: cvAnalysis?.frameCount || 0,
    lastFrame: cvAnalysis
      ? {
          faceCount: cvAnalysis.faceCount ?? 0,
          personCount: Math.max(Number(cvAnalysis.personCount) || 0, Number(cvAnalysis.faceCount) || 0),
          phoneDetected: Boolean(cvAnalysis.phone?.detected),
        }
      : null,
    status: cvStatus,
  })

  const detectedPersonCount = cvAnalysis
    ? Math.max(Number(cvAnalysis.personCount) || 0, Number(cvAnalysis.faceCount) || 0)
    : null

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handleSubmit = () => {
    if (assessmentTerminated) return

    const unanswered = questions.some((question) => !(question.id in answers))
    if (unanswered) {
      setCurrentQuestionIndex(questions.findIndex((question) => !(question.id in answers)))
      return
    }

    setShowSubmitConfirm(true)
  }

  const finalizeAssessment = () => {
    setProctoringReport(buildProctoringReport())
    setAssessmentResult(calculateAssessmentResult(questions, answers))
    setShowExitModal(false)
    setSubmitted(true)
  }

  const handleExit = () => {
    setShowExitModal(true)
  }

  const confirmFinalSubmit = async () => {
    const proctoringSnapshot = buildProctoringReport()
    const immediateResult = calculateAssessmentResult(questions, answers)
    setSubmittingAssessment(true)
    setAssessmentResult(immediateResult)
    setShowSubmitConfirm(false)
    setProctoringReport(proctoringSnapshot)
    setSubmitted(true)

    try {
      const { data } = await api.post('/portal/assessment/submit', {
        answers,
        questions,
        careerGoal: selectedCareer,
      })
      setAssessmentResult(data)
    } catch (error) {
      console.error('Assessment result sync failed:', error)
    }
    setSubmittingAssessment(false)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  const renderQuestionCard = () => {
    if (!currentQuestion) return null

    const selectedValue = answers[currentQuestion.id]
    const disabledForViolation = assessmentTerminated

    if (currentQuestion.type === 'multiple') {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedValue === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => !disabledForViolation && handleAnswer(currentQuestion.id, option)}
                disabled={disabledForViolation}
                className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-[0_12px_30px_-20px_rgba(79,70,229,0.8)] dark:border-primary-400 dark:bg-primary-500/10'
                    : 'border-slate-200 bg-white hover:border-primary-200 hover:bg-primary-50/40 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-primary-500/40'
                } ${disabledForViolation ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-500'}`}>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-base font-medium text-slate-700 dark:text-slate-200">{option}</span>
                </div>
              </button>
            )
          })}
        </div>
      )
    }

    if (currentQuestion.type === 'rating') {
      return (
        <div className="grid gap-3 sm:grid-cols-5">
          {currentQuestion.scale.map((label, index) => {
            const isSelected = selectedValue === index + 1
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleAnswer(currentQuestion.id, index + 1)}
                className={`rounded-2xl border p-4 text-center transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-300'
                    : 'border-slate-200 bg-white hover:border-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500/40'
                }`}
              >
                <div className="text-xl font-bold">{index + 1}</div>
                <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
              </button>
            )
          })}
        </div>
      )
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedValue === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => !disabledForViolation && handleAnswer(currentQuestion.id, option)}
              disabled={disabledForViolation}
              className={`rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-[0_12px_30px_-20px_rgba(79,70,229,0.8)] dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-300'
                  : 'border-slate-200 bg-white hover:border-primary-200 hover:bg-primary-50/40 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500/40'
              } ${disabledForViolation ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-500'}`}>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <span className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">{option}</span>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  const renderAssessmentOverview = () => (
    <div className="space-y-7">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Skill Assessment</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Skill Assessment</h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
              Evaluate your skills and discover how well they match current industry requirements.
            </p>
          </div>

          <div className="w-full max-w-xs rounded-2xl border border-primary-100 bg-primary-50/60 p-4 dark:border-primary-500/20 dark:bg-primary-500/5">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">35</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">15–20</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Minutes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">4</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sections</p>
              </div>
            </div>
            <button type="button" onClick={startAssessment} disabled={loadingQuestions} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-70">
              {loadingQuestions ? 'Generating Questions...' : 'Start Assessment'} <HiOutlineArrowRight className="h-4 w-4" />
            </button>
            {cameraError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {cameraError}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select Your Career Goal</h2>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
              Choose the career role you are preparing for. Your assessment will be personalized according to the skills required for this role.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {careerOptions.map((career) => {
            const Icon = career.icon
            const selected = selectedCareer === career.id
            return (
              <button
                key={career.id}
                type="button"
                onClick={() => setSelectedCareer(career.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  selected
                    ? 'border-primary-500 bg-primary-50 shadow-[0_18px_40px_-28px_rgba(79,70,229,0.85)] dark:border-primary-400 dark:bg-primary-500/10'
                    : 'border-slate-200 bg-slate-50 hover:border-primary-200 hover:bg-primary-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary-500/40'
                }`}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm dark:bg-slate-800 dark:text-primary-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">{career.label}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{career.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Assessment Areas</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {assessmentSections.map((section) => {
            const sectionIcon =
              section.label === 'Technical Skills'
                ? HiOutlineCodeBracket
                : section.label === 'Aptitude'
                  ? HiOutlineAcademicCap
                  : section.label === 'Soft Skills'
                    ? HiOutlineUsers
                    : HiOutlineBriefcase

            const Icon = sectionIcon
            return (
              <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm dark:bg-slate-800 dark:text-primary-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {section.status}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{section.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.description}</p>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>{section.count} Questions</span>
                  <span>{section.time}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderCompletedState = () => (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800">
      <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${assessmentTerminated ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
        {assessmentTerminated ? <HiOutlineExclamationTriangle className="h-10 w-10" /> : <HiOutlineCheck className="h-10 w-10" />}
      </div>
      <h2 className="mt-6 text-center text-3xl font-bold text-slate-900 dark:text-white">
        {assessmentTerminated ? 'Assessment terminated due to repeated violations.' : 'Assessment Saved & Result Ready 🎉'}
      </h2>
      <p className="mt-3 text-center text-base text-slate-600 dark:text-slate-300">
        {assessmentTerminated
          ? 'This assessment was automatically ended because the activity violated the assessment rules.'
          : `Your responses for ${selectedCareerMeta.label} have been captured and saved successfully.`}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-center dark:border-primary-500/20 dark:bg-primary-500/10">
          <p className="text-xs uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">Assessment Score</p>
          <p className="mt-3 text-4xl font-bold text-primary-700 dark:text-primary-300">{assessmentResult ? `${assessmentResult.percentage}%` : assessmentTerminated ? 'N/A' : 'Pending'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Completion</p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{Math.round((answeredCount / questions.length) * 100)}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Answered</p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{answeredCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Career Goal</p>
          <p className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{selectedCareerMeta.label}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Proctoring Score</p>
          <p className={`mt-3 text-3xl font-bold ${proctoringReport && proctoringReport.score >= 12 ? 'text-rose-600 dark:text-rose-400' : proctoringReport && proctoringReport.score >= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {proctoringReport ? proctoringReport.score : '—'}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            {proctoringReport ? proctoringReport.level : 'Not available'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">AI Violations</p>
          <p className={`mt-3 text-3xl font-bold ${proctoringReport?.totalEvents > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {proctoringReport ? proctoringReport.totalEvents : '—'}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            {proctoringReport ? `${proctoringReport.tabViolations} tab warnings` : 'Not available'}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-primary-100 bg-primary-50/80 p-5 text-left dark:border-primary-500/20 dark:bg-primary-500/5">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary-600">Assessment Status</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
          {assessmentTerminated ? (
            <>
              <li>• Assessment terminated after repeated violations.</li>
              <li>• The system recorded the tab/fullscreen rule breaches.</li>
              <li>• No more responses can be submitted after termination.</li>
            </>
          ) : (
            <>
              <li>• Your final score is {assessmentResult ? `${assessmentResult.percentage}%` : 'being prepared'}.</li>
              <li>• Your assessment has been auto-saved with your latest responses.</li>
              <li>• The selected career track is aligned with {selectedCareerMeta.label} skill expectations.</li>
              {assessmentResult?.summary && <li>• {assessmentResult.summary}</li>}
            </>
          )}
        </ul>
      </div>

      <AssessmentReport
        assessmentResult={assessmentResult}
        proctoring={proctoringReport}
        terminated={assessmentTerminated}
      />

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate('/dashboard/profile')}
          className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          View Skill Profile <HiOutlineArrowRight className="ml-2 h-4 w-4" />
        </button>
        <button type="button" onClick={() => { setSubmitted(false); setShowAssessment(false); setCurrentQuestionIndex(0); setAssessmentTerminated(false); setViolationCount(0); setViolationMessage(''); setProctoringReport(null); }} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-primary-500/40">
          Back to Assessment
        </button>
      </div>
    </div>
  )

  if (showRulesModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Assessment Rules</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Before you begin</h2>
            </div>
            <button type="button" onClick={() => setShowRulesModal(false)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
              <HiOutlineXMark className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-700 dark:text-slate-200">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
              <p className="font-semibold text-amber-700 dark:text-amber-300">Important notice</p>
              <p className="mt-2">A normal browser cannot technically block tab changes or app switching. This assessment uses detection, warnings, and automatic termination to enforce integrity.</p>
            </div>
            <ul className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <li>• Tab switching is not allowed.</li>
              <li>• Exiting fullscreen is not allowed.</li>
              <li>• Switching to another application or window may be detected.</li>
              <li>• AI vision checks your camera for phones, multiple people, face absence, and head direction.</li>
              <li>• Repeated rule breaches are recorded and shown as warnings.</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setShowRulesModal(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Cancel
            </button>
            <button type="button" onClick={confirmStartAssessment} className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-500">
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!showAssessment) {
    return (
      <div className="mx-auto max-w-7xl py-8">
        {renderAssessmentOverview()}
      </div>
    )
  }

  if (loadingQuestions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-50 px-4 py-12 text-center dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-500/20 dark:border-t-primary-400" />
          <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Preparing your custom assessment</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Loading your assessment questions.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-7xl py-8">
        {renderCompletedState()}
      </div>
    )
  }

  const questionNumber = currentQuestionIndex + 1
  const answeredProgress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">{currentQuestion.section}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Question {questionNumber} of {questions.length}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <HiOutlineClock className="h-4 w-4 text-primary-600" />
            <span>{formatTime(timeLeft)} remaining</span>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Warnings: {violationCount}
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            {isFullScreen ? 'Full screen active' : 'Full screen off'}
          </div>
        </div>
      </div>

      {violationMessage && (
        <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${violationCount === 1 ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300' : violationCount === 2 ? 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'}`}>
          {violationMessage}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">{questionNumber}</span>
                <span>{currentQuestion.section}</span>
              </div>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{currentQuestion.type}</span>
            </div>

            <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div className="h-full rounded-full bg-primary-600" style={{ width: `${answeredProgress}%` }} />
            </div>

            <div className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Question {questionNumber} of {questions.length}
            </div>

            <h3 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">{currentQuestion.question}</h3>

            <div className="mt-6">{renderQuestionCard()}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || assessmentTerminated} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <HiOutlineChevronLeft className="h-4 w-4" /> Previous
              </button>

              <button type="button" onClick={handleExit} disabled={assessmentTerminated} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Save & Exit
              </button>

              <button type="button" onClick={currentQuestionIndex === questions.length - 1 ? handleSubmit : handleNext} disabled={assessmentTerminated} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60">
                {currentQuestionIndex === questions.length - 1 ? 'Submit Assessment' : 'Next'} <HiOutlineChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-5 xl:pt-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Exam Proctoring</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">CV models: phone, head pose and people count.</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${cvStatus === 'active' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400' : cvStatus === 'unavailable' ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300' : 'border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
                {cvStatus === 'active' ? 'Live' : cvStatus === 'connecting' ? 'Connecting' : cvStatus === 'unavailable' ? 'Offline' : 'Idle'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Face</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{cvAnalysis ? (cvSnapshot.faceAbsent ? 'Absent' : 'Detected') : '—'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">People</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{detectedPersonCount ?? '—'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Phone</p>
                <p className={`mt-1 font-semibold ${cvSnapshot.phoneDetected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{cvSnapshot.phoneDetected ? 'Detected' : cvAnalysis ? 'Clear' : '—'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Gaze</p>
                <p className={`mt-1 font-semibold ${cvSnapshot.lookingAway ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{cvAnalysis ? (cvSnapshot.direction || 'Center') : '—'}</p>
              </div>
            </div>

            {cvAnalysis && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">
                <span className="text-slate-600 dark:text-slate-300">Suspicion</span>
                <span className={`font-semibold ${cvSnapshot.score >= 12 ? 'text-rose-600 dark:text-rose-400' : cvSnapshot.score >= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{cvSnapshot.score} · {cvSnapshot.level}</span>
              </div>
            )}

            {cvError && (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{cvError}</p>
            )}

            {cvEvents.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Recent AI events</p>
                <ul className="mt-2 space-y-1.5">
                  {cvEvents.slice(0, 3).map((event) => (
                    <li key={event.id} className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">{event.description}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assessment Progress</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Overall</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div className="h-full rounded-full bg-primary-600" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{progressPercent}%</div>
            </div>

            <div className="space-y-4">
              {Object.entries(sectionProgress).map(([label, values]) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{label}</span>
                    <span>{values.percent}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-primary-600" style={{ width: `${values.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{answeredCount} / {questions.length} Questions Completed</div>
            </div>

            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Questions</h4>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const answered = question.id in answers
                  const isCurrent = currentQuestionIndex === index
                  const isCompleted = index < currentQuestionIndex || answered
                  const classes = isCurrent
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : isCompleted
                      ? 'border-primary-200 bg-primary-100 text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300'
                      : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => !assessmentTerminated && setCurrentQuestionIndex(index)}
                      disabled={assessmentTerminated}
                      className={`flex h-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${classes} ${assessmentTerminated ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-4 right-4 z-40 w-[min(23rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-[0_12px_30px_-10px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-800 sm:bottom-6 sm:right-6">
        <div className="relative">
          {cameraEnabled ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="block w-full rounded-lg border border-slate-300 bg-slate-100 [transform:scaleX(-1)] dark:border-slate-500 dark:bg-slate-900"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-2 text-center text-xs text-slate-500 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-300">Camera preview will appear here after permission is granted.</div>
          )}
          {cameraEnabled && (
            <div className="pointer-events-none absolute inset-0">
              {cvBoxes.faces.map((box, index) => (
                <div
                  key={`face-box-${index}`}
                  style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
                  className="absolute rounded-md border-2 border-emerald-400 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                >
                  <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                    {box.direction}
                  </span>
                </div>
              ))}
              {cvBoxes.phone && (
                <div
                  style={{ left: cvBoxes.phone.left, top: cvBoxes.phone.top, width: cvBoxes.phone.width, height: cvBoxes.phone.height }}
                  className="absolute rounded-md border-2 border-rose-500 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
                >
                  <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                    Phone
                  </span>
                </div>
              )}
            </div>
          )}
          <div className={`absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow ${cvStatus === 'active' ? 'bg-emerald-600' : cvStatus === 'unavailable' ? 'bg-rose-600' : 'bg-slate-600'}`}>
            <HiOutlineVideoCamera className="h-3 w-3" />
            {cvStatus === 'active' ? 'AI proctoring live' : cvStatus === 'connecting' ? 'Connecting AI' : cvStatus === 'unavailable' ? 'AI offline' : 'AI idle'}
          </div>
          {cvSnapshot.phoneDetected && (
            <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-rose-600/95 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
              Phone detected{cvAnalysis?.phone?.confidence ? ` · ${Math.round(cvAnalysis.phone.confidence * 100)}%` : ''}
            </div>
          )}
          {!cvSnapshot.phoneDetected && cvSnapshot.multiplePeople && (
            <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-amber-600/95 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
              Multiple people detected
            </div>
          )}
        </div>
      </div>

      {showViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-7 text-center shadow-2xl dark:border-amber-500/30 dark:bg-slate-800">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <HiOutlineExclamationTriangle className="h-7 w-7" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">Assessment warning</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Please return to the assessment</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{violationMessage}</p>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Warning {violationCount}</p>
            <button type="button" onClick={() => setShowViolationModal(false)} className="mt-6 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-500">
              Return to Assessment
            </button>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <HiOutlineExclamationTriangle className="h-5 w-5" />
              </div>
              <button type="button" onClick={() => setShowExitModal(false)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                <HiOutlineXMark className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Exit Assessment?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Your progress will be saved automatically. You can continue the assessment later from this point.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowExitModal(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Cancel
              </button>
              <button type="button" onClick={finalizeAssessment} className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-500">
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                <HiOutlineCheck className="h-5 w-5" />
              </div>
              <button type="button" onClick={() => setShowSubmitConfirm(false)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                <HiOutlineXMark className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Submit Assessment?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Once submitted, your assessment will be finalized and you will not be able to continue this attempt.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowSubmitConfirm(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Cancel
              </button>
              <button type="button" onClick={confirmFinalSubmit} disabled={submittingAssessment} className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60">
                {submittingAssessment ? 'Calculating Score...' : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
