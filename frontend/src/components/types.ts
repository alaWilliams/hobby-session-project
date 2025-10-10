export interface Session {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  maxParticipants: number;
  isPublic: number;
  managementCode?: string;
  privateCode?: string;
  currentParticipants?: number;
}

export interface Participant {
  id: number;
  sessionId: number;
  name: string;
  attendanceCode: string;
}

export interface Form {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  maxParticipants: number;
  isPublic: boolean;
}