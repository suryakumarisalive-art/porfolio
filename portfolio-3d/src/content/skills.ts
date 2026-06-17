export interface SkillGroup {
  category: string
  items:    string[]
}

export const SKILLS: SkillGroup[] = [
  {
    category: 'Frontend',
    items:     ['TypeScript', 'React', 'Next.js', 'Three.js', 'React Three Fiber', 'CSS'],
  },
  {
    category: 'Backend',
    items:     ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'GraphQL', 'REST'],
  },
  {
    category: 'Tools & Infra',
    items:     ['Git', 'Docker', 'CI/CD', 'AWS', 'Vercel', 'Linux'],
  },
  {
    category: '3D & Graphics',
    items:     ['WebGL', 'GLSL', 'Blender', 'GLTF', 'Draco', 'Shader programming'],
  },
]
