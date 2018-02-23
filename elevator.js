function Elevator()
{
	this.id = `elevator-${controller.elevators.length + 1}`;

	// Adds a new elevator to the building display
	document.querySelector( '#building' ).innerHTML += `
		<div class="elevator rotatable floor-1" id="${this.id}">
			<div class="back"></div>
			<span class="floors"></span>
		</div>
	`;

	store[ this.id ] = {
		currentFloor: 1,
		direction: 0,
		floorsRequested: []
	};

	/**
	 * Tells the elevator to go in the direction of a floor, no guarantee it will get there
	 * @param   {int} floor - The floor to head towards
	 * @returns {boolean} - Returns true if the elevator headed to the floor, false otherwise
	 */
	this.goToFloor = function ( floor )
	{
		// If we're asking for a floor that is out of bounds of the building
		if ( floor > store.floors || floor < 1 )
		{
			console.error( `Elevator ${this.id} asked to go to floor ${floor}. No such floor exists.` );
			return false;
		}

		if ( floor > store[ this.id ].currentFloor )
		{
			console.log( `Elevator ${this.id} going up to floor ${floor}.` );
			store[ this.id ].direction = 1;
		}
		else if ( floor < store[ this.id ].currentFloor )
		{
			console.log( `Elevator ${this.id} going down to floor ${floor}.` );
			store[ this.id ].direction = -1;
		}
		else
		{
			console.warn( `Elevator ${this.id} asked to go to same floor, floor ${floor}.` );
			store[ this.id ].direction = 0;
		}

		// If we decided we actually need to move
		if ( store[ this.id ].direction !== 0 )
		{
			var nextFloor = store[ this.id ].currentFloor + store[ this.id ].direction;

			// Set current floor
			store[ this.id ].currentFloor = nextFloor;

			// Take time to perform action
			setTimeout( this.arriveAtFloor.bind( this ), store.floorDuration, nextFloor );
		}
		else
		{
			this.pickUpPassengers();
		}

		return true;
	}

	/**
	 * Called when the elevator arrives at a new floor, checks if floor has been called
	 * @param   {int} floor - The floor that the elevator has arrived at
	 * @returns {boolean}
	 */
	this.arriveAtFloor = function ( floor )
	{
		console.log( `Elevator ${this.id} arrived at floor ${floor}.` );

		// Set current floor
		store[ this.id ].currentFloor = floor;

		// Pick up passengers on floor
		if ( store.floorsCalling.includes( floor ) || store[ this.id ].floorsRequested.includes( floor ) )
			this.pickUpPassengers();
		else
			this.proceed();

		return true;
	}

	/**
	 * Pick up passengers at the current floor
	 * @returns {boolean}
	 */
	this.pickUpPassengers = function ()
	{
		console.log( `Elevator ${this.id} picking up passengers at floor ${store[ this.id ].currentFloor}.` );

		// We only have passengers to pick up if the floor was called
		if ( store.floorsCalling.includes( store[ this.id ].currentFloor ) )
		{
			// Anywhere between 1-2 passengers
			var numPassengers = Math.floor( Math.random() * Math.floor( 1 ) + 1 );

			// Each passenger wants to press a floor button
			for ( var i = 0; i < numPassengers; i++ )
			{
				var floor = Math.floor( Math.random() * Math.floor( store.floors - 1 ) + 1 );
				this.requestFloor( floor );
			}
		}

		// Remove this floor from the list of floors called
		if ( store.floorsCalling.includes( store[ this.id ].currentFloor ) )
			store.floorsCalling.splice( store.floorsCalling.indexOf( store[ this.id ].currentFloor ), 1 );

		if ( store[ this.id ].floorsRequested.includes( store[ this.id ].currentFloor ) )
			store[ this.id ].floorsRequested.splice( store[ this.id ].floorsRequested.indexOf( store[ this.id ].currentFloor ), 1 );

		this.updateFloorDisplay();

		// Take time to perform action
		setTimeout( this.proceed.bind( this ), store.pickupDuration );

		return true;
	}

	/**
	 * Request for the elevator to go to a floor
	 * @param   {int} floor - The floor called
	 * @returns {boolean} - Returns true if the floor was added, false otherwise
	 */
	this.requestFloor = function ( floor )
	{
		if ( !store[ this.id ].floorsRequested.includes( floor ) )
		{
			store[ this.id ].floorsRequested.push( floor );

			this.updateFloorDisplay();

			return true;
		}

		return false;
	}

	/**
	 * Gets the next floor requested in a specific direction
	 * @param   {int} floor - The floor used as the origin of the search
	 * @param   {int} direction - The direction in which to look for the next floor
	 * @returns {(int|boolean)} - Returns the next floor or false if none is found
	 */
	this.getNextRequestedFloorInDirection = function ( floor, direction )
	{
		var floorsAhead = store[ this.id ].floorsRequested.filter( nextFloor =>
		{
			if ( direction === 1 )
				return nextFloor > floor;
			else if ( direction === -1 )
				return nextFloor < floor;
			else
				return false;
		} );

		if ( floorsAhead.length )
			return Math.min( ...floorsAhead );
		else
			return false;
	}

	/**
	 * Determines if the elevator has a next destination and acts accordingly
	 * @returns {boolean} - True if elevator has a next destination, false otherwise
	 */
	this.proceed = function ()
	{
		// Get next floor requested in the direction we're headed
		var nextCalledFloor = controller.getNextCalledFloorInDirection( store[ this.id ].currentFloor, store[ this.id ].direction );
		var nextRequestedFloor = this.getNextRequestedFloorInDirection( store[ this.id ].currentFloor, store[ this.id ].direction );

		// Try the opposite direction
		if( !nextCalledFloor && !nextRequestedFloor )
		{
			var nextCalledFloor = controller.getNextCalledFloorInDirection( store[ this.id ].currentFloor, -store[ this.id ].direction );
			var nextRequestedFloor = this.getNextRequestedFloorInDirection( store[ this.id ].currentFloor, -store[ this.id ].direction );
		}

		if ( nextCalledFloor || nextRequestedFloor )
		{
			// Get the best elevator for the job
			var bestElevator = controller.getIdealElevatorForFloor( nextCalledFloor );

			// Is it me?
			if ( this.id === bestElevator.id )
			{
				this.goToFloor( nextCalledFloor );
				return true;
			}
			else if( nextRequestedFloor )
			{
				this.goToFloor( nextRequestedFloor );
				return true;
			}
		}

		// I have nothing to do
		console.log( `Elevator ${this.id} can't find anything to do.` );
		store[ this.id ].direction = 0;
		return false;
	}

	/**
	 * Updates the floor display on the elevator
	 */
	this.updateFloorDisplay = function ()
	{
		var floors = store[ this.id ].floorsRequested.join( ' ' );
		document.querySelector( `#${this.id} > .floors` ).innerHTML = floors;
	}
}