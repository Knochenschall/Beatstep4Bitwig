// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BeatstepMidiInput ()
{
    MidiInput.call (this);
}

BeatstepMidiInput.prototype = new MidiInput ();

BeatstepMidiInput.prototype.createNoteInput = function ()
{
    var noteInput = this.port.createNoteInput ("Beatstep",
                                               "80????",  // Note off
                                               "90????",  // Note on
                                               "A0????"); // Poly Aftertouch
    noteInput.setShouldConsumeEvents (false);
    return noteInput;
};
