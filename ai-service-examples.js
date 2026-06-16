const aiService = require('./ai-service-integration');

// Example 1: Getting an answer to a study question
async function testQnA() {
    console.log('=== Test 1: Q&A ===');
    const question = "What are the key concepts in organic chemistry?";
    const answer = await aiService.getAnswer(question);
    
    if (answer) {
        console.log('Question:', question);
        console.log('Answer:', answer.answer);
        console.log('Confidence:', answer.confidence);
        if (answer.sources.length > 0) {
            console.log('Sources:');
            answer.sources.forEach(source => console.log(`- ${source.source} (Relevance: ${source.relevance})`));
        }
    }
}

// Example 2: Getting study recommendations for a student
async function testStudyRecommendations() {
    console.log('\n=== Test 2: Study Recommendations ===');
    const studentId = '123';
    const courseId = '456';
    const recommendations = await aiService.getStudyRecommendations(studentId, courseId);
    
    if (recommendations) {
        console.log(`Recommendations for Student ${studentId} in Course ${courseId}:`);
        recommendations.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec.topic}`);
            console.log(`   ${rec.description}`);
            console.log(`   Type: ${rec.resource_type}, Time: ${rec.estimated_time} mins`);
        });
        
        console.log('\nStudy Plan:');
        console.log(`Daily study time: ${recommendations.study_plan.daily_study_time} mins`);
        console.log(`Focus areas: ${recommendations.study_plan.focus_areas.join(', ')}`);
        console.log(`Target completion: ${recommendations.study_plan.target_completion}`);
    }
}

// Example 3: Getting exam insights
async function testExamInsights() {
    console.log('\n=== Test 3: Exam Insights ===');
    const examId = '789';
    const insights = await aiService.getExamInsights(examId);
    
    if (insights) {
        console.log('Key Insights:');
        insights.insights.forEach(insight => console.log(`- ${insight.message}`));
        
        if (insights.trends.length > 0) {
            console.log('\nTrends:');
            insights.trends.forEach(trend => {
                console.log(`- ${trend.metric}: ${trend.direction} (${trend.change}%)`);
            });
        }
        
        if (insights.recommendations.length > 0) {
            console.log('\nRecommendations:');
            insights.recommendations.forEach(rec => console.log(`- ${rec}`));
        }
    }
}

// Example 4: Analyzing student engagement
async function testEngagementAnalysis() {
    console.log('\n=== Test 4: Engagement Analysis ===');
    const studentId = '123';
    const engagement = await aiService.analyzeEngagement(studentId);
    
    if (engagement) {
        console.log(`Engagement Score: ${(engagement.engagement_score * 100).toFixed(1)}%`);
        console.log(`Engagement Level: ${engagement.engagement_level}`);
        console.log(`Attendance Trend: ${engagement.attendance_trend}`);
        console.log(`Participation Score: ${(engagement.participation_score * 100).toFixed(1)}%`);
        console.log(`Assignment Completion: ${(engagement.assignment_completion * 100).toFixed(1)}%`);
        
        console.log('\nStudy Patterns:');
        console.log(`Preferred time: ${engagement.study_patterns.preferred_time}`);
        console.log(`Study duration: ${engagement.study_patterns.study_duration}`);
        console.log(`Study locations: ${engagement.study_patterns.study_locations.join(', ')}`);
    }
}

// Example 5: Getting resource recommendations
async function testResourceRecommendations() {
    console.log('\n=== Test 5: Resource Recommendations ===');
    const topic = 'Linear Algebra';
    const resources = await aiService.getResourceRecommendations(topic, 'advanced');
    
    if (resources) {
        console.log(`Resources for ${topic} (Advanced):`);
        resources.resources.forEach((resource, index) => {
            console.log(`${index + 1}. ${resource.title}`);
            console.log(`   Type: ${resource.type}`);
            console.log(`   URL: ${resource.url}`);
            console.log(`   Difficulty: ${resource.difficulty}`);
            console.log(`   Duration: ${resource.duration}`);
        });
    }
}

// Run all tests
async function runAllTests() {
    try {
        console.log('Testing AI Service Integration');
        console.log('============================');
        
        await testQnA();
        await testStudyRecommendations();
        await testExamInsights();
        await testEngagementAnalysis();
        await testResourceRecommendations();
        
        console.log('\nAll tests completed!');
    } catch (error) {
        console.error('Error running tests:', error);
    }
}

runAllTests();
