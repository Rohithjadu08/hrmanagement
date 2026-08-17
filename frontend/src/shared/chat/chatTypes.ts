export type ChatRole = 'Engineering' | 'Sales' | 'HR' | 'Design' | 'Other'
export type OnboardingStage = 'Day 1' | 'Week 1' | 'Month 1'

export type ChatMessage = {
  id: string
  sender: 'user' | 'bot'
  text: string
  createdAt: number
}

