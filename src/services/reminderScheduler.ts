import notifee, { AndroidImportance, TriggerType, TimestampTrigger } from '@notifee/react-native';
import { PersonalCalendarEvent, ReminderPreference, TaskAssignment, TimetableEvent } from './timetableService';

const CHANNEL_ID = 'unibuddy-reminders';
const DAY_INDEX: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

const ensureChannel = async () => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'UniBuddy Reminders',
    importance: AndroidImportance.HIGH,
  });
};

const nextOccurrence = (event: TimetableEvent): Date | null => {
  const dayNum = DAY_INDEX[event.dayOfWeek];
  if (!dayNum) return null;

  const [hh, mm] = (event.startTime || '08:00').split(':').map(Number);
  const now = new Date();
  const date = new Date(now);

  const jsWeekday = now.getDay() === 0 ? 7 : now.getDay();
  const diffDays = (dayNum - jsWeekday + 7) % 7;
  date.setDate(now.getDate() + diffDays);
  date.setHours(hh || 8, mm || 0, 0, 0);

  if (date.getTime() < now.getTime()) {
    date.setDate(date.getDate() + 7);
  }
  return date;
};

export const clearScheduledReminders = async () => {
  const triggers = await notifee.getTriggerNotifications();
  for (const t of triggers) {
    if (
      t.notification?.id?.startsWith('class-') ||
      t.notification?.id?.startsWith('task-') ||
      t.notification?.id?.startsWith('personal-')
    ) {
      await notifee.cancelNotification(t.notification.id);
    }
  }
};

const scheduleAt = async (id: string, title: string, body: string, when: Date) => {
  if (when.getTime() <= Date.now()) return;
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: when.getTime(),
  };
  await notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
    },
    trigger
  );
};

export const scheduleClassRemindersForNextWeek = async (
  events: TimetableEvent[],
  prefs: ReminderPreference
) => {
  await ensureChannel();

  for (const event of events) {
    const classTime = nextOccurrence(event);
    if (!classTime) continue;

    if (classTime.getTime() - Date.now() > 7 * 24 * 60 * 60 * 1000) continue;

    const reminders = [
      { enabled: prefs.timetable24HoursEnabled, ms: 24 * 60 * 60 * 1000, suffix: '24h', label: 'Tomorrow' },
      { enabled: prefs.timetable2HoursEnabled, ms: 2 * 60 * 60 * 1000, suffix: '2h', label: 'In 2 hours' },
      { enabled: prefs.timetableStartEnabled, ms: 0, suffix: '0h', label: 'Starting now' },
    ];

    for (const r of reminders) {
      if (!r.enabled) continue;
      const at = new Date(classTime.getTime() - r.ms);
      await scheduleAt(
        `class-${event.id}-${r.suffix}`,
        `${event.moduleCode || event.moduleName}: ${r.label}`,
        `${event.activityType} at ${event.location}`,
        at
      );
    }
  }
};

export const scheduleTaskReminders = async (
  tasks: TaskAssignment[],
  prefs: ReminderPreference
) => {
  await ensureChannel();

  for (const task of tasks) {
    if (task.status === 'SUBMITTED') continue;
    const due = new Date(task.dueDateTime);
    if (Number.isNaN(due.getTime())) continue;

    const reminders = [
      { enabled: prefs.task7DaysEnabled, ms: 7 * 24 * 60 * 60 * 1000, suffix: '7d', label: 'in 7 days' },
      { enabled: prefs.task1DayEnabled, ms: 24 * 60 * 60 * 1000, suffix: '1d', label: 'Tomorrow' },
      { enabled: prefs.task2HoursEnabled, ms: 2 * 60 * 60 * 1000, suffix: '2h', label: 'in 2 hours' },
      { enabled: prefs.taskDeadlineEnabled, ms: 0, suffix: '0h', label: 'Deadline now!' },
    ];

    for (const r of reminders) {
      if (!r.enabled) continue;
      const at = new Date(due.getTime() - r.ms);
      await scheduleAt(
        `task-${task.id}-${r.suffix}`,
        `Task due: ${task.title}`,
        `${task.moduleCode || 'General'} deadline ${r.label} (${due.toLocaleString()})`,
        at
      );
    }
  }
};

export const schedulePersonalEventReminders = async (
  events: PersonalCalendarEvent[],
  prefs: ReminderPreference
) => {
  await ensureChannel();

  for (const event of events) {
    if (!event.date || !event.startTime) continue;
    const eventTime = new Date(`${event.date}T${event.startTime}`);
    
    if (Number.isNaN(eventTime.getTime())) continue;
    if (eventTime.getTime() <= Date.now()) continue;

    const reminders = [
      { enabled: prefs.timetable24HoursEnabled, ms: 24 * 60 * 60 * 1000, suffix: '24h', label: 'Tomorrow' },
      { enabled: prefs.timetable2HoursEnabled, ms: 2 * 60 * 60 * 1000, suffix: '2h', label: 'In 2 hours' },
    ];

    for (const r of reminders) {
      if (!r.enabled) continue;
      const at = new Date(eventTime.getTime() - r.ms);
      await scheduleAt(
        `personal-${event.id}-${r.suffix}`,
        `Upcoming: ${event.title}`,
        `${event.notes || 'Personal Event'}: ${r.label}`,
        at
      );
    }
  }
};


