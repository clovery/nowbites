module.exports = {
  apps: [
    {
      namespace: 'nowbites',
      name: 'nowbites-api',
      script: "npm run start",
      instances: 1,
      env_file: '.env',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
