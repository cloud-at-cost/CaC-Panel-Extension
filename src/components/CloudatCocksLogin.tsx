import { Component } from "react";
import api from "../api";

type CloudatCocksLoginProps = {
  onLoginValid: () => void;
};
type CloudatCocksLoginState = {
  attemptedLogin: boolean;
};

class CloudatCocksLogin extends Component<
  CloudatCocksLoginProps,
  CloudatCocksLoginState
> {
  constructor(props: CloudatCocksLoginProps) {
    super(props);
    this.state = {
      attemptedLogin: false,
    };
    this.checkLoggedIn = this.checkLoggedIn.bind(this);
  }

  checkLoggedIn() {
    fetch(`${api.cloudatcocks.URL}/login`).then((resp) => {
      // if we were redirected, they need to login!
      if (resp.redirected === true) {
        // get CSRF token for session
        api.cloudatcocks.getCSRFToken().then((token) => {
          // let parent know we're logged in
          this.props.onLoginValid(token);
        });
      } else {
        // mark attempt and wait for user
        this.setState({
          attemptedLogin: true,
        });
      }
    });
  }

  componentDidMount() {
    this.checkLoggedIn();
  }

  render() {
    return (
      <div className="row text-center">
        {this.state.attemptedLogin && (
          <div>
            <p>
              Please ensure you're logged in to the CloudatCocks Panel and click
              the below button for verification
            </p>
            <button
              className="btn btn-primary"
              onClick={() => this.checkLoggedIn()}
            >
              Verify Login
            </button>
          </div>
        )}
        {this.state.attemptedLogin === false && (
          <p>Checking your login status with the CloudatCocks Panel...</p>
        )}
      </div>
    );
  }
}
export default CloudatCocksLogin;
