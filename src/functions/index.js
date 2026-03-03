const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { aiEngine } = require('./aiEngine');

admin.initializeApp();

// Trigger when task is created
exports.onTaskCreated = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap, context) => {
    const task = snap.data();
    
    // Send notification if high priority
    if (task.priority === 'high') {
      await admin.messaging().send({
        token: task.userNotificationToken,
        notification: {
          title: 'High Priority Task',
          body: task.title
        }
      });
    }
    
    // Update user stats
    const userRef = admin.firestore().collection('users').doc(task.userId);
    await userRef.update({
      totalTasks: admin.firestore.FieldValue.increment(1)
    });
  });

// Daily analytics calculation
exports.calculateDailyStats = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    const users = await admin.firestore().collection('users').get();
    
    for (const user of users.docs) {
      const tasks = await admin.firestore()
        .collection('tasks')
        .where('userId', '==', user.id)
        .where('completedAt', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
        .get();
      
      // Calculate daily stats
      const stats = {
        date: new Date().toISOString().split('T')[0],
        completed: tasks.size,
        focusScore: calculateFocusScore(tasks),
        productivity: calculateProductivity(tasks)
      };
      
      // Store in analytics collection
      await admin.firestore()
        .collection('analytics')
        .doc(`${user.id}_${stats.date}`)
        .set(stats);
    }
  });

// AI insights generation
exports.generateAIInsights = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be logged in'
    );
  }
  
  const userId = context.auth.uid;
  const userData = await admin.firestore()
    .collection('users')
    .doc(userId)
    .get();
  
  const tasks = await admin.firestore()
    .collection('tasks')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get();
  
  return aiEngine.generateInsights(userData.data(), tasks.docs.map(d => d.data()));
});