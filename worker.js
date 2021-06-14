const celery = require('celery-node');

const worker = celery.createWorker(
    "redis://:POC_2020AION@10.130.143.185:6379/1",
    "redis://:POC_2020AION@10.130.143.185:6379/2",
    "preprocess_test"
    );
worker.register("tasks.preprocess_facebook", (uids) => console.log(uids));
worker.start();