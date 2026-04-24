type MarkedDateMap = Record<
  string,
  {
    disabled?: boolean;
    disableTouchEvent?: boolean;
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
    dotColor?: string;
  }
>;

export function normalizeAvailabilitySelection(
  selectedValue: string | null,
  availableValues: string[]
): string | null {
  if (!selectedValue) {
    return null;
  }

  return availableValues.includes(selectedValue) ? selectedValue : null;
}

export function buildCalendarMarkedDates(
  availableDates: string[],
  selectedDate: string | null
): MarkedDateMap {
  return availableDates.reduce<MarkedDateMap>((acc, date) => {
    acc[date] = {
      disabled: false,
      disableTouchEvent: false,
      selected: date === selectedDate,
      selectedColor: "#C2410C",
      selectedTextColor: "#FFFFFF",
      dotColor: "#C2410C",
    };

    return acc;
  }, {});
}

export function buildScheduledAtFromSelection(
  date: string | null,
  time: string | null
): Date {
  if (!date) {
    return new Date();
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = String(time ?? "00:00").split(":").map(Number);

  return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0, 0, 0);
}
