import React from 'react';
import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingHorizontal: 32,
    paddingBottom: 48,
    fontFamily: 'Helvetica',
    color: '#111827'
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    textTransform: 'uppercase'
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 9,
    color: '#4B5563'
  },
  monthGrid: {
    marginTop: 32,
    width: 520,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  monthCard: {
    width: 160,
    marginRight: 10,
    marginBottom: 14
  },
  monthTitle: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  weekdayCell: {
    width: 16,
    textAlign: 'center',
    fontSize: 7,
    color: '#111827'
  },
  weekRow: {
    flexDirection: 'row'
  },
  dayCell: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  dayText: {
    fontSize: 7.5,
    color: '#111827'
  },
  dayMarked: {
    backgroundColor: '#E5E7EB'
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 32,
    right: 32,
    textAlign: 'center',
    fontSize: 8,
    color: '#6B7280'
  },
  footerLink: {
    color: '#111827',
    textDecoration: 'underline'
  }
});

const buildMonthWeeks = ({ year, month, getDateStr, isMarkedDay }) => {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid = [];
  let dayNumber = 1 - startOffset;

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        week.push(null);
      } else {
        const date = new Date(year, month, dayNumber);
        const dateStr = getDateStr(date);
        week.push({
          day: dayNumber,
          isMarked: isMarkedDay(date, dateStr)
        });
      }
      dayNumber += 1;
    }
    grid.push(week);
  }

  return grid.map((week, weekIndex) =>
    week.map((dayData, dayIndex) => {
      if (!dayData || !dayData.isMarked) {
        return dayData;
      }
      const left = week[dayIndex - 1];
      const right = week[dayIndex + 1];
      const up = grid[weekIndex - 1]?.[dayIndex];
      const down = grid[weekIndex + 1]?.[dayIndex];
      const hasLeftSame = left?.isMarked;
      const hasRightSame = right?.isMarked;
      const hasUpSame = up?.isMarked;
      const hasDownSame = down?.isMarked;

      return {
        ...dayData,
        rounded: {
          tl: !hasLeftSame && !hasUpSame,
          tr: !hasRightSame && !hasUpSame,
          bl: !hasLeftSame && !hasDownSame,
          br: !hasRightSame && !hasDownSame
        }
      };
    })
  );
};

const CalendarPdfDocument = ({
  year,
  daysUnassigned,
  siteUrl,
  getDateStr,
  isMarkedDay
}) => {
  const months = Array.from({ length: 12 }, (_, month) => ({
    name: MONTH_NAMES[month],
    weeks: buildMonthWeeks({
      year,
      month,
      getDateStr,
      isMarkedDay
    })
  }));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Vacaciones {year}</Text>
        {daysUnassigned > 0 && (
          <Text style={styles.subtitle}>
            Recuerda que aún tienes {daysUnassigned} día{daysUnassigned === 1 ? '' : 's'} disponibles para gastar cuando más te apetezca
          </Text>
        )}
        <View style={styles.monthGrid}>
          {months.map((month) => (
            <View key={month.name} style={styles.monthCard}>
              <Text style={styles.monthTitle}>{month.name}</Text>
              <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map((label) => (
                  <Text key={`${month.name}-${label}`} style={styles.weekdayCell}>
                    {label}
                  </Text>
                ))}
              </View>
              {month.weeks.map((week, weekIndex) => (
                <View key={`${month.name}-week-${weekIndex}`} style={styles.weekRow}>
                  {week.map((dayData, dayIndex) => {
                    const roundedStyle = dayData?.rounded
                      ? {
                          borderTopLeftRadius: dayData.rounded.tl ? 3 : 0,
                          borderTopRightRadius: dayData.rounded.tr ? 3 : 0,
                          borderBottomLeftRadius: dayData.rounded.bl ? 3 : 0,
                          borderBottomRightRadius: dayData.rounded.br ? 3 : 0
                        }
                      : null;

                    return (
                    <View
                      key={`${month.name}-day-${weekIndex}-${dayIndex}`}
                      style={[
                        styles.dayCell,
                        dayData?.isMarked ? styles.dayMarked : null,
                        roundedStyle
                      ]}
                    >
                      {dayData && <Text style={styles.dayText}>{dayData.day}</Text>}
                    </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ))}
        </View>
        <Text style={styles.footer} fixed>
          Generado en{' '}
          <Link src={siteUrl || '/'} style={styles.footerLink}>
            {siteUrl || 'devacas_'}
          </Link>
        </Text>
      </Page>
    </Document>
  );
};

export default CalendarPdfDocument;
