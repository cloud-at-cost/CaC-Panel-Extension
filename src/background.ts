import CloudatCostClient from "./apis/cloudatcost";
import CloudatCocksClient from "./apis/cloudatcocks";

const forwardTransactions = async () => {
  console.log("Forwarding transactions...");

  chrome.storage.local.get(
    [
      "cacEmail",
      "cacPassword",
      "cacMineEmail",
      "cacMinePassword",
      "forwardTransactionLogs",
    ],
    async (result) => {
      console.log("Checking C@C login status...");
      const cacClient = new CloudatCostClient(
        result.cacEmail,
        result.cacPassword
      );

      let isLoggedIn = await cacClient.isLoggedIn();
      if (!isLoggedIn) {
        const login = await cacClient.login();
        isLoggedIn = login.valid;
      }

      if (!isLoggedIn) {
        console.log("Unable to login or session invalid, exitting...");
        return;
      }

      console.log("Checking CloudatCocks login status...");
      const cacMineClient = new CloudatCocksClient(
        result.cacMineEmail,
        result.cacMinePassword
      );

      isLoggedIn = await cacMineClient.isLoggedIn();
      if (!isLoggedIn) {
        const login = await cacMineClient.login();
        isLoggedIn = login.valid;
      }
      if (!isLoggedIn) {
        console.log("Unable to login or session invalid, exitting...");
        return;
      }

      // now handle request
      cacClient.getMiningWalletDetails().then((wallet) => {
        console.log("Found transactions:", wallet);
        if (wallet.transactions.length > 0) {
          cacMineClient.savePayout(wallet.transactions);
          console.log("Sync completed!");
        }
        let logs = result.forwardTransactionLogs;
        if (!logs) {
          logs = [];
        }
        // save sync details
        const log = {
          time: new Date().toISOString(),
          transactionCount: wallet.transactions.length,
        };
        logs.push(log);
        // keep at most 100 recent logs
        logs = logs.slice(Math.max(0, logs.length - 100), logs.length);
        chrome.storage.local.set({ forwardTransactionLogs: logs });
      });
    }
  );
};

chrome.runtime.onInstalled.addListener(() => {
  // on install clear all alarms
  chrome.alarms.clearAll(() => {
    // set all alarms again
    chrome.storage.local.get("forwardTransactionTime", (result) => {
      if (result.forwardTransactionTime) {
        console.log(
          `Creating alarm to forward transactions every ${result.forwardTransactionTime} minutes...`
        );
        chrome.alarms.create("forwardTransactions", {
          periodInMinutes: result.forwardTransactionTime,
        });
      }
    });
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name == "forwardTransactions") {
    forwardTransactions();
  }
});

export {};
