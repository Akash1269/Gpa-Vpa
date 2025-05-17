import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Semester } from '@/types/semester';
import { useTheme } from '@/hooks/useTheme';

type SemesterFilterProps = {
  semesters: Semester[];
  selectedSemester: string | null;
  onSelectSemester: (semesterId: string | null) => void;
};

export default function SemesterFilter({ 
  semesters, 
  selectedSemester, 
  onSelectSemester 
}: SemesterFilterProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 8,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    option: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedOption: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    optionText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      color: colors.text,
    },
    selectedOptionText: {
      color: colors.primary,
    },
    allOption: {
      backgroundColor: selectedSemester === null ? colors.primaryLight : colors.background,
      borderColor: selectedSemester === null ? colors.primary : colors.border,
    },
    allOptionText: {
      color: selectedSemester === null ? colors.primary : colors.text,
    },
  });

  // Sort semesters by most recent first
  const sortedSemesters = [...semesters].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const semesterOrder = { 'Fall': 2, 'Summer': 1, 'Spring': 0 };
    return semesterOrder[b.semester as keyof typeof semesterOrder] - 
           semesterOrder[a.semester as keyof typeof semesterOrder];
  });

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.option, styles.allOption]}
            onPress={() => onSelectSemester(null)}
          >
            <Text style={[styles.optionText, styles.allOptionText]}>All Semesters</Text>
          </TouchableOpacity>
          
          {sortedSemesters.map((semester) => {
            const semesterId = `${semester.semester}-${semester.year}`;
            const isSelected = selectedSemester === semesterId;
            
            return (
              <TouchableOpacity
                key={semesterId}
                style={[
                  styles.option,
                  isSelected && styles.selectedOption,
                ]}
                onPress={() => onSelectSemester(semesterId)}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                  ]}
                >
                  {semester.semester} {semester.year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}