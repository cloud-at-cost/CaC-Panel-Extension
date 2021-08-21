import {
  CloudatCostWalletClient,
  MiningWalletResponse,
} from "../apis/cloudatcostwallet";

export function getSyncMethod(client?: CloudatCostWalletClient) {
  return new Promise<() => Promise<MiningWalletResponse>>((resolve, reject) => {
    chrome.storage.local.get(["syncPayouts"], (result) => {
      if (client) {
        if (result.syncPayouts) {
          resolve(client.getMiningWalletDetails.bind(client));
        } else {
          resolve(client.getMiningWalletDepositDetails.bind(client));
        }
      }
    });
  });
}
