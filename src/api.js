import { JSDOM } from 'jsdom';

type CloudatCostSettingsResponse = {
	name: string,
	email: string
};

const CAC_URL = 'https://panel.cloudatcost.com/panel/_config';
const api = {
	cloudatcost: {
		getSettings: (): Promise<CloudatCostSettingsResponse> => {
			return fetch(`${CAC_URL}/userSettings.php`).then((resp) => resp.text()).then((text) => {
				console.log(text);
				// parse text via HTML
				const html = new JSDOM(text);
				const name = html.getElementById('Name');
				const email = html.getElementById('email');
				return {
					name: name,
					email: email
				}
			});
		}
	}
};
export default api;
