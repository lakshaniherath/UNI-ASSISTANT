import { api } from './api';

export interface TimetableEvent {
  id: string;
  batchType: 'WD' | 'WE' | string;
  mainGroup: string;
  subgroup: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  moduleCode: string;
  moduleName: string;
  activityType: 'LECTURE' | 'TUTORIAL' | 'PRACTICAL' | 'OTHER' | string;
  location: string;
  lecturer: string;
}

export interface TimetableRecoveryResponse {
  originalEvent: TimetableEvent;
  alternatives: TimetableEvent[];
}

export interface ReminderPreference {
  id?: number;
  universityId?: string;
  classRemindersEnabled: boolean;
  beforeMinutesPrimary: number;
  beforeMinutesSecondary: number;
  deadline7DaysEnabled: boolean;
  deadline1DayEnabled: boolean;
  deadline1HourEnabled: boolean;
}

export interface PersonalCalendarEvent {
  id?: number;
  title: string;
  notes?: string;
  date: string;
  startTime: string;
  endTime: string;
  colorTag?: string;
}

export interface TaskAssignment {
  id?: number;
  title: string;
  moduleCode?: string;
  dueDateTime: string;
  status: 'PENDING' | 'SUBMITTED';
  notes?: string;
}

export const fetchTimetable = async (subgroup: string): Promise<TimetableEvent[]> => {
  const res = await api.get(`/timetable/${encodeURIComponent(subgroup)}`);
  return res.data || [];
};

export const fetchRecoverySuggestions = async (
  studentSubgroup: string,
  missedEventId: string
): Promise<TimetableRecoveryResponse> => {
  const res = await api.post('/timetable/recovery', {
    studentSubgroup,
    missedEventId,
    mode: 'MISSED',
  });
  return res.data;
};

export const getReminderPreferences = async (universityId: string): Promise<ReminderPreference> => {
  const res = await api.get('/reminders/preferences', { params: { universityId } });
  return res.data;
};

export const updateReminderPreferences = async (
  universityId: string,
  payload: ReminderPreference
): Promise<ReminderPreference> => {
  const res = await api.put('/reminders/preferences', payload, { params: { universityId } });
  return res.data;
};

export const getPersonalEvents = async (universityId: string): Promise<PersonalCalendarEvent[]> => {
  const res = await api.get('/calendar/personal', { params: { universityId } });
  return res.data || [];
};

export const createPersonalEvent = async (
  universityId: string,
  payload: PersonalCalendarEvent
): Promise<PersonalCalendarEvent> => {
  const res = await api.post('/calendar/personal', payload, { params: { universityId } });
  return res.data;
};

export const updatePersonalEvent = async (
  universityId: string,
  id: number,
  payload: PersonalCalendarEvent
): Promise<PersonalCalendarEvent> => {
  const res = await api.put(`/calendar/personal/${id}`, payload, { params: { universityId } });
  return res.data;
};

export const deletePersonalEvent = async (universityId: string, id: number): Promise<void> => {
  await api.delete(`/calendar/personal/${id}`, { params: { universityId } });
};

export const getTasks = async (universityId: string): Promise<TaskAssignment[]> => {
  const res = await api.get('/tasks', { params: { universityId } });
  return res.data || [];
};

export const createTask = async (universityId: string, payload: TaskAssignment): Promise<TaskAssignment> => {
  const res = await api.post('/tasks', payload, { params: { universityId } });
  return res.data;
};

export const updateTask = async (
  universityId: string,
  id: number,
  payload: TaskAssignment
): Promise<TaskAssignment> => {
  const res = await api.put(`/tasks/${id}`, payload, { params: { universityId } });
  return res.data;
};

export const deleteTask = async (universityId: string, id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`, { params: { universityId } });
};
