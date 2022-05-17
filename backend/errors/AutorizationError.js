class AutorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AutorizationError";
    this.statusCode = 401;
  }
}

module.exports = AutorizationError;
