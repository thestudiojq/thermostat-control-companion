import { readConfig, definedIp, definedApiKey, isRemoteRetrieveEnabled, inMilliseconds } from './readConfig.js'

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
var todayRuntime;
var yesterdayRuntime;
var twoDaysAgoRuntime;
var threeDaysAgoRuntime;
var fourDaysAgoRuntime;
var fiveDaysAgoRuntime;
var sixDaysAgoRuntime;
var tempUnits;

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

				if ( json.state == 1 ) { message = 'System is now heating.'; }
				else if ( json.state == 2 ) { message = 'System is now cooling.'; }
				else { message = 'System is now idle.'; }
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
			tempUnits = json.tempunits;

			if ( isRemoteRetrieveEnabled == 'yes' ) {
				
				const resultRuntimes = await fetch( `${this.protocol}://${definedIp}/query/runtimes` );
				const jsonRuntimes = await resultRuntimes.json();
				
				if ( currentMode == 1 ) {
					
					todayRuntime = jsonRuntimes.runtimes[6].heat1;
					yesterdayRuntime = jsonRuntimes.runtimes[5].heat1;
					twoDaysAgoRuntime = jsonRuntimes.runtimes[4].heat1;
					threeDaysAgoRuntime = jsonRuntimes.runtimes[3].heat1;
					fourDaysAgoRuntime = jsonRuntimes.runtimes[2].heat1;
					fiveDaysAgoRuntime = jsonRuntimes.runtimes[1].heat1;
					sixDaysAgoRuntime = jsonRuntimes.runtimes[0].heat1;
				}
				if ( currentMode == 2 ) {
					
					todayRuntime = jsonRuntimes.runtimes[6].cool1;
					yesterdayRuntime = jsonRuntimes.runtimes[5].cool1;
					twoDaysAgoRuntime = jsonRuntimes.runtimes[4].cool1;
					threeDaysAgoRuntime = jsonRuntimes.runtimes[3].cool1;
					fourDaysAgoRuntime = jsonRuntimes.runtimes[2].cool1;
					fiveDaysAgoRuntime = jsonRuntimes.runtimes[1].cool1;
					sixDaysAgoRuntime = jsonRuntimes.runtimes[0].cool1;
				}
				else {
					
					todayRuntime = ( jsonRuntimes.runtimes[6].heat1 ) + ( jsonRuntimes.runtimes[6].cool1 );
					yesterdayRuntime = ( jsonRuntimes.runtimes[5].heat1 ) + ( jsonRuntimes.runtimes[5].cool1 );
					twoDaysAgoRuntime = ( jsonRuntimes.runtimes[4].heat1 ) + ( jsonRuntimes.runtimes[4].cool1 );
					threeDaysAgoRuntime = ( jsonRuntimes.runtimes[3].heat1 ) + ( jsonRuntimes.runtimes[3].cool1 );
					fourDaysAgoRuntime = ( jsonRuntimes.runtimes[2].heat1 ) + ( jsonRuntimes.runtimes[2].cool1 );
					fiveDaysAgoRuntime = ( jsonRuntimes.runtimes[1].heat1 ) + ( jsonRuntimes.runtimes[1].cool1 );
					sixDaysAgoRuntime = ( jsonRuntimes.runtimes[0].heat1 ) + ( jsonRuntimes.runtimes[0].cool1 );
				}

				console.log( 'Today runtime:', todayRuntime, 'minutes' );
			}
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

			const sendNotificationToApi = fetch( 'https://api.studiojq.io/notifications', {
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

		if ( isRemoteRetrieveEnabled == 'yes' ) {

			const sendThermDataToApi = fetch( 'https://api.studiojq.io/thermdata', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify( {
					apikey: definedApiKey,
					mode: currentMode,
					state: currentState,
					temp: currentTemp,
					heattemp: heatTemp,
					cooltemp: coolTemp,
					hum: currentHum,
					fan: fan,
					fanstate: fanState,
					todayruntime: todayRuntime,
					yesterdayruntime: yesterdayRuntime,
					twodaysagoruntime: twoDaysAgoRuntime,
					threedaysagoruntime: threeDaysAgoRuntime,
					fourdaysagoruntime: fourDaysAgoRuntime,
					fivedaysagoruntime: fiveDaysAgoRuntime,
					sixdaysagoruntime: sixDaysAgoRuntime,
					tempunits: tempUnits
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