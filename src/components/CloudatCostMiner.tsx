import { Component } from "react";
import CloudatCocksLogin from "./CloudatCocksLogin";
import CloudatCocksClient from "../apis/cloudatcocks";
import CloudatCostClient from "../apis/cloudatcost";

type CloudatCostMinerProps = {
  cloudatCostClient?: CloudatCostClient;
};
type CloudatCostMinerState = {
  cloudatCocksClient?: CloudatCocksClient;
  currentBalance?: string;
  payoutSubmitted: boolean;
  forwardTransactionTime: number;
  forwardTransactionTimeStatus?: string;
  forwardTransactionLogs: { time: string; transactionCount: number }[];
  error?: string;
};

class CloudatCostMiner extends Component<
  CloudatCostMinerProps,
  CloudatCostMinerState
> {
  constructor(props: CloudatCostMinerProps) {
    super(props);
    this.state = {
      cloudatCocksClient: undefined,
      currentBalance: undefined,
      payoutSubmitted: false,
      forwardTransactionTime: 0,
      forwardTransactionTimeStatus: undefined,
      forwardTransactionLogs: [],
      error: undefined,
    };
    this.getCurrentMinerStats = this.getCurrentMinerStats.bind(this);
    this.getCurrentTransactionLogs = this.getCurrentTransactionLogs.bind(this);
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
    this.getCurrentTransactionLogs();
  }

  getCurrentTransactionLogs() {
    chrome.storage.local.get(["forwardTransactionLogs"], (result) => {
      if (result.forwardTransactionLogs) {
        this.setState({
          forwardTransactionLogs: result.forwardTransactionLogs.reverse(),
        });
      }
    });
  }

  handleGetCurrentBalance() {
    this.setState(
      {
        currentBalance: undefined,
      },
      () => {
        this.state.cloudatCocksClient?.getCurrentBalance().then((balance) => {
          this.setState({
            currentBalance: balance,
          });
        });
      }
    );
  }

  handleCloudatCocksLogin(client: CloudatCocksClient) {
    this.setState(
      {
        cloudatCocksClient: client,
      },
      () => {
        this.handleGetCurrentBalance();
      }
    );
  }

  handleSetBackgroundTime() {
    this.setState(
      {
        forwardTransactionTimeStatus: undefined,
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
        error: undefined,
      },
      () => {
        this.props.cloudatCostClient
          ?.getMiningWalletDetails()
          .then((wallet) => {
            console.log("Found transactions:", wallet);
            if (wallet.transactions.length > 0) {
              this.state.cloudatCocksClient?.savePayout(wallet.transactions);
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
          {this.state.cloudatCocksClient === undefined && (
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
              <div className="text-center">
                <h3>
                  {this.state.currentBalance && `$${this.state.currentBalance}`}
                  <span> </span>
                  <i
                    className={`fas fa-redo ${
                      this.state.currentBalance === undefined ? "fa-spin" : ""
                    }`}
                    onClick={() => this.handleGetCurrentBalance()}
                  ></i>
                </h3>
              </div>
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
                {this.state.cloudatCocksClient !== undefined && (
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
                    <div className="form mt-3">
                      <div className="form-group">
                        <label>Sync Interval (minutes):</label>
                        <div className="input-group">
                          <input
                            className="form-control"
                            type="number"
                            value={this.state.forwardTransactionTime}
                            onChange={(e) =>
                              this.setState({
                                forwardTransactionTime: parseInt(
                                  e.target.value
                                ),
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
                            {this.state.forwardTransactionTime > 0 && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() =>
                                  this.setState(
                                    { forwardTransactionTime: 0 },
                                    this.handleSetBackgroundTime
                                  )
                                }
                              >
                                Disable
                              </button>
                            )}
                          </div>
                        </div>
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
            <h3 className="text-center">
              Transaction Sync Log<span> </span>
              <i
                className="fas fa-redo"
                onClick={() => this.getCurrentTransactionLogs()}
              ></i>
            </h3>
            <table className="table table-striped col-10 offset-1">
              <thead>
                <tr>
                  <th className="text-center" scope="col">
                    Time
                  </th>
                  <th className="text-center" scope="col">
                    Transactions
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.state.forwardTransactionLogs.map((log) => (
                  <tr key={log.time}>
                    <td>{log.time}</td>
                    <td>{log.transactionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
export default CloudatCostMiner;
