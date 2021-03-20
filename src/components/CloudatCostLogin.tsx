import { Component } from 'react';
import api from '../api';

type CloudatCostLoginProps = {
	onLoginValid: () => void
};
type CloudatCostLoginState = {
	attemptedLogin: boolean
};

class CloudatCostLogin extends Component<CloudatCostLoginProps, CloudatCostLoginState> {
	constructor(props: CloudatCostLoginProps) {
		super(props);
		this.state = {
			attemptedLogin: false
		};
		this.checkLoggedIn = this.checkLoggedIn.bind(this);
	}

	checkLoggedIn() {
		fetch("https://panel.cloudatcost.com/").then((resp) => {
			// if we were redirected, they need to login!
			if (resp.redirected === true) {
				// mark attempt and wait for user
				this.setState({
					attemptedLogin: true
				});
			}
			else {
				// let parent know we're logged in
				api.cloudatcost.getSettings().then((user) => {
					console.log(user);
					//this.props.onLoginValid(user);
				});
			}
		});
	}

	componentDidMount() {
		console.log("check login");
		this.checkLoggedIn();
	}

	render() {
		return (
			<div className="row text-center">
				{ this.state.attemptedLogin && (
					<div>
						<p>Please ensure you're logged in to the CloudatCost Panel and click the below button for verification</p>
						<button className="btn btn-primary" onClick={() => this.checkLoggedIn()}>Verify Login</button>
					</div>
				)}
				{ this.state.attemptedLogin === false && (
					<p>Checking your login status with the CloudatCost Panel...</p>
				)}
			</div>
		);
	}
}
export default CloudatCostLogin;
