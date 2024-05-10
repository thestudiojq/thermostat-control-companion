import { configIncompleteText, currentMode, currentState, currentTemp, heatTemp, coolTemp, currentHum, fan, fanState, inMilliseconds } from './getData.js';
import updateConfig from './routes/updateConfig.js'
import express from 'express'; 

const app = express();
const port = process.env.PORT || 3218;

var currentModeName;
var currentStateName;
var theSetTemp;
var fanModeName;
var fanStateName;
var timestamp;
var serverUpdateInterval;

app.set( 'views', './views' );
app.set( 'view engine', 'pug' );
app.use( express.static( './public' ) );
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use( '/updateConfig', updateConfig );

app.listen( port, () => {
	console.log( `Listening on port ${port}` )
} );

function renderView() {

	if ( currentMode == 1 ) {
		currentModeName = "HEATING";
		theSetTemp = heatTemp + '°';
	}
	else if ( currentMode == 2 ) {
		currentModeName = "COOLING";
		theSetTemp = coolTemp + '°';
	}
	else if ( currentMode == 3 ) {
		currentModeName = "AUTO";
		theSetTemp = 'Heat: ' + heatTemp + '°' + ', Cool: ' + coolTemp + '°';
	}
	else {
		currentModeName = "OFF";
		theSetTemp = '';
	}

	currentStateName = currentState == 1 || currentState == 2 ? "ON" : "IDLE";
	fanModeName = fan == 1 ? "ON" : "AUTO";
	fanStateName = fanState == 1 ? "ON" : "OFF";
	timestamp = Date.now();

	app.get( '/', ( req, res ) => {
		res.render( 'index', { 
			title: 'Thermostat Data',
			mode: currentModeName,
			state: currentStateName,
			temp: currentTemp + '°',
			settemp: theSetTemp,
			humidity: currentHum + '%',
			fanmode: fanModeName,
			fanstate: fanStateName,
			timestamp: timestamp,
			configincompletetext: configIncompleteText
		} )
	} );
}

function renderConfig() {

	app.get( '/config', ( req, res ) => {
		res.render( 'config', { 
			title: 'Config'
		} )
	} );
}

setTimeout( renderView, 1000 );
setTimeout( renderConfig, 1000 );
setUpdateInterval();

function setUpdateInterval() {
	
	serverUpdateInterval = setInterval( renderView, inMilliseconds );
}