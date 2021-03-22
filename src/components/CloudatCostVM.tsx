import { Component } from "react";
import api from "../api";

type CloudatCostVMProps = {};
type CloudatCostVMState = {
  error?: string;
  devVersion: string;
  injectionStatus?: string;
};

class CloudatCostVM extends Component<CloudatCostVMProps, CloudatCostVMState> {
  constructor(props: CloudatCostVMProps) {
    super(props);
    this.state = {
      error: null,
      devVersion: "1",
      injectionStatus: null,
    };
    this.handleInjectOS = this.handleInjectOS.bind(this);
  }

  handleInjectOS() {
    this.setState(
      {
        error: null,
        injectionStatus: null,
      },
      () => {
        // check current tab URL
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const curTab = tabs[0];
          if (curTab.url !== `${api.cloudatcost.URL}/build`) {
            this.setState({
              error:
                "You're not on the build page!  Please ensure you're on the build page with CPU/RAM/OS/Storage etc and try again!",
            });
          } else {
            // get list of OSes
            api.sheets.getOS(this.state.devVersion).then((resp) => {
              let { oses } = resp;
              // add prefix to names for easier identification
              oses = oses.map((os) => {
                os.name = `V${this.state.devVersion} - ${os.name}`;
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
                null,
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
          <div class="card shadow mb-4">
            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 class="m-0 font-weight-bold text-primary">OS Management</h6>
            </div>
            <div class="card-body">
              <div className="text-center">
                {this.state.error && (
                  <p className="text-danger">{this.state.error}</p>
                )}
                <p className="lead">
                  Hidden OS injection: This tools injects all hiddens OSes from
                  this{" "}
                  <a href={api.sheets.OS_URL} target="_blank">
                    spreadsheet
                  </a>{" "}
                  into the build page for convenience
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
                    <option value="1">V1</option>
                    <option value="3">V3</option>
                    <option value="4">V4</option>
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
