import api from "./api.js";

const forwardTransactions = async () => {
  console.log("Forwarding transactions...");

  chrome.storage.local.get(
    ["cacEmail", "cacPassword", "cacMineEmail", "cacMinePassword"],
    async (result) => {
      console.log("Checking C@C login status...");
      const loggedIn = await fetch(api.cloudatcost.URL).then(async (resp) => {
        // if we were redirected, they need to login!
        if (resp.redirected === true) {
          // check if we have credentials already stored
          if (result.cacEmail && result.cacPassword) {
            console.log("Logging in to CloudatCost with saved credentials...");
            // login for the user
            return await api.cloudatcost
              .login(result.cacEmail, result.cacPassword)
              .then(async (resp) => {
                return await fetch(api.cloudatcost.URL).then((resp) => {
                  return resp.redirected === false;
                });
              });
          }
        } else {
          return true;
        }
      });
      if (!loggedIn) {
        console.log("Unable to login or session invalid, exitting...");
        return;
      }

      console.log("Checking CloudatCocks login status...");
      const token = await fetch(`${api.cloudatcocks.URL}/login`).then(
        async (resp) => {
          // if we were redirected, they need to login!
          if (resp.redirected === true) {
            // get CSRF token for session
            return await api.cloudatcocks.getCSRFToken().then((token) => {
              return token;
            });
          } else {
            // attempt to login if we have saved credential
            if (result.cacMineEmail && result.cacMinePassword) {
              console.log(
                "Logging in to CloudatCocks with saved credentials..."
              );
              return await api.cloudatcocks
                .getCSRFToken()
                .then(async (token) => {
                  return await api.cloudatcocks
                    .login(result.cacMineEmail, result.cacMinePassword, token)
                    .then((user) => {
                      return token;
                    });
                });
            } else {
              return null;
            }
          }
        }
      );
      if (!token) {
        console.log("Unable to login or session invalid, exitting...");
        return;
      }

      // now handle request
      api.cloudatcost.getMiningWalletDetails().then((wallet) => {
        console.log("Found transactions:", wallet);
        if (wallet.transactions.length > 0) {
          api.cloudatcocks.savePayout(wallet, token);
          console.log("Sync completed!");
        }
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
