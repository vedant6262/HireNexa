const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const { requireAuth, clerkClient } = require('../middleware/auth');
const prisma = require('../config/prisma');
const { uploadToCloudinary } = require('../config/cloudinary');

const resumeDirectory = path.join(__dirname, '../../uploads/resumes');

router.get('/me', requireAuth, async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: req.userId },
      include: {
        skills: true,
        education: { orderBy: { startDate: 'desc' } },
        experience: { orderBy: { startDate: 'desc' } },
        projects: true,
        certificates: true,
        company: true,
        _count: {
          select: {
            applications: true,
            savedJobs: true,
            notifications: { where: { read: false } },
          },
        },
      },
    });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(req.userId);
      const metadataRole = String(clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role || '').toUpperCase();
      const role = metadataRole === 'RECRUITER' ? 'RECRUITER' : 'CANDIDATE';
      user = await prisma.user.create({
        data: {
          clerkId: req.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          avatarUrl: clerkUser.imageUrl,
          role,
        },
        include: {
          skills: true,
          education: true,
          experience: true,
          projects: true,
          certificates: true,
          company: true,
        },
      });
    } else {
      const clerkUser = await clerkClient.users.getUser(req.userId);
      const metadataRole = String(clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role || '').toUpperCase();
      if (metadataRole === 'RECRUITER' && user.role === 'CANDIDATE') {
        user = await prisma.user.update({ where: { id: user.id }, data: { role: 'RECRUITER' }, include: { skills: true, education: true, experience: true, projects: true, certificates: true, company: true } });
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/activate-recruiter', requireAuth, async (req, res) => {
  try {
    let user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    if (user) {
      user = await prisma.user.update({ where: { id: user.id }, data: { role: 'RECRUITER' } });
    } else {
      const clerkUser = await clerkClient.users.getUser(req.userId);
      user = await prisma.user.create({
        data: {
          clerkId: req.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          avatarUrl: clerkUser.imageUrl,
          role: 'RECRUITER',
        },
      });
    }
    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, phone, location, headline, bio } = req.body;
    if (!String(firstName || '').trim()) return res.status(400).json({ error: 'First name is required' });
    const user = await prisma.user.update({
      where: { clerkId: req.userId },
      data: { firstName, lastName, phone, location, headline, bio, isOnboarded: true },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/avatar', requireAuth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image || !String(image).startsWith('data:image/')) return res.status(400).json({ error: 'A valid image is required' });
    const avatarUrl = await uploadToCloudinary(image, 'jobportal/avatars');
    const user = await prisma.user.update({ where: { clerkId: req.userId }, data: { avatarUrl } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/avatar', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.update({ where: { clerkId: req.userId }, data: { avatarUrl: null } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/skills', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const skill = await prisma.skill.create({
      data: { name, userId: user.id },
    });
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/skills/:id', requireAuth, async (req, res) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.json({ message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/education', requireAuth, async (req, res) => {
  try {
    const { school, degree, field, startDate, endDate, grade, description } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const education = await prisma.education.create({
      data: { school, degree, field, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, grade, description, userId: user.id },
    });
    res.json(education);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/experience', requireAuth, async (req, res) => {
  try {
    const { company, title, location, startDate, endDate, current, description } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const experience = await prisma.experience.create({
      data: { company, title, location, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, current, description, userId: user.id },
    });
    res.json(experience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/projects', requireAuth, async (req, res) => {
  try {
    const { name, description, url, technologies } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const project = await prisma.project.create({
      data: { name, description, url, technologies, userId: user.id },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/certificates', requireAuth, async (req, res) => {
  try {
    const { name, issuer, url, issueDate, expiryDate } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    const certificate = await prisma.certificate.create({
      data: { name, issuer, url, issueDate: new Date(issueDate), expiryDate: expiryDate ? new Date(expiryDate) : null, userId: user.id },
    });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/resume/:fileId', requireAuth, async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!/^[0-9a-f-]{36}$/i.test(fileId)) return res.status(404).json({ error: 'Resume not found' });
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    if (!user) return res.status(404).json({ error: 'Resume not found' });
    const resumeUrl = `local://resume/${fileId}`;
    const ownsResume = user.resumeUrl === resumeUrl;
    const applicationWhere = {
      resumeUrl,
      ...(user.role === 'ADMIN' ? {} : user.role === 'RECRUITER' ? { job: { company: { recruiterId: user.id } } } : { userId: user.id }),
    };
    const application = ownsResume ? true : await prisma.application.findFirst({ where: applicationWhere, select: { id: true } });
    if (!application) return res.status(403).json({ error: 'You are not allowed to view this resume' });
    res.type('application/pdf').sendFile(path.join(resumeDirectory, `${fileId}.pdf`));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/resume', requireAuth, async (req, res) => {
  try {
    let { resumeUrl, file } = req.body;
    if (file) {
      if (!String(file).startsWith('data:application/pdf;base64,')) return res.status(400).json({ error: 'Resume must be a PDF file' });
      const fileBuffer = Buffer.from(file.slice(file.indexOf(',') + 1), 'base64');
      if (fileBuffer.length > 7 * 1024 * 1024) return res.status(413).json({ error: 'Resume must be 7 MB or smaller' });
      if (fileBuffer.subarray(0, 5).toString() !== '%PDF-') return res.status(400).json({ error: 'The selected file is not a valid PDF' });
      try {
        resumeUrl = await uploadToCloudinary(file, 'jobportal/resumes');
      } catch (uploadError) {
        if (process.env.NODE_ENV === 'production') throw uploadError;
        const fileId = randomUUID();
        await fs.mkdir(resumeDirectory, { recursive: true });
        await fs.writeFile(path.join(resumeDirectory, `${fileId}.pdf`), fileBuffer);
        resumeUrl = `local://resume/${fileId}`;
      }
    }
    if (!resumeUrl) return res.status(400).json({ error: 'A resume file is required' });
    const user = await prisma.user.update({
      where: { clerkId: req.userId },
      data: { resumeUrl },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
