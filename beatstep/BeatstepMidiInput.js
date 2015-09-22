// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BeatstepMidiInput (isPro)
{
    this.isPro = isPro;
    MidiInput.call (this);
}

BeatstepMidiInput.prototype = new MidiInput ();

BeatstepMidiInput.prototype.createNoteInput = function ()
{
    // Control Mode is expected on channel 3 for Pro
    var noteInput = this.port.createNoteInput (this.isPro ? "Control" : "Beatstep",
                                               this.isPro ? "82????" : "80????",  // Note off
                                               this.isPro ? "92????" : "90????",  // Note on
                                               this.isPro ? "A2????" : "A0????",  // Poly Aftertouch
                                               this.isPro ? "B2????" : "B0????"); // CCs
    noteInput.setShouldConsumeEvents (false);

    // Setup the 2 note sequencers and 1 drum sequencer    
    if (this.isPro)
    {
        // Sequencer 1 is on channel 1
        var seq1Port = this.port.createNoteInput ("Seq. 1", "90????", "80????");
        seq1Port.setShouldConsumeEvents (false);
        // Sequencer 2 is on channel 2
        var seq2Port = this.port.createNoteInput ("Seq. 2", "91????", "81????");
        seq2Port.setShouldConsumeEvents (false);
        // Drum Sequencer is on channel 10
        var drumPort = this.port.createNoteInput ("Drums", "9A????", "8A????");
        drumPort.setShouldConsumeEvents (false);
    }
    
    return noteInput;
};
