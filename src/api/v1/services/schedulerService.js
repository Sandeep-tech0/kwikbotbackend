const renewalsService = require("./renewalService");

class SchedulerService {
  schedule() {
    callinFixedInterval();
  }
}

module.exports = new SchedulerService();

//Functions
function callinFixedInterval() {
  setInterval(async () => {
    renewalsService.renewalRemainderOfAllClients();
  }, 3600000 * 23); // 3600000ms = 1 hour in milliseconds
}
