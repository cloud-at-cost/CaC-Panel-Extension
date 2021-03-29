import { Component } from "react";
import CloudatCostClient, { Server, CAC_URL } from "../apis/cloudatcost";
import CloudatCocksClient, { OS } from "../apis/cloudatcocks";

type CloudatCostVMProps = {
  cloudatCostClient?: CloudatCostClient;
};
type CloudatCostVMState = {
  error?: string;
  devVersion: string;
  injectionStatus?: string;
  serverID?: string;
  servers: Server[];
  serverDeleteStatus?: string;
};

class CloudatCostVM extends Component<CloudatCostVMProps, CloudatCostVMState> {
  constructor(props: CloudatCostVMProps) {
    super(props);
    this.state = {
      error: undefined,
      devVersion: "1",
      injectionStatus: undefined,
      serverID: undefined,
      servers: [],
      serverDeleteStatus: undefined,
    };
    this.handleInjectOS = this.handleInjectOS.bind(this);
    this.handleDeleteServer = this.handleDeleteServer.bind(this);
  }

  componentDidMount() {
    this.props.cloudatCostClient?.getServers().then((resp) => {
      this.setState({
        servers: resp.servers,
      });
    });
  }

  handleDeleteServer() {
    this.setState(
      {
        serverDeleteStatus: undefined,
      },
      () => {
        if (this.state.serverID) {
          this.props.cloudatCostClient
            ?.deleteServer(this.state.serverID)
            .then((resp) => {
              this.setState({
                serverID: undefined,
                serverDeleteStatus: `Server with ID: ${this.state.serverID} was successfully deleted!`,
              });
            });
        }
      }
    );
  }

  handleInjectOS() {
    this.setState(
      {
        error: undefined,
        injectionStatus: undefined,
      },
      () => {
        // check current tab URL
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const curTab = tabs[0];
          if (
            curTab.url !== `${CAC_URL}/build` &&
            curTab.url !== `${CAC_URL}/index.php?view=build`
          ) {
            this.setState({
              error:
                "You're not on the build page!  Please ensure you're on the build page with CPU/RAM/OS/Storage etc and try again!",
            });
          } else {
            // get list of OSes
            new CloudatCocksClient()
              .getOSes(this.state.devVersion)
              .then((resp) => {
                let { oses } = resp;
                // add prefix to names for easier identification
                oses = oses.map((os: OS) => {
                  os.name = `${this.state.devVersion} - ${os.name}`;
                  return os;
                });
                // make function to handle injection
                // FYI: This runs in the page itself, so we're limited to vanilla JS here
                const osInjectFn = `
						function osInjectFn(oses) {
							// identify select to insert to
							const osSelect = document.getElementsByName("os")[0];
							if (!osSelect) {
								alert("Unable to identify OS selection input!");
							}
							// create each OS option and append to select
							for (let os of oses) {
								const option = document.createElement("option");
								option.value = os.id;
								option.text = os.name;
								osSelect.appendChild(option);
							}
						};
						`;
                let osString = "[";
                for (let os of oses) {
                  osString += `{name:"${os.name}",id:"${os.id}"},`;
                }
                osString += "]";
                // inject to page
                chrome.tabs.executeScript(
                  // @ts-expect-error
                  undefined,
                  {
                    code: `${osInjectFn}osInjectFn(${osString});`,
                  },
                  () => {
                    this.setState({
                      injectionStatus: `Successfully injected V${this.state.devVersion} OSes...`,
                    });
                  }
                );
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
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">
                Server Management
              </h6>
            </div>
            <div className="card-body">
              <div className="text-center">
                <p className="lead">
                  Server deletion: This tool allows for you to delete servers in
                  your account (most useful for install pending servers)
                </p>
                <p>
                  To use this tool, please select a server from the dropdown and
                  then click "Delete".
                </p>
                <div className="input-group">
                  <select
                    className="custom-select"
                    value={this.state.serverID}
                    onChange={(e) =>
                      this.setState({ serverID: e.target.value })
                    }
                  >
                    <option selected disabled>
                      Select Server
                    </option>
                    {this.state.servers.map((server) => (
                      <option value={server.id}>{server.name}</option>
                    ))}
                    ;
                  </select>
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => this.handleDeleteServer()}
                    >
                      Delete
                    </button>
                  </div>
                  {this.state.serverDeleteStatus && (
                    <p className="text-success">
                      {this.state.serverDeleteStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">
                OS Management
              </h6>
            </div>
            <div className="card-body">
              <div className="text-center">
                {this.state.error && (
                  <p className="text-danger">{this.state.error}</p>
                )}
                <p className="lead">
                  Hidden OS injection: This tools injects all hiddens OSes from
                  the CloudatCocks OS DB into the build page for convenience
                </p>
                <p>
                  To use this tool, please login to the panel and get to the
                  build server page (where OS/CPU/RAM/etc. are listed), select
                  the developer version of OSes you want to inject and then
                  click "Inject"
                </p>
                <div className="input-group">
                  <select
                    className="custom-select"
                    value={this.state.devVersion}
                    onChange={(e) =>
                      this.setState({ devVersion: e.target.value })
                    }
                  >
                    <option value="v1">V1</option>
                    <option value="v3">V3</option>
                    <option value="v4">V4</option>
                    <option value="mac">Mac</option>
                  </select>
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => this.handleInjectOS()}
                    >
                      Inject
                    </button>
                  </div>
                </div>
                {this.state.injectionStatus && (
                  <p className="text-success">{this.state.injectionStatus}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default CloudatCostVM;
