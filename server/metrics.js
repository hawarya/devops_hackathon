// metrics.js
const client = require('prom-client');

// Create a Registry and collect default system metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 300, 500, 1000, 5000] // ms
});
register.registerMetric(httpRequestDurationMicroseconds);

const quizAttempts = new client.Counter({
  name: 'quiz_attempts_total',
  help: 'Total number of quiz attempts'
});
register.registerMetric(quizAttempts);

// Middleware to measure API response time
function metricsMiddleware(req, res, next) {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode });
  });
  next();
}

module.exports = { register, quizAttempts, metricsMiddleware };
