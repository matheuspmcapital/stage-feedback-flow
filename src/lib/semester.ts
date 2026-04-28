export const getSemesterLabel = (date: string | Date | null | undefined): string => {
  if (!date) return "--";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "--";
  const semester = d.getMonth() < 6 ? 1 : 2;
  return `${semester}S/${d.getFullYear()}`;
};

export const getCurrentSemesterLabel = (): string => getSemesterLabel(new Date());

export const buildSemesterOptions = (dates: (string | null | undefined)[]): string[] => {
  const set = new Set<string>();
  dates.forEach(d => {
    if (!d) return;
    const label = getSemesterLabel(d);
    if (label !== "--") set.add(label);
  });
  // Ensure current semester exists
  set.add(getCurrentSemesterLabel());
  return Array.from(set).sort((a, b) => {
    const [sa, ya] = a.split("S/");
    const [sb, yb] = b.split("S/");
    return Number(yb) - Number(ya) || Number(sb) - Number(sa);
  });
};
