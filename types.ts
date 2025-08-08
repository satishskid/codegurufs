
export enum GradeLevel {
  JUNIOR = "JUNIOR", // Grades 4-6
  EXPLORER = "EXPLORER", // Grades 7-9
  PRO = "PRO" // Grades 10-12
}

export interface Topic {
  name: string;
  completed: boolean;
  duration: string;
}

export interface Curriculum {
  title: string;
  topics: Topic[];
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  isThinking?: boolean;
  meta?: {
    curriculum?: Curriculum;
  };
}

export interface TerminalInfo {
  schoolName: string;
  className: string;
  teacherName: string;
}

export type TerminalStatus = 'loading' | 'error' | 'unactivated' | 'activated';

export interface StudentProgress {
  grade: GradeLevel;
  curriculum: Curriculum;
  history: ChatMessage[];
}

// Actions that can be shown to the user after an AI response
export interface ContextualAction {
  label: string;
  // Prompt can be null for actions that don't send a message, e.g., just focusing the input.
  prompt: string | null;
}
