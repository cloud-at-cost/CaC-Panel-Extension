import { Component } from "react";
import CloudatCocksLogin from "./CloudatCocksLogin";
import api from "../api";

type CloudatCostMinerProps = {};
type CloudatCostMinerState = {
  cloudatCocksToken?: string;
  currentBalance?: string;
  payoutSubmitted: boolean;
  forwardTransactionTime: number;
  forwardTransactionTimeStatus?: string;
  error?: string;
};

class CloudatCostMiner extends Component<
  CloudatCostMinerProps,
  CloudatCostMinerState
> {
  constructor(props: CloudatCostMinerProps) {
    super(props);
    this.state = {
      cloudatCocksToken: null,
      currentBalance: null,
      payoutSubmitted: false,
      forwardTransactionTime: 0,
      forwardTransactionTimeStatus: null,
      error: null,
    };
    this.getCurrentMinerStats = this.getCurrentMinerStats.bind(this);
    this.handleCloudatCocksLogin = this.handleCloudatCocksLogin.bind(this);
    this.handleSetBackgroundTime = this.handleSetBackgroundTime.bind(this);
    this.handleGetCurrentBalance = this.handleGetCurrentBalance.bind(this);
  }

  componentDidMount() {
    chrome.storage.local.get(["forwardTransactionTime"], (result) => {
      if (result.forwardTransactionTime) {
        this.setState({
          forwardTransactionTime: result.forwardTransactionTime,
        });
      }
    });
    this.handleGetCurrentBalance();
  }

  handleGetCurrentBalance() {
    api.cloudatcocks.getCurrentBalance().then((balance) => {
      this.setState({
        currentBalance: balance,
      });
    });
  }

  handleCloudatCocksLogin(token) {
    this.setState({
      cloudatCocksToken: token,
    });
  }

  handleSetBackgroundTime() {
    this.setState(
      {
        forwardTransactionTimeStatus: null,
      },
      () => {
        const time = this.state.forwardTransactionTime;
        chrome.storage.local.set({ forwardTransactionTime: time }, () => {
          // time should be good now, we need to update our alarm
          // FYI: this will clear any old alarms with this name
          if (time > 0) {
            chrome.alarms.create("forwardTransactions", {
              periodInMinutes: time,
            });
          } else {
            chrome.alarms.clear("forwardTransactions");
          }
          this.setState({
            forwardTransactionTimeStatus: `Successfully set forward transaction interval to every ${time} minutes.`,
          });
        });
      }
    );
  }

  getCurrentMinerStats() {
    this.setState(
      {
        payoutSubmitted: false,
        error: null,
      },
      () => {
        api.cloudatcost.getMiningWalletDetails().then((wallet) => {
          console.log("Found transactions:", wallet);
          if (wallet.transactions.length > 0) {
            api.cloudatcocks.savePayout(wallet, this.state.cloudatCocksToken);
            this.setState({
              payoutSubmitted: true,
            });
          } else {
            this.setState({
              error: "No transactions found!",
            });
          }
        });
      }
    );
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          {this.state.cloudatCocksToken === null && (
            <CloudatCocksLogin onLoginValid={this.handleCloudatCocksLogin} />
          )}
        </div>
        <div className="col-md-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">
                Current Balance
              </h6>
            </div>
            <div className="card-body">
              {this.state.currentBalance && (
                <div className="text-center">
                  <h3>
                    ${this.state.currentBalance}
                    <span> </span>
                    <i
                      className="fas fa-redo"
                      onClick={() => this.handleGetCurrentBalance()}
                    ></i>
                  </h3>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">
                Transaction Sync
              </h6>
            </div>
            <div className="card-body">
              <div className="text-center">
                <p className="lead">
                  This tool syncs your transactions from the C@C Mining panel to
                  the CloudatCocks analytics panel
                </p>
                <p>
                  To use this tool, click the button below (for one time sync)
                  or configure an interval in minutes to run this task in the
                  background (recommended to save your password in settings).
                </p>
                {this.state.cloudatCocksToken !== null && (
                  <div className="col-md-6 col-md-offset-3 text-center">
                    {this.state.error && (
                      <p className="text-center text-danger">
                        {this.state.error}
                      </p>
                    )}
                    <button
                      className="btn btn-primary"
                      onClick={() => this.getCurrentMinerStats()}
                    >
                      Forward Transactions to Panel
                    </button>
                    {this.state.payoutSubmitted === true && (
                      <p className="text-success">
                        Your transactions have been forwarded to the panel...
                      </p>
                    )}
                    <div className="input-group mt-3">
                      <input
                        className="form-control"
                        type="number"
                        value={this.state.forwardTransactionTime}
                        onChange={(e) =>
                          this.setState({
                            forwardTransactionTime: parseInt(e.target.value),
                          })
                        }
                      />
                      <div className="input-group-append">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => this.handleSetBackgroundTime()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    {this.state.forwardTransactionTimeStatus && (
                      <p className="text-success">
                        {this.state.forwardTransactionTimeStatus}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default CloudatCostMiner;
