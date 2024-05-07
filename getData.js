import { readConfig, definedIp, definedApiKey, inMilliseconds } from './readConfig.js'

var configIncompleteText;
var currentMode;
var currentState = 0;
var currentTemp;
var heatTemp;
var coolTemp;
var currentHum;
var fan;
var fanState;
var message = '';

class GetData {

	constructor() {

		this.protocol = 'http';
		this.count = 0;
		this.interval = inMilliseconds;
		this.updateInterval = setInterval(
			this.init.bind( this ),
			inMilliseconds
		)
	}

	async retrieveData() {

		await readConfig.init();
		
		if ( this.interval != inMilliseconds ) {

			clearInterval ( this.updateInterval );

			this.updateInterval = setInterval(
				this.init.bind( this ),
				inMilliseconds
			)

			this.interval = inMilliseconds;
		}

		if ( definedIp == '' || definedIp === undefined || definedApiKey == '' || definedApiKey === undefined ) {

			console.log( 'Missing Data. Please update config.' );
			configIncompleteText = 'Config is incomplete. Click Settings above.';
		}
		else {

			const result = await fetch( `${this.protocol}://${definedIp}/query/info` );
			const json = await result.json();
			this.count += 1;

			console.log( json );
			console.log( 'Data updated.' );
			console.log( 'Mode is:', json.mode );
			console.log( 'State is:', json.state );
			console.log( 'Count is:', this.count );

			if ( json.state != currentState ) {

				if ( json.state == 1 && currentState == 0 ) {
					if ( json.mode == 1 ) { message = 'System is now heating.'; }
					else if ( json.mode == 2 ) { message = 'System is now cooling.'; }
					else { message = 'System has come on.'; }
				}
				else {
					message = 'System is now idle.';
				}
				console.log( message );
			}
			else {
				message = '';
			}
			
			configIncompleteText = '';
			currentMode = json.mode;
			currentState = json.state;
			currentTemp = json.spacetemp;
			heatTemp = json.heattemp;
			coolTemp = json.cooltemp;
			currentHum = json.hum;
			fan = json.fan;
			fanState = json.fanstate;
		}
	}

	async didRetrieveData() {

		await this.retrieveData()
			.catch( ( error ) => {
				console.log( '' );
				console.log( 'Something went wrong. Try updating config.' );
				console.log( '' );
				console.warn( error );
			} );
	}

	async sendData() {

		await this.didRetrieveData();

		if ( message != '' ) {

			const sendToApi = fetch( 'https://api.studiojq.io/notifications', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify( {
					apikey: definedApiKey,
					message: message
				} )
			} ).then( response => response.json() ).then( ( data ) => { 
				console.log( data.message );
				configIncompleteText = data.configtext;
			} );
		}
	}

	async didSendData() {

		await this.sendData()
		.catch( ( error ) => {
			console.log( '' );
			console.log( 'Something went wrong. Check your config.' );
			console.log( '' );
			console.warn( error );
		} );		
	}

	async init() {

		await this.didSendData();
	}
}

await readConfig.init();
const getData = new GetData();
await getData.init();

export { configIncompleteText, currentMode, currentState, currentTemp, heatTemp, coolTemp, currentHum, fan, fanState, inMilliseconds };