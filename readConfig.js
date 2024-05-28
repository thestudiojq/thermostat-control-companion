import fs from 'fs-extra';

var definedIp;
var definedApiKey;
var definedInterval;
var isRemoteRetrieveEnabled;
var inMilliseconds = 120000;

class ReadConfig {

	constructor() {

		this.path = './data/data.json';
		this.data= {};
	}

	async readConfig() {

		try {
			this.data = await fs.readJson( this.path );
		}
		catch ( error ) {
			console.log( error );
		}
	}

	async processConfig() {

		await this.readConfig();

		definedIp = this.data.ip;
		definedApiKey = this.data.apikey;
		definedInterval = parseInt( this.data.interval );
		isRemoteRetrieveEnabled = this.data.remoteretrieve;
		inMilliseconds = Number.isInteger( definedInterval ) ? definedInterval * 1000 : 120000;
	}

	async init() {

		await this.processConfig();
	}
}

const readConfig = new ReadConfig();

export { readConfig, definedIp, definedApiKey, definedInterval, isRemoteRetrieveEnabled, inMilliseconds };