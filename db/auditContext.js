const { AsyncLocalStorage } = require('async_hooks');

const auditContext = new AsyncLocalStorage();

// Runs fn with the given actor id available to anything inside fn's async
// chain via getCurrentActorId() — including a Sequelize hook that fires deep
// inside a repository call, without that call needing to accept or forward
// a userId parameter itself.
function runWithActor(userId, fn) {
  return auditContext.run({ userId }, fn);
}

function getCurrentActorId() {
  const store = auditContext.getStore();
  return store ? store.userId : null;
}

module.exports = { runWithActor, getCurrentActorId };
