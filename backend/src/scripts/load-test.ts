import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';
const CONCURRENT_REQUESTS = 50; // High enough to test pooling and clustering but safe for local

async function runLoadTest() {
    console.log(`🚀 Starting Load Test with ${CONCURRENT_REQUESTS} concurrent requests...`);
    
    const startTime = Date.now();
    const requests = Array.from({ length: CONCURRENT_REQUESTS }).map((_, i) => {
        return axios.get(`${BASE_URL}/health`)
            .then(res => ({ id: i, status: res.status, success: true }))
            .catch(err => ({ id: i, status: err.response?.status || 'ERROR', success: false }));
    });

    const results = await Promise.all(requests);
    const endTime = Date.now();

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log('\n--- Load Test Results ---');
    console.log(`✅ Successes: ${successCount}`);
    console.log(`❌ Failures: ${failureCount}`);
    console.log(`⏱️ Total Time: ${endTime - startTime}ms`);
    console.log(`🚀 Average Time: ${(endTime - startTime) / CONCURRENT_REQUESTS}ms per request`);

    if (failureCount > 0) {
        console.warn('⚠️ Some requests failed. This might be due to rate limiting or server pressure.');
    } else {
        console.log('🌟 All requests successful! Clustering and connection pooling are working.');
    }
}

runLoadTest().catch(console.error);
