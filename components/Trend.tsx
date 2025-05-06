import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';

interface TrendProps {
  habit: {
    history: { date: string }[];
  };
}

const screenWidth = Dimensions.get('window').width;

const Trend: React.FC<TrendProps> = ({ habit }) => {
  const getTrendData = () => {
    const doneDays = new Set(habit.history.map(entry => dayjs(entry.date).format('YYYY-MM-DD')));
    const today = dayjs();
    const startOfMonth = today.startOf('month');
    const endOfMonth = today.endOf('month');
    
    const labels: string[] = [];
    const data: number[] = [];
    
    let streak = 0;
    
    for (let d = startOfMonth; d.isBefore(endOfMonth.add(1, 'day')); d = d.add(1, 'day')) {
      const dateStr = d.format('YYYY-MM-DD');
      const dayOfMonth = d.date();
      
      // Show only specific day labels
      labels.push(dayOfMonth === 1 || dayOfMonth === 15 || dayOfMonth === 30 ? dayOfMonth.toString() : '');
      
      if (doneDays.has(dateStr)) {
        streak += 1;
      } else {
        streak = 0;
      }
      
      data.push(streak);
    }
    
    return {
      labels,
      datasets: [{ data }],
    };
  };
  
  const chartData = getTrendData();
  
  if (!chartData.datasets[0].data.length) {
    return <Text style={styles.emptyText}>No trend data yet</Text>;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Streak Trend</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 8}
        height={180}
        fromZero
        yAxisLabel=""
        yAxisSuffix=""
        withInnerLines={false}
        showValuesOnTopOfBars={false}
        segments={3}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          barPercentage: 0.25,
          barRadius: 3,
          formatYLabel: (yValue) => {
            return '';
          },
          propsForLabels: {
            fontSize: 7,
            opacity: 0.5,
          },
          decimalPlaces: 0,
        }}
        withHorizontalLabels={false}
        showBarTops={true}
        style={styles.chart}
        withCustomBarColorFromData={false}
        flatColor={true}
      />
      <Text style={styles.subtitle}>Days of Month</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    overflow: 'hidden',
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
    marginVertical: 2,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: -10,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
    color: '#333',
  },
  subtitle: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 0,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
});

export default Trend;