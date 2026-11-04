const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const prisma = require('../config/prisma');

router.get('/me', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId }, include: { company: true } });
    res.json(user.company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, industry } = req.query;
    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (industry) where.industry = industry;

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: { select: { jobs: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        jobs: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } },
        reviews: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const { name, description, website, industry, size, headquarters, founded, benefits } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });

    const existingCompany = await prisma.company.findUnique({ where: { recruiterId: user.id } });
    if (existingCompany) return res.status(400).json({ error: 'You already have a company profile' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const company = await prisma.company.create({
      data: { name, slug, description, website, industry, size, headquarters, founded, benefits: benefits || [], recruiterId: user.id },
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const company = await prisma.company.findUnique({ where: { id: req.params.id } });

    if (!company) return res.status(404).json({ error: 'Company not found' });
    if (company.recruiterId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, description, logo, coverImage, website, industry, size, headquarters, founded, benefits } = req.body;
    const updated = await prisma.company.update({
      where: { id: req.params.id },
      data: { name, description, logo, coverImage, website, industry, size, headquarters, founded, benefits },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const company = await prisma.company.findUnique({ where: { id: req.params.id } });

    if (!company) return res.status(404).json({ error: 'Company not found' });
    if (company.recruiterId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.company.delete({ where: { id: req.params.id } });
    res.json({ message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
