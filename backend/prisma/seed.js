const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@jobportal.com' },
    update: {},
    create: {
      email: 'admin@jobportal.com',
      clerkId: 'admin_clerk_id',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Admin user created:', adminUser.id);

  await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      clerkId: 'mock-user-1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CANDIDATE',
      isVerified: true,
    },
  });

  const techSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL', 'Figma'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Remote', 'London, UK', 'Berlin, DE', 'Austin, TX', 'Seattle, WA'];
  const jobTitles = ['Senior React Developer', 'Full Stack Engineer', 'Product Designer', 'Data Scientist', 'DevOps Engineer', 'Frontend Developer', 'Backend Engineer', 'UI/UX Designer'];
  const companies = ['TechCorp', 'DataFlow', 'DesignHub', 'AI Labs', 'CloudNine', 'WebWizards', 'ServerStack', 'PixelPerfect'];

  for (let i = 0; i < companies.length; i++) {
    const recruiter = await prisma.user.upsert({
      where: { email: `recruiter${i + 1}@${companies[i].toLowerCase()}.com` },
      update: {},
      create: {
        email: `recruiter${i + 1}@${companies[i].toLowerCase()}.com`,
        clerkId: `recruiter_clerk_${i + 1}`,
        firstName: `Recruiter`,
        lastName: `${i + 1}`,
        role: 'RECRUITER',
        isVerified: true,
      },
    });

    const company = await prisma.company.upsert({
      where: { slug: companies[i].toLowerCase() },
      update: {},
      create: {
        name: companies[i],
        slug: companies[i].toLowerCase(),
        description: `${companies[i]} is a leading company in the technology sector, known for innovation and great workplace culture.`,
        website: `https://${companies[i].toLowerCase()}.com`,
        industry: ['Technology', 'Data Science', 'Design', 'AI', 'Cloud Computing', 'Web Development', 'Infrastructure', 'Design'][i],
        size: `${(i + 1) * 100}-${(i + 2) * 500} employees`,
        headquarters: locations[i % locations.length],
        founded: `${2015 + i}`,
        benefits: ['Health Insurance', 'Remote Work', 'Stock Options', 'Learning Budget'],
        verified: true,
        recruiterId: recruiter.id,
      },
    });

    for (let j = 0; j < 3; j++) {
      const title = jobTitles[(i + j) % jobTitles.length];
      await prisma.job.upsert({
        where: { slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}-${j}` },
        update: {},
        create: {
          title,
          slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}-${j}`,
          description: `We are looking for an experienced ${title} to join our growing team at ${company.name}. You will work on cutting-edge projects and collaborate with talented engineers.`,
          requirements: '• 3+ years of experience\n• Strong problem-solving skills\n• Excellent communication\n• Team player',
          location: locations[(i + j) % locations.length],
          salaryMin: 80000 + (i * 10000) + (j * 5000),
          salaryMax: 150000 + (i * 15000) + (j * 10000),
          employmentType: ['Full-time', 'Full-time', 'Contract', 'Part-time'][j],
          experienceLevel: ['Mid-Level', 'Senior', 'Senior', 'Junior'][j],
          workMode: ['Remote', 'Hybrid', 'On-site', 'Remote'][j],
          skills: [techSkills[(i + j) % techSkills.length], techSkills[(i + j + 1) % techSkills.length], techSkills[(i + j + 2) % techSkills.length]],
          status: 'ACTIVE',
          companyId: company.id,
        },
      });
    }
  }

  const demoCompany = await prisma.company.findUnique({ where: { slug: 'techcorp' } });
  const demoJobs = [
    { slug: 'hirenexa-demo-software-engineer-pune', title: 'Software Engineer', location: 'Pune', experienceLevel: 'Mid-Level', employmentType: 'Full-time', salaryMin: 800000, salaryMax: 1400000, skills: ['JavaScript', 'Node.js', 'PostgreSQL'] },
    { slug: 'hirenexa-demo-data-analyst-mumbai', title: 'Data Analyst', location: 'Mumbai', experienceLevel: 'Entry-Level', employmentType: 'Full-time', salaryMin: 500000, salaryMax: 850000, skills: ['SQL', 'Excel', 'Python'] },
    { slug: 'hirenexa-demo-frontend-developer-noida', title: 'Frontend Developer', location: 'Noida', experienceLevel: 'Mid-Level', employmentType: 'Full-time', salaryMin: 700000, salaryMax: 1200000, skills: ['React', 'TypeScript', 'CSS'] },
    { slug: 'hirenexa-demo-hr-executive-gurugram', title: 'HR Executive', location: 'Gurugram', experienceLevel: 'Entry-Level', employmentType: 'Full-time', salaryMin: 400000, salaryMax: 650000, skills: ['Recruitment', 'Communication', 'HR Operations'] },
    { slug: 'hirenexa-demo-digital-marketer-hyderabad', title: 'Digital Marketing Specialist', location: 'Hyderabad', experienceLevel: 'Mid-Level', employmentType: 'Full-time', salaryMin: 600000, salaryMax: 1000000, skills: ['SEO', 'Google Analytics', 'Content Marketing'] },
    { slug: 'hirenexa-demo-product-designer-bengaluru', title: 'Product Designer', location: 'Bengaluru', experienceLevel: 'Mid-Level', employmentType: 'Full-time', salaryMin: 900000, salaryMax: 1600000, skills: ['Figma', 'Prototyping', 'Design Systems'] },
    { slug: 'hirenexa-demo-backend-developer-pune', title: 'Backend Developer', location: 'Pune', experienceLevel: 'Senior', employmentType: 'Full-time', salaryMin: 1200000, salaryMax: 2000000, skills: ['Java', 'Spring Boot', 'AWS'] },
    { slug: 'hirenexa-demo-sales-associate-mumbai', title: 'Sales Associate', location: 'Mumbai', experienceLevel: 'Entry-Level', employmentType: 'Full-time', salaryMin: 350000, salaryMax: 650000, skills: ['Sales', 'Negotiation', 'CRM'] },
    { slug: 'hirenexa-demo-business-analyst-noida', title: 'Business Analyst', location: 'Noida', experienceLevel: 'Mid-Level', employmentType: 'Full-time', salaryMin: 800000, salaryMax: 1300000, skills: ['Business Analysis', 'SQL', 'Stakeholder Management'] },
    { slug: 'hirenexa-demo-customer-success-gurugram', title: 'Customer Success Executive', location: 'Gurugram', experienceLevel: 'Entry-Level', employmentType: 'Full-time', salaryMin: 450000, salaryMax: 750000, skills: ['Customer Success', 'Communication', 'SaaS'] },
    { slug: 'hirenexa-demo-qa-engineer-hyderabad', title: 'QA Engineer', location: 'Hyderabad', experienceLevel: 'Mid-Level', employmentType: 'Full-time', salaryMin: 700000, salaryMax: 1200000, skills: ['Test Automation', 'Playwright', 'API Testing'] },
    { slug: 'hirenexa-demo-ux-designer-bengaluru', title: 'UX Designer', location: 'Bengaluru', experienceLevel: 'Mid-Level', employmentType: 'Full-time', salaryMin: 850000, salaryMax: 1500000, skills: ['UX Research', 'Figma', 'Wireframing'] },
  ];

  for (const job of demoJobs) {
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {},
      create: {
        ...job,
        description: `Join ${demoCompany.name} as a ${job.title} in ${job.location}. Work with a collaborative team on products used by customers across India.`,
        requirements: `Relevant experience for a ${job.experienceLevel.toLowerCase()} role. Strong ${job.skills.slice(0, 2).join(' and ')} skills and clear communication.`,
        responsibilities: `Deliver high-quality ${job.title.toLowerCase()} work, collaborate with your team, and contribute to shared project goals.`,
        benefits: 'Health insurance, learning budget, and flexible work options.',
        salaryCurrency: 'INR',
        workMode: 'Hybrid',
        status: 'ACTIVE',
        companyId: demoCompany.id,
      },
    });
  }

  const interviewCompanies = [
    'Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Infosys', 'TCS', 'Wipro',
    'Accenture', 'Deloitte', 'Cognizant', 'Capgemini', 'JPMorgan Chase', 'Goldman Sachs',
    'NVIDIA', 'Qualcomm', 'Adobe', 'Oracle', 'Cisco', 'IBM',
  ];
  const questionTemplates = [
    ['Two Sum', 'Given an array of integers and a target, return the indices of two numbers that add up to the target.', 'Arrays', 'Easy'],
    ['Longest Substring Without Repeating Characters', 'Find the length of the longest substring without repeating characters.', 'Strings', 'Medium'],
    ['Merge Intervals', 'Merge all overlapping intervals in a collection of intervals.', 'Sorting', 'Medium'],
    ['LRU Cache', 'Design a cache that removes the least recently used item when capacity is reached.', 'Design', 'Hard'],
    ['Number of Islands', 'Count the number of islands in a two-dimensional grid of land and water.', 'Graphs', 'Medium'],
  ];

  for (const companyName of interviewCompanies) {
    const interviewCompany = await prisma.interviewCompany.upsert({
      where: { name: companyName },
      update: {},
      create: {
        name: companyName,
        description: `${companyName} interview preparation questions and practice topics.`,
        website: `https://www.${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`,
      },
    });
  }

  const seededInterviewCompanies = await prisma.interviewCompany.findMany({ where: { name: { in: interviewCompanies } } });
  const interviewRows = seededInterviewCompanies.flatMap(company => questionTemplates.map(([title, question, topic, difficulty]) => ({
    companyId: company.id,
    title,
    role: 'Software Engineer',
    question,
    topic,
    difficulty,
    questionType: 'DSA',
    source: 'Curated original starter catalog; expand with a licensed open dataset before production import.',
    frequency: 'Common',
    recency: '2026',
  })));
  await prisma.interviewQuestion.createMany({ data: interviewRows, skipDuplicates: true });

  const aptitudeQuestions = [
    { category: 'quantitative', topic: 'Percentages', question: 'A shirt marked at Rs. 800 is sold for Rs. 680. What is the discount percentage?', a: '10%', b: '12%', c: '15%', d: '18%', correct: 'C', explanation: 'Discount is 800 - 680 = 120. Therefore, discount percentage is 120/800 x 100 = 15%.', difficulty: 'easy' },
    { category: 'quantitative', topic: 'Profit and Loss', question: 'An article bought for Rs. 800 is sold for Rs. 960. What is the profit percentage?', a: '15%', b: '20%', c: '25%', d: '30%', correct: 'B', explanation: 'Profit is 160. Profit percentage is 160/800 x 100 = 20%.', difficulty: 'easy' },
    { category: 'quantitative', topic: 'Simple Interest', question: 'What is the simple interest on Rs. 5,000 at 8% per annum for 2 years?', a: 'Rs. 400', b: 'Rs. 600', c: 'Rs. 800', d: 'Rs. 1,000', correct: 'C', explanation: 'SI = P x R x T / 100 = 5000 x 8 x 2 / 100 = Rs. 800.', difficulty: 'easy' },
    { category: 'quantitative', topic: 'Ratio and Proportion', question: 'If A:B = 3:5 and B:C = 10:7, then A:C is:', a: '3:7', b: '6:7', c: '7:6', d: '10:21', correct: 'B', explanation: 'Make B equal: 3:5 becomes 6:10, so A:C = 6:7.', difficulty: 'medium' },
    { category: 'quantitative', topic: 'Time, Speed and Distance', question: 'A train travels 360 km in 4 hours. What is its average speed?', a: '80 km/h', b: '90 km/h', c: '100 km/h', d: '120 km/h', correct: 'B', explanation: 'Average speed = distance/time = 360/4 = 90 km/h.', difficulty: 'easy' },
    { category: 'quantitative', topic: 'Probability', question: 'A fair die is rolled once. What is the probability of getting an even number?', a: '1/6', b: '1/3', c: '1/2', d: '2/3', correct: 'C', explanation: 'There are three even outcomes (2, 4, 6) out of six outcomes, so probability is 3/6 = 1/2.', difficulty: 'easy' },
    { category: 'logical', topic: 'Number Series', question: 'Find the next number: 2, 6, 12, 20, 30, ?', a: '36', b: '40', c: '42', d: '44', correct: 'C', explanation: 'The terms are n(n+1): 1x2, 2x3, 3x4, 4x5, 5x6, so next is 6x7 = 42.', difficulty: 'medium' },
    { category: 'logical', topic: 'Coding-Decoding', question: 'If CAT is coded as DBU, how is DOG coded using the same pattern?', a: 'EPH', b: 'EOG', c: 'DPH', d: 'FPH', correct: 'A', explanation: 'Each letter is shifted one position forward: D->E, O->P, G->H.', difficulty: 'easy' },
    { category: 'logical', topic: 'Direction Sense', question: 'A person walks 5 m north, then 3 m east. In which direction are they from the start?', a: 'North-west', b: 'South-east', c: 'North-east', d: 'South-west', correct: 'C', explanation: 'Moving north and east places the person to the north-east of the starting point.', difficulty: 'easy' },
    { category: 'logical', topic: 'Syllogisms', question: 'Statements: All analysts are readers. Some readers are writers. Which conclusion is certain?', a: 'All writers are analysts', b: 'Some analysts are writers', c: 'All analysts are readers', d: 'No readers are analysts', correct: 'C', explanation: 'The first statement directly establishes that all analysts are readers.', difficulty: 'medium' },
    { category: 'verbal', topic: 'Synonyms', question: 'Choose the word closest in meaning to "abundant".', a: 'Scarce', b: 'Plentiful', c: 'Fragile', d: 'Brief', correct: 'B', explanation: 'Abundant means existing in large quantities, or plentiful.', difficulty: 'easy' },
    { category: 'verbal', topic: 'Antonyms', question: 'Choose the opposite of "transparent".', a: 'Clear', b: 'Visible', c: 'Opaque', d: 'Bright', correct: 'C', explanation: 'Opaque describes something that does not allow light or visibility through it.', difficulty: 'easy' },
    { category: 'verbal', topic: 'Sentence Correction', question: 'Choose the grammatically correct sentence.', a: 'She do not like tea.', b: 'She does not likes tea.', c: 'She does not like tea.', d: 'She not does like tea.', correct: 'C', explanation: 'With the singular subject she, use does not followed by the base verb like.', difficulty: 'easy' },
    { category: 'verbal', topic: 'Fill in the Blanks', question: 'The manager was pleased ___ the team performance.', a: 'at', b: 'with', c: 'on', d: 'for', correct: 'B', explanation: 'The standard collocation is pleased with something.', difficulty: 'easy' },
    { category: 'verbal', topic: 'Grammar', question: 'Identify the correctly punctuated sentence.', a: 'However I continued working.', b: 'However, I continued working.', c: 'However I, continued working.', d: 'However; I continued working.', correct: 'B', explanation: 'An introductory however is followed by a comma.', difficulty: 'medium' },
  ];

  const seededCompanies = await prisma.interviewCompany.findMany({ where: { name: { in: interviewCompanies } } });
  const aptitudeRows = seededCompanies.flatMap(company => aptitudeQuestions.map(item => ({
    companyId: company.id,
    category: item.category,
    topic: item.topic,
    question: item.question,
    optionA: item.a,
    optionB: item.b,
    optionC: item.c,
    optionD: item.d,
    correctAnswer: item.correct,
    explanation: item.explanation,
    difficulty: item.difficulty,
    source: 'Original curated practice question',
  })));
  await prisma.aptitudeQuestion.createMany({ data: aptitudeRows, skipDuplicates: true });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
