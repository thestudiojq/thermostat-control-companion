import { readConfig, definedIp, definedApiKey, definedInterval, isRemoteRetrieveEnabled } from '../readConfig.js'
import express from 'express';
import fs from 'fs-extra';

const router = express.Router();

const saveConfigData = async function ( req, res ) {

	await readConfig.init();

	const path = './data/data.json';
	const ipAddress = req.body.ip != '' ? req.body.ip : definedIp;
	const apiKey = req.body.apikey != '' ? req.body.apikey : definedApiKey;
	const interval = req.body.interval != '' && req.body.interval != null ? req.body.interval : definedInterval;
	const remoteRetrieve = req.body.remoteretrieve;

	res.status( 200 ).json( { ip: ipAddress, apikey: apiKey, interval: interval, remoteretrieve: remoteRetrieve } );

	if ( ipAddress != '' && apiKey != '' && interval != '' ) {
	
		const newData = { ip: ipAddress, apikey: apiKey, interval: interval, remoteretrieve: remoteRetrieve  };

		try {
			await fs.writeJson( path, newData );
			console.log( 'Config updated!' );
		}
		catch ( error ) {
			console.log( error );
		}
	}
}

const populateConfigData = async function ( req, res ) {

	await readConfig.init();
	res.status( 200 ).json( { ip: definedIp, interval: definedInterval, remoteretrieve: isRemoteRetrieveEnabled } );
}

router.post( `/`, [saveConfigData] );

router.get( `/`, [populateConfigData] );

export default router;
    