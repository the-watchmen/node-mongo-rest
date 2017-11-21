module.exports = {
  mongo: {
    host: 'localhost:27017',
    db: 'test',
    connectTimeoutMs: 30000,
    socketTimeoutMs: 30000,
    cursorTimeoutMs: 30000,
    poolSize: 25
  },
  listener: {
    port: 3000,
    secret: 's3cret'
  },
  framework: {
    data: {
      defaultLimit: 10,
      maxLimit: 200
    }
  }
}
