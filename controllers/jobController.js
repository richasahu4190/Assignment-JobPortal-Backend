const Job = require('../models/Job');
const {sendEmail} = require('../services/emailService');

exports.createJob = async (req, res) => {
  try {
    const { title, description, experienceLevel, candidates, endDate } = req.body;
    const companyId = req.user.id; // Assuming we have middleware that sets req.user

    const job = new Job({
      company: companyId,
      title,
      description,
      experienceLevel,
      candidates,
      endDate
    });

    await job.save();

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const companyId = req.user.id;
    const jobs = await Job.find({ company: companyId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this job' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { title, description, experienceLevel, candidates, endDate, isActive } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.experienceLevel = experienceLevel || job.experienceLevel;
    job.candidates = candidates || job.candidates;
    job.endDate = endDate || job.endDate;
    job.isActive = isActive !== undefined ? isActive : job.isActive;

    await job.save();
    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.remove();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

exports.sendJobAlerts = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate('company', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.company._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to send alerts for this job' });
    }

    const emailPromises = job.candidates.map(candidate => 
      sendEmail(
        candidate.email,
        `New Job Alert: ${job.title}`,
        `Dear ${candidate.name},

 We have a new job opportunity that might interest you:

 Title: ${job.title}
 Company: ${job.company.name}
 Experience Level: ${job.experienceLevel}
 Description: ${job.description}

 If you're interested, please apply before ${new Date(job.endDate).toLocaleDateString()}.

Best regards,
${job.company.name} Team`
      )
    );

    await Promise.all(emailPromises);

    res.json({ message: 'Job alerts sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending job alerts', error: error.message });
  }
};