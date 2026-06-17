// Path to resume PDF — place the file in /public/resume.pdf
export const RESUME_PDF_PATH = '/resume.pdf'

export interface Experience {
  company:     string
  role:        string
  period:      string
  description: string
}

export const EXPERIENCE: Experience[] = [
  {
    company:     'Company Name',
    role:        'Senior Software Engineer',
    period:      '2023 – Present',
    description: 'Led development of a real-time data platform serving 50k+ users. Edit src/content/resume.ts to update experience.',
  },
  {
    company:     'Previous Company',
    role:        'Software Engineer',
    period:      '2021 – 2023',
    description: 'Built and shipped three major product features. Edit src/content/resume.ts with your real experience.',
  },
]
