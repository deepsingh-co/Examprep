export const startOfLocalDay = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const daysBetween = (a, b) =>
  Math.round((startOfLocalDay(b) - startOfLocalDay(a)) / 86400000);

export const planStartDate = (plan) =>
  new Date(plan?.start_date || plan?.createdAt || Date.now());

// Pick the plan the student should actually be following today:
// prefer one whose day-range covers today, then the nearest upcoming exam.
export const getActivePlan = (plans) => {
  const upcoming = (plans || []).filter(
    (p) => new Date(p.exam_date) >= startOfLocalDay(new Date())
  );
  if (upcoming.length === 0) return null;

  const today = startOfLocalDay(new Date());
  const inProgress = upcoming.filter((p) => {
    const start = planStartDate(p);
    const total = p?.plan_data?.days?.length || 0;
    const end = new Date(start.getTime() + (total - 1) * 86400000);
    return start <= today && today <= end;
  });

  const pool = inProgress.length > 0 ? inProgress : upcoming;
  return pool.sort(
    (a, b) => new Date(a.exam_date) - new Date(b.exam_date)
  )[0];
};

export const dayNumber = (day, i) => day?.day || i + 1;

// Single source of truth for plan progress/status used by dashboard + planner.
export const planInfo = (plan) => {
  const days = plan?.plan_data?.days || [];
  const start = planStartDate(plan);
  const todayIdx = daysBetween(start, new Date());
  const completed = new Set(plan?.completed_days || []);

  const statuses = days.map((d, i) => {
    const no = dayNumber(d, i);
    if (completed.has(no)) return "done";
    if (i < todayIdx) return "missed";
    if (i === todayIdx) return "today";
    return "upcoming";
  });

  const done = statuses.filter((s) => s === "done").length;
  const missed = statuses.filter((s) => s === "missed").length;
  const todayDay =
    todayIdx >= 0 && todayIdx < days.length ? days[todayIdx] : null;

  return {
    days,
    start,
    todayIdx,
    statuses,
    done,
    missed,
    total: days.length,
    pct: days.length ? Math.round((done / days.length) * 100) : 0,
    todayDay,
    todayNumber: todayDay ? dayNumber(todayDay, todayIdx) : null,
  };
};

export const notifyOnceToday = (toastFn, message, options = {}) => {
  const key = `notify_${startOfLocalDay().toISOString().slice(0, 10)}`;
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, "1");
  } catch {
    // storage unavailable — still show the notification
  }
  toastFn(message, { duration: 10000, icon: "📅", ...options });
  return true;
};
