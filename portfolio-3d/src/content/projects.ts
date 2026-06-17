export interface Project {
  title:       string
  description: string
  tech:        string[]
  links:       { label: string; url: string }[]
  year:        number
}

export const PROJECTS: Project[] = [
  {
    title:       '3D Interactive Portfolio',
    description: 'This portfolio — a real-time 3D room built with Three.js and React Three Fiber. Features physics-based camera, per-object hover emission, and a demand-render loop that sleeps at rest.',
    tech:        ['Three.js', 'React Three Fiber', 'Next.js 15', 'Zustand', 'TypeScript'],
    links:       [{ label: 'GitHub', url: '#' }],
    year:        2025,
  },
  {
    title:       'Project Two',
    description: 'A description of your second project. Replace this with your real project data in src/content/projects.ts.',
    tech:        ['React', 'Node.js', 'PostgreSQL'],
    links:       [{ label: 'Live', url: '#' }, { label: 'GitHub', url: '#' }],
    year:        2024,
  },
  {
    title:       'Project Three',
    description: 'A description of your third project. Edit src/content/projects.ts to update all project data.',
    tech:        ['Python', 'FastAPI', 'Redis'],
    links:       [{ label: 'GitHub', url: '#' }],
    year:        2024,
  },
]
