import * as Notifications from 'expo-notifications';

const titles = [
    '🚀 Keep Your Streak Going!',
    '⏰ Time for Your Daily Check-In!',
    '💪 You Got This!',
    '🔥 Don’t Let the Streak Break!',
    '🌱 Grow Your Habit Today!',
    '⚡ Don’t Miss Out!',
    '🔄 Just One More Step!',
    '⏳ Your Habit Needs You!',
    '📅 Habit Check-In Time!',
    '🌟 Reset Your Streak Today!'
  ];
  
  const bodies = [
    'Keep up the good work — check your habit progress!',
    'Stay on track! Don’t forget to log your progress!',
    'Another step closer to your goal — keep going!',
    'You’re on fire! Check in and maintain your streak!',
    'Just one more check-in and your streak stays strong!',
    'A simple check-in today keeps your progress on track!',
    'Keep going! A quick check-in will boost your habit progress!',
    'Check in now and watch your habit grow stronger!',
    'A quick check-in now keeps the streak alive!',
    'Don’t break the flow — check in and keep going!',
    'It’s that time again! Keep your habit streak on point!',
    'It’s a new day — time to check in and start fresh!'
  ];

const getRandomTitle = () => {
    const randomIndex = Math.floor(Math.random() * titles.length);
    return titles[randomIndex];
  };
  
  const getRandomBody = () => {
    const randomIndex = Math.floor(Math.random() * bodies.length);
    return bodies[randomIndex];
  };

const scheduleNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync()

  await Notifications.scheduleNotificationAsync({
    content: {
        title: getRandomTitle(),
        body: getRandomBody(), 
    },
    trigger: {
      channelId: 'default',
      hour: 14,
      minute: 0,
      repeats: true,
    },
  })

  await Notifications.scheduleNotificationAsync({
    content: {
        title: getRandomTitle(),
        body: getRandomBody(), 
    },
    trigger: {
      channelId: 'default',
      hour: 20,
      minute: 13,
      repeats: true,
    },
  })
}

export default scheduleNotifications