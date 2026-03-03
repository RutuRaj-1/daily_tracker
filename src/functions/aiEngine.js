exports.aiEngine = {
  generateInsights: (userProfile, tasks) => {
    const insights = [];
    
    // Analyze completion patterns
    const completionRate = tasks.filter(t => t.completed).length / tasks.length;
    if (completionRate < 0.6) {
      insights.push({
        type: 'warning',
        message: 'Your completion rate is below target',
        recommendation: 'Try breaking tasks into smaller chunks'
      });
    }
    
    // Analyze peak hours
    const hourCompletion = Array(24).fill(0);
    tasks.forEach(task => {
      if (task.completedAt) {
        const hour = new Date(task.completedAt).getHours();
        hourCompletion[hour]++;
      }
    });
    
    const peakHour = hourCompletion.indexOf(Math.max(...hourCompletion));
    insights.push({
      type: 'insight',
      message: `You're most productive at ${peakHour}:00`,
      recommendation: 'Schedule important tasks during this time'
    });
    
    // Priority analysis
    const highPriorityCompleted = tasks.filter(
      t => t.priority === 'high' && t.completed
    ).length;
    const highPriorityTotal = tasks.filter(t => t.priority === 'high').length;
    
    if (highPriorityTotal > 0 && highPriorityCompleted / highPriorityTotal < 0.5) {
      insights.push({
        type: 'warning',
        message: 'High-priority tasks need attention',
        recommendation: 'Focus on these first thing tomorrow'
      });
    }
    
    return insights;
  }
};