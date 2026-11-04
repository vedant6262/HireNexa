const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateJob } = require('../middleware/validate');
const prisma = require('../config/prisma');
const { fetchJobs } = require('../services/arbeitnow');

router.get('/', async (req, res) => {
  try {
    const { search, location, employmentType, experience, workMode, salaryMin, salaryMax, skills, companyId, sort, page = 1, limit = 20 } = req.query;

    const where = { status: 'ACTIVE' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skills: { has: search } },
      ];
    }
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (employmentType) where.employmentType = employmentType;
    if (experience) where.experienceLevel = experience;
    if (workMode) where.workMode = workMode;
    if (salaryMin) where.salaryMin = { gte: parseFloat(salaryMin) };
    if (salaryMax) where.salaryMax = { lte: parseFloat(salaryMax) };
    if (skills) where.skills = { hasSome: skills.split(',') };
    if (companyId) where.companyId = companyId;

    const orderBy = {};
    if (sort === 'salary_high') orderBy.salaryMax = 'desc';
    else if (sort === 'salary_low') orderBy.salaryMin = 'asc';
    else if (sort === 'oldest') orderBy.createdAt = 'asc';
    else orderBy.createdAt = 'desc';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, logo: true, industry: true } },
          _count: { select: { applications: true } },
        },
        orderBy,
        skip,
        take: parseInt(limit),
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/external', async (req, res) => {
  try {
    const { search, location, remote, tags, page = 1, perPage = 20 } = req.query;
    const data = await fetchJobs({
      page: parseInt(page),
      perPage: parseInt(perPage),
      search,
      location,
      remote: remote !== undefined ? remote === 'true' : undefined,
      tags,
    });
    res.json(data);
  } catch (error) {
    console.error('External jobs error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/mine', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId }, include: { company: true } });
    const jobs = await prisma.job.findMany({
      where: user.role === 'ADMIN' ? {} : { companyId: user.company?.id || '__none__' },
      include: { company: { select: { id: true, name: true, logo: true } }, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
    });

    if (!job) return res.status(404).json({ error: 'Job not found' });

    await prisma.job.update({ where: { id: req.params.id }, data: { viewCount: { increment: 1 } } });

    const similarJobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: job.id },
        OR: [
          { skills: { hasSome: job.skills } },
          { employmentType: job.employmentType },
          { experienceLevel: job.experienceLevel },
        ],
      },
      include: { company: { select: { id: true, name: true, logo: true } } },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ job, similarJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, requireRole('RECRUITER', 'ADMIN'), validateJob, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const company = await prisma.company.findUnique({ where: { recruiterId: user.id } });

    if (!company) return res.status(400).json({ error: 'Please create a company profile first' });

    const { title, description, requirements, responsibilities, benefits, location, salaryMin, salaryMax, employmentType, experienceLevel, workMode, skills } = req.body;

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    const job = await prisma.job.create({
      data: {
        title, slug, description, requirements, responsibilities, benefits,
        location, salaryMin: salaryMin ? parseFloat(salaryMin) : null, salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        employmentType, experienceLevel, workMode, skills,
        companyId: company.id,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id }, include: { company: true } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    if (job.company.recruiterId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, description, requirements, responsibilities, benefits, location, salaryMin, salaryMax, employmentType, experienceLevel, workMode, skills, status } = req.body;

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: { title, description, requirements, responsibilities, benefits, location, salaryMin, salaryMax, employmentType, experienceLevel, workMode, skills, status },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id }, include: { company: true } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    if (job.company.recruiterId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
