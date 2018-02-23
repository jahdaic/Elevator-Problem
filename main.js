// Run code on window load
window.addEventListener( 'load', main, false );

/** Initializes the environment */
function main()
{
	// Create a central data store
	window.store = {
		elevators: 3,
		floors: 10,
		floorsCalling: [],
		floorDuration: 500,
		pickupDuration: store.floorDuration / 2
	};

	// Set CSS transition speed
	document.body.style.setProperty( '--animation-duration', `${store.floorDuration}ms` );

	// Create the elevator controller
	window.controller = new ElevatorController();

	// Add elevators to the building
	for ( var i = 0; i < store.elevators; i++ )
	{
		controller.addElevator( new Elevator() );
	}

	// Start the elevtor controller
	controller.start();

	setInterval( refreshStoreDisplay, 200 );

	changeRotation();
}

/** Refreshes the display of the store data */
function refreshStoreDisplay()
{
	// Update the data store display
	var text = JSON.stringify( store, null, 4 );
	var storeDisplay = document.getElementById( 'store' );
	storeDisplay.innerHTML = text;

	// Update button states
	var buttons = Array.from( document.querySelectorAll( '#buttons > button' ) );
	buttons.forEach( button =>
	{
		if ( store.floorsCalling.includes( Number( button.dataset.floor ) ) )
			button.classList.add( 'active' );
		else
			button.classList.remove( 'active' );
	} );

	// Update elevator display
	var elevators = Array.from( document.querySelectorAll( '.elevator' ) );
	elevators.forEach( elevator =>
	{
		elevator.className = `elevator rotatable floor-${store[ elevator.id ].currentFloor}`;
	} );
}

/** Updates the rotation of the building */
function changeRotation()
{
	var enabled = Number( document.querySelector( '#switch input' ).value );

	if ( enabled )
	{
		document.querySelector( '#display' ).style.perspective = '1000px';

		var degrees = document.querySelector( '#slider input' ).value;

		document.getElementById( 'building' ).style.transform = `rotateY(${degrees}deg)`;
	}
	else
	{
		document.querySelector( '#display' ).style.perspective = 'none';
	}
}