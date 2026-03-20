import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '../constants/theme';
import { formatDisplayDate, getDateKey } from '../utils/date';

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  const [showPicker, setShowPicker] = useState(false);
  const dateValue = new Date(value);

  const shiftDate = (days: number) => {
    const nextDate = new Date(dateValue);
    nextDate.setDate(nextDate.getDate() + days);
    onChange(getDateKey(nextDate));
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    onChange(getDateKey(selectedDate));
  };

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={() => shiftDate(-1)} style={styles.smallButton}>
        <Text style={styles.smallButtonText}>Prev</Text>
      </Pressable>
      <Pressable onPress={() => setShowPicker(true)} style={styles.dateButton}>
        <Text style={styles.dateLabel}>{formatDisplayDate(value)}</Text>
      </Pressable>
      <Pressable onPress={() => onChange(getDateKey())} style={styles.smallButton}>
        <Text style={styles.smallButtonText}>Today</Text>
      </Pressable>
      <Pressable onPress={() => shiftDate(1)} style={styles.smallButton}>
        <Text style={styles.smallButtonText}>Next</Text>
      </Pressable>
      {showPicker ? (
        <DateTimePicker value={dateValue} mode="date" display="default" onChange={handleChange} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dateButton: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 150,
    paddingHorizontal: spacing.md,
  },
  dateLabel: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  smallButton: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  smallButtonText: {
    color: palette.ink,
    fontFamily: typography.heading,
    fontSize: 13,
    fontWeight: '700',
  },
});
