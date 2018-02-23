function ElevatorController()
{
	this.elevators = Array.from( arguments );
	this.run = false;
	this.loopDuration = store.floorDuration / 2;

	/**
	 * Starts the testing loop
	 * @returns {boolean} - Returns the state of the run variable
	 */
	this.start = function ()
	{
		console.info( `Controller loop started` );

		this.run = true;
		this.runLoop();

		return this.run;
	}

	/**
	 * Stops the testing loop
	 * @returns {boolean} - Returns the state of the run variable
	 */
	this.stop = function ()
	{
		console.info( `Controller loop stopped` );

		this.run = false;

		return this.run;
	}

	/**
	 * Runs a loop calling elevators for testing
	 * @returns {boolean} returns true of the loop continues, false if it doesn't run
	 */
	this.runLoop = function ()
	{
		if ( this.run )
		{
			// Pick a random floor to call
			var floorToCall = Math.floor( Math.random() * Math.floor( store.floors - 1 ) + 1 );

			this.callElevator( floorToCall );

			setTimeout( this.runLoop.bind( this ), this.loopDuration );

			return true;
		}

		return false;
	}

	/**
	 * Adds another elevator to the controller
	 * @param   {Object} elevator - The new Elevator object
	 * @returns {boolean}
	 */
	this.addElevator = function ( elevator )
	{
		console.info( `Elevator ${elevator.id} added to the contorller` );

		this.elevators.push( elevator );

		return true;
	}

	/**
	 * Call en elevator to go to the desired floor
	 * @param   {int} floor - The floor called
	 * @returns {boolean} - Returns true if an elevator call was made, false otherwise
	 */
	this.callElevator = function ( floor )
	{
		if ( !store.floorsCalling.includes( floor ) )
		{
			store.floorsCalling.push( floor );
		}

		var idealElevator = this.getIdealElevatorForFloor( floor, true );

		if ( idealElevator && store[ idealElevator.id ].direction === 0 )
		{
			idealElevator.goToFloor( floor );
			return true;
		}

		return false;
	}

	/**
	 * Gets the next floor being called either up or down
	 * @param   {int} floor - The floor used as the origin of the search
	 * @param   {int} direction - The direction in which to look for the next floor
	 * @returns {(int|boolean)} - Returns the next floor or false if none is found
	 */
	this.getNextCalledFloorInDirection = function ( floor, direction )
	{
		var floorsAhead = store.floorsCalling.filter( nextFloor =>
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
	 * Gets the best elevator to go to a specific floor
	 * @param   {int} floor - The floor that we're testing
	 * @param   {boolean} [includeLazy] - Whether to include elevators that are not moving
	 * @returns {(Object|boolean)} - Returns the best elevator or false if none is found
	 */
	this.getIdealElevatorForFloor = function ( floor, includeLazy )
	{
		if( typeof floor === 'undefined' || !floor )
			return false;
			
		// Determine if we already have any elevators on the way
		var elevatorsOnTheWay = this.getElevatorsHeadingToFloor( floor );

		if ( elevatorsOnTheWay.length )
		{
			// Reduce to the single closest elevator
			elevatorsOnTheWay = [ this.getClosestElevator( floor, elevatorsOnTheWay ) ];
		}

		if ( includeLazy )
		{
			// We look for elevators not doing anything
			var lazyElevators = this.elevators.filter( elevator => store[ elevator.id ].direction === 0 );

			if ( lazyElevators.length )
				elevatorsOnTheWay = elevatorsOnTheWay.concat( lazyElevators );
		}

		if ( elevatorsOnTheWay.length )
			return this.getClosestElevator( floor, elevatorsOnTheWay );
		else
			return false;
	}

	/**
	 * Gets a list of elevators heading towards a specific floor
	 * @param   {int} floor - The floor that we want to test
	 * @returns {Object[]} - An array containing all of the elevators heading to the floor
	 */
	this.getElevatorsHeadingToFloor = function ( floor )
	{
		return this.elevators.filter( elevator =>
		{
			if ( store[ elevator.id ].currentFloor < floor && store[ elevator.id ].direction == 1 )
				return true;
			else if ( store[ elevator.id ].currentFloor > floor && store[ elevator.id ].direction == -1 )
				return true;
			else if ( store[ elevator.id ].currentFloor === floor )
				return true;
			else
				return false;
		} );
	}

	/**
	 * Gets the elevator closest to a floor from a list of elevators
	 * @param   {int} floor - The floor that we want to test
	 * @param   {Object[]} [elevators] - An array containing elevators
	 * @returns {(Object|boolean)} - Returns the closest elevator or false if none is found
	 */
	this.getClosestElevator = function ( floor, elevators )
	{
		elevators = ( typeof elevators !== 'undefined' ) ? elevators : this.elevators;

		// If we don't have any elevators to check exit
		if ( !elevators.length ) return false;

		return elevators.reduce( ( a, b ) =>
		{
			if ( Math.abs( floor - store[ a.id ].currentFloor ) < Math.abs( floor - store[ b.id ].currentFloor ) )
				return a;
			else
				return b;
		} );
	}
}