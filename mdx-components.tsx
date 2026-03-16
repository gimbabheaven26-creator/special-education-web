import type { MDXComponents } from 'mdx/types'
import { MatchingExercise, FillBlank, StepGuide } from '@/components/mdx'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    MatchingExercise,
    FillBlank,
    StepGuide,
  }
}
