jQuery( document ).ready( function( $ ) {

	loadSavedSettings( $ );

	$( '#save-form' ).on( 'click', function() {

		var ipAddress = $( '#ipaddress' ).val();
		var apiKey = $( '#apikey' ).val();
		var interval = $( '#interval' ).val();
		var theData = JSON.stringify( { ip: ipAddress, apikey: apiKey, interval: interval } );

		$.ajax( {
			url: '/updateConfig',
			method: 'post',
			contentType: 'application/json',
			data: theData,
			success: function ( data ) {
				alert( 'Config saved!' );
			}
		} );
	} );
} );

function loadSavedSettings( $ ) {

	$.ajax( {
		url: '/updateConfig',
		method: 'get',
		dataType: 'json',
		success: function ( data ) {
			$( '#ipaddress' ).val( data.ip );
			$( '#interval' ).val( data.interval );
		}
	} );
}