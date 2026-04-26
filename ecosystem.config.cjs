module.exports = {
  apps: [
    {
      name: 'paygate-api',
      script: './backend/src/index.js',
      cwd: '/var/www/paygate',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};

