jQuery( document ).ready( function( $ ) {

	loadSavedSettings( $ );

	$( '#save-form' ).on( 'click', function() {

		var ipAddress = $( '#ipaddress' ).val();
		var apiKey = $( '#apikey' ).val();
		var interval = $( '#interval' ).val();
		var notificationsEnabled = $( 'input[name="notificationsenabled"]:checked' ).val();
		var remoteRetrieve = $( 'input[name="remoteretrieve"]:checked' ).val();
		var theData = JSON.stringify( { ip: ipAddress, apikey: apiKey, interval: interval, notificationsenabled: notificationsEnabled, remoteretrieve: remoteRetrieve } );

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
			if ( data.remoteretrieve == 'yes' ) {
				$( '#remoteretrieveno' ).prop( 'checked', false );
				$( '#remoteretrieveyes' ).prop( 'checked', true );
			}
			else { 
				$( '#remoteretrieveno' ).prop( 'checked', true );
				$( '#remoteretrieveyes' ).prop( 'checked', false );
			}
			if ( data.notificationsenabled == 'yes' ) {
				$( '#notificationsenabledno' ).prop( 'checked', false );
				$( '#notificationsenabledyes' ).prop( 'checked', true );
			}
			else { 
				$( '#notificationsenabledno' ).prop( 'checked', true );
				$( '#notificationsenabledyes' ).prop( 'checked', false );
			}
		}
	} );
}