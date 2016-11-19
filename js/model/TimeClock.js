/**
 * TimeClock class represent the Time of an event: check in or check out
 */
function TimeClock()
{
	this.Time = 0;
	this.In = false;
	this.Out = false;
	
	// heritage
	MproEntity.call(this);
}