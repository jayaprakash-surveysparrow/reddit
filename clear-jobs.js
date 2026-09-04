const {auditQueue} = require('./queues/auditQueue');

async function clearAll() {
    await auditQueue.obliterate({force: true});
    console.log('queue obliterated');
    process.exit(0);
}

clearAll();