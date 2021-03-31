import { Component } from "react";
import CloudatCostClient, { Server, CAC_URL } from "../apis/cloudatcost";
import CloudatCocksClient, { OS } from "../apis/cloudatcocks";

type CloudatCostVMProps = {
  cloudatCostClient?: CloudatCostClient;
};
type CloudatCostVMState = {
  error?: string;
  injectionStatus?: string;
  injectingOS: boolean;
  serverID?: string;
  servers: Server[];
  serverDeleteStatus?: string;
  deletingServer: boolean;
};

type CloudAtCostPlatform = {
  code: string;
  name: string;
};

const platforms: CloudAtCostPlatform[] = [
  {
    code: "v1",
    name: "V1",
  },
  {
    code: "v3",
    name: "V3",
  },
  {
    code: "v4",
    name: "V4",
  },
  {
    code: "mac",
    name: "Mac",
  },
];

type CloudAtCostOperatingSystem = {
  id: string;
  platform: string;
  name: string;
};

class CloudatCostVM extends Component<CloudatCostVMProps, CloudatCostVMState> {
  constructor(props: CloudatCostVMProps) {
    super(props);
    this.state = {
      error: undefined,
      injectionStatus: undefined,
      injectingOS: false,
      serverID: undefined,
      servers: [],
      serverDeleteStatus: undefined,
      deletingServer: false,
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
        deletingServer: true,
      },
      () => {
        if (this.state.serverID) {
          this.props.cloudatCostClient
            ?.deleteServer(this.state.serverID)
            .then((resp) => {
              this.setState({
                serverID: undefined,
                serverDeleteStatus: `Server with ID: ${this.state.serverID} was successfully deleted!`,
                deletingServer: false,
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
        injectingOS: true,
      },
      () => {
        // check current tab URL
        chrome.tabs.query(
          { active: true, currentWindow: true },
          async (tabs) => {
            const curTab = tabs[0];
            if (
              curTab.url !== `${CAC_URL}/build` &&
              curTab.url !== `${CAC_URL}/index.php?view=build`
            ) {
              this.setState({
                error:
                  "You're not on the build page!  Please ensure you're on the build page with CPU/RAM/OS/Storage etc and try again!",
                injectingOS: false,
              });
            } else {
              const client = new CloudatCocksClient();
              const promises: Promise<any>[] = [];
              let operatingSystems: CloudAtCostOperatingSystem[] = [];

              // get list of OSes
              platforms.forEach((platform: CloudAtCostPlatform) => {
                promises.push(
                  client.getOSes(platform.code).then((resp) => {
                    let { oses } = resp;
                    // add prefix to names for easier identification
                    oses.forEach((os: OS) => {
                      operatingSystems.push({
                        id: os.id,
                        name: os.name,
                        platform: platform.code,
                      });
                    });
                  })
                );
              });
              await Promise.all(promises);

              operatingSystems = operatingSystems.sort((a, b) => {
                if (a.platform < b.platform) {
                  return -1;
                } else if (a.platform > b.platform) {
                  return 1;
                }

                return a.name < b.name ? -1 : 1;
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
              for (let os of operatingSystems) {
                osString += `{name:"${os.platform} - ${os.name}",id:"${os.id}"},`;
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
                    injectionStatus: `Successfully injected Operating Systems...`,
                    injectingOS: false,
                  });
                }
              );
            }
          }
        );
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
                      className="btn btn-outline-danger"
                      onClick={() => this.handleDeleteServer()}
                      disabled={this.state.deletingServer}
                    >
                      {this.state.deletingServer && (
                        <span>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Deleting...
                        </span>
                      )}
                      {!this.state.deletingServer && <span>Delete</span>}
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
                <a href={`${CAC_URL}/build`} target="_blank" rel="noreferrer">
                  OS Management &nbsp;
                  <i className="fas fa-external-link-alt"></i>
                </a>
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
                  To use this tool, please login to the panel and get to the{" "}
                  <a href={`${CAC_URL}/build`} target="_blank" rel="noreferrer">
                    build server page
                  </a>{" "}
                  (where OS/CPU/RAM/etc. are listed), select the developer
                  version of OSes you want to inject and then click "Inject"
                </p>
                <div className="input-group">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => this.handleInjectOS()}
                    disabled={this.state.injectingOS}
                  >
                    {this.state.injectingOS && (
                      <span>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Injecting...
                      </span>
                    )}
                    {!this.state.injectingOS && <span>Inject</span>}
                  </button>
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
