export const jobProperty = {
  id: true,
  createdAt: true,
  title: true,
  major: true,
  keywords: true,
  requiredExperiences: true,
  workStyle: true,
  jobType: true,
  salaryRange: true,
  address: true,
  startDate: true,
  endDate: true,
};

export const jobSeekerProperty = {
  id: true,
  keywords: true,
  major: true,
  yearsExperience: true,
  experiences: true,
  savedJobs: { select: jobProperty },
};

export const applicationPropery = {
  id: true,
  createdAt: true,
  jobSeeker: {
    select: {
      yearsExperience: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      keywords: true,
      major: true,
    },
  },
  notes: true,
  status: true,
};
