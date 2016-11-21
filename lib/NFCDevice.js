/* 
 * Copyright (C) 2016 Matheus Castello
 * 
 *  There is no peace only passion
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var __nfcAdapter = null;

function NFCDevice()
{	
	var nfcAdapter = null;
	
	this.enableCardEmulation = function()
	{
		if(!nfcAdapter.powered)
			nfcAdapter.cardEmulationMode = "ALWAYS_ON";
		else
			alert("NFC is already ON!");
	};
	
	this.disableCardEmulation = function()
	{
		nfcAdapter.cardEmulationMode = "OFF";
	};
	
	// constructor factory
	(function()
	{
		if(!__nfcAdapter)
			__nfcAdapter = tizen.nfc.getDefaultAdapter();
		
		nfcAdapter = __nfcAdapter;
	})();
}