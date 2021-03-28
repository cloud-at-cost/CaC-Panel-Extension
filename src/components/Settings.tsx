import { Component } from "react";

type SettingsProps = {};
type SettingsState = {
  cacEmail: string;
  cacPassword: string;
  cacSaved: boolean;
  cacMineEmail: string;
  cacMinePassword: string;
  cacMineSaved: boolean;
};

class Settings extends Component<SettingsProps, SettingsState> {
  constructor(props: SettingsProps) {
    super(props);
    this.state = {
      cacEmail: "",
      cacPassword: "",
      cacSaved: false,
      cacMineEmail: "",
      cacMinePassword: "",
      cacMineSaved: false,
    };
    this.handleSaveCac = this.handleSaveCac.bind(this);
    this.handleSaveCacMine = this.handleSaveCacMine.bind(this);
  }

  handleSaveCac() {
    chrome.storage.local.set({
      cacEmail: this.state.cacEmail,
      cacPassword: this.state.cacPassword,
      cacSaved: true,
    });
  }

  handleSaveCacMine() {
    chrome.storage.local.set({
      cacMineEmail: this.state.cacMineEmail,
      cacMinePassword: this.state.cacMinePassword,
      cacMineSaved: true,
    });
  }

  componentDidMount() {
    // read stored values
    chrome.storage.local.get(["cacEmail", "cacMineEmail"], (result) => {
      this.setState({
        cacEmail: result.cacEmail,
        cacMineEmail: result.cacMineEmail,
      });
    });
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">
                CloudatCost Settings
              </h6>
            </div>
            <div className="card-body">
              <div className="form">
                <div className="form-group">
                  <label htmlFor="cacEmail">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="cacEmail"
                    placeholder="name@example.com"
                    value={this.state.cacEmail}
                    onChange={(e) =>
                      this.setState({ cacEmail: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cacPassword">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="cacPassword"
                    onChange={(e) =>
                      this.setState({ cacPassword: e.target.value })
                    }
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={() => this.handleSaveCac()}
                  >
                    Save
                  </button>
                </div>
              </div>
              {this.state.cacSaved && (
                <p className="text-success">Settings saved successfully!</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-12">
          <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">
                CloudatCocks Settings
              </h6>
            </div>
            <div className="card-body">
              <div className="form">
                <div className="form-group">
                  <label htmlFor="cacEmail">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="cacEmail"
                    placeholder="name@example.com"
                    value={this.state.cacMineEmail}
                    onChange={(e) =>
                      this.setState({ cacMineEmail: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cacPassword">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="cacPassword"
                    onChange={(e) =>
                      this.setState({ cacMinePassword: e.target.value })
                    }
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={() => this.handleSaveCacMine()}
                  >
                    Save
                  </button>
                </div>
              </div>
              {this.state.cacMineSaved && (
                <p className="text-success">Settings saved successfully!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Settings;
