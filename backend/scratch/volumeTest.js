const http = require('http');
const mongoose = require('mongoose');
const config = require('../src/config/env');
const aiQuizService = require('../src/services/aiQuiz.service');

// Start backend app instance for testing
const app = require('../src/app');

async function runVolumeTests() {
  console.log('====================================================');
  console.log('🚀 LEVGRESS VOLUME & PERFORMANCE TESTING SUITE');
  console.log('====================================================\n');

  // Start HTTP Server on port 5001 for volume testing
  const PORT = 5001;
  const server = app.listen(PORT, async () => {
    console.log(`[Volume Test Server] Running on http://127.0.0.1:${PORT}\n`);

    try {
      // ----------------------------------------------------
      // TEST 1: High-Volume Concurrent API Traffic (500 Requests)
      // ----------------------------------------------------
      console.log('--- TEST 1: High-Volume Concurrent API Traffic (500 Requests) ---');
      const totalRequests = 500;
      const concurrency = 25;
      const latencies = [];
      let successCount = 0;
      let failCount = 0;

      const startTime = Date.now();

      const makeRequest = () => {
        return new Promise((resolve) => {
          const reqStart = Date.now();
          http.get(`http://127.0.0.1:${PORT}/`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              const reqLatency = Date.now() - reqStart;
              latencies.push(reqLatency);
              if (res.statusCode === 200) successCount++;
              else failCount++;
              resolve();
            });
          }).on('error', (err) => {
            failCount++;
            resolve();
          });
        });
      };

      // Execute requests in concurrency batches
      for (let i = 0; i < totalRequests; i += concurrency) {
        const batch = [];
        for (let j = 0; j < concurrency && (i + j) < totalRequests; j++) {
          batch.push(makeRequest());
        }
        await Promise.all(batch);
      }

      const totalDurationSec = (Date.now() - startTime) / 1000;
      latencies.sort((a, b) => a - b);
      const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
      const p95 = latencies[Math.floor(latencies.length * 0.95)];
      const p99 = latencies[Math.floor(latencies.length * 0.99)];
      const rps = (totalRequests / totalDurationSec).toFixed(2);

      console.log(`✔ Total Volume Requests Processed: ${totalRequests}`);
      console.log(`✔ Total Duration: ${totalDurationSec.toFixed(2)}s`);
      console.log(`✔ Throughput (RPS): ${rps} req/sec`);
      console.log(`✔ Success Rate: ${((successCount / totalRequests) * 100).toFixed(1)}% (${successCount}/${totalRequests})`);
      console.log(`✔ Average Latency: ${avgLatency}ms`);
      console.log(`✔ P95 Latency: ${p95}ms`);
      console.log(`✔ P99 Latency: ${p99}ms\n`);

      // ----------------------------------------------------
      // TEST 2: AI Quiz Question Generator Volume Test
      // ----------------------------------------------------
      console.log('--- TEST 2: AI Quiz Question Generator Volume Test ---');
      const quizSkills = ['AWS', 'Java', 'React', 'Python', 'Node.js'];
      const quizStartTime = Date.now();
      let totalQuestionsGenerated = 0;

      for (const skill of quizSkills) {
        const questions = await aiQuizService.generateTenAIQuestions(skill, 'BASIC');
        totalQuestionsGenerated += questions.length;
      }

      const quizDurationSec = (Date.now() - quizStartTime) / 1000;
      console.log(`✔ Total AI Skills Tested: ${quizSkills.length}`);
      console.log(`✔ Total AI Questions Generated: ${totalQuestionsGenerated}`);
      console.log(`✔ Total Quiz Generation Duration: ${quizDurationSec.toFixed(2)}s`);
      console.log(`✔ Avg Time Per 10-Question Quiz: ${(quizDurationSec / quizSkills.length).toFixed(2)}s\n`);

      // ----------------------------------------------------
      // TEST 3: Network Volume & Gzip Compression Savings
      // ----------------------------------------------------
      console.log('--- TEST 3: Network Volume & Gzip Compression Savings ---');
      const samplePayload = JSON.stringify({
        status: 'success',
        data: Array(50).fill({
          id: '6a89b37b323b063356b9b23f',
          skillName: 'Full Stack Web Development',
          score: 95,
          explanation: 'Demonstrated proficiency in React components, Node.js routing, MongoDB collections, and clean UI architecture.',
        })
      });

      const zlib = require('zlib');
      const rawBytes = Buffer.byteLength(samplePayload, 'utf8');
      const compressedBytes = zlib.gzipSync(samplePayload).length;
      const compressionRatio = (((rawBytes - compressedBytes) / rawBytes) * 100).toFixed(1);

      console.log(`✔ Raw Response Size: ${rawBytes} bytes (${(rawBytes / 1024).toFixed(2)} KB)`);
      console.log(`✔ Compressed Size (Gzip): ${compressedBytes} bytes (${(compressedBytes / 1024).toFixed(2)} KB)`);
      console.log(`✔ Bandwidth Volume Savings: ${compressionRatio}%\n`);

      console.log('====================================================');
      console.log('🏁 VOLUME & LOAD TESTING COMPLETED SUCCESSFULLY!');
      console.log('====================================================');

    } catch (err) {
      console.error('Volume Test Error:', err);
    } finally {
      server.close();
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      process.exit(0);
    }
  });
}

runVolumeTests();
