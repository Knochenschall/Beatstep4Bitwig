// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

SequencerView.NUM_DISPLAY_COLS = 16;
SequencerView.START_KEY        = 36;

function SequencerView (model)
{
    AbstractSequencerView.call (this, model, "Sequencer", 128, SequencerView.NUM_DISPLAY_COLS);

    this.offsetY = SequencerView.START_KEY;
    this.selectedPad = 0;
    this.pressedKeys = initArray (0, 128);

    this.noteMap = this.scales.getEmptyMatrix ();
    
    this.isPlayMode = true;
    
    var tb = model.getTrackBank ();
    tb.addNoteListener (doObject (this, function (pressed, note, velocity)
    {
        // Light notes send from the sequencer
        for (var i = 0; i < 128; i++)
        {
            if (this.noteMap[i] == note)
                this.pressedKeys[i] = pressed ? velocity : 0;
        }
    }));
    tb.addTrackSelectionListener (doObject (this, function (index, isSelected)
    {
        this.clearPressedKeys ();
    }));
}
SequencerView.prototype = new AbstractSequencerView ();

//--------------------------------------
// Knobs
//--------------------------------------

SequencerView.prototype.onKnob = function (index, value)
{
    if (index < 12)
    {
        this.onTrackKnob (index, value);
        return;
    }
    
    var isInc = value >= 65;
    
    switch (index)
    {
        case 12:
            this.changeScrollPosition (value);
            break;

        case 13:
            this.changeResolution (value);
            displayNotification (this.resolutionNames[this.selectedIndex]);
            break;

        // Up/Down
        case 14:
            this.clearPressedKeys ();
            if (isInc)
            {
                this.scales.incDrumOctave ();
                this.model.getTrackBank ().primaryDevice.scrollDrumPadsPageDown ();
            }
            else
            {
                this.scales.decDrumOctave ();
                this.model.getTrackBank ().primaryDevice.scrollDrumPadsPageUp ();
            }
            this.offsetY = SequencerView.START_KEY + this.scales.getDrumOctave () * 16;
            this.updateNoteMapping ();
            displayNotification (this.scales.getDrumRangeText ());
            break;

        // Toggle play / sequencer
        case 15:
            this.isPlayMode = !this.isPlayMode;
            displayNotification (this.isPlayMode ? "Play/Select" : "Sequence");
            this.updateNoteMapping ();
            break;
    }
};

SequencerView.prototype.onGridNote = function (note, velocity)
{
    if (this.surface.isShiftPressed ())
    {
        this.onShiftMode (note, velocity);
        return;
    }
    
    if (!this.canSelectedTrackHoldNotes ())
        return;

    var index = note - 36;
   
    if (this.isPlayMode)
    {
        this.selectedPad = index;   // 0-16
        
        // Mark selected notes
        for (var i = 0; i < 128; i++)
        {
            if (this.noteMap[note] == this.noteMap[i])
                this.pressedKeys[i] = velocity;
        }
    }
    else
    {
        if (velocity != 0)
            this.clip.toggleStep (index < 8 ? index + 8 : index - 8, /*this.noteMap[]*/ this.offsetY + this.selectedPad, Config.accentActive ? Config.fixedAccentValue : velocity);
    }
};

SequencerView.prototype.updateNoteMapping = function ()
{
    this.noteMap = this.canSelectedTrackHoldNotes () && this.isPlayMode ? this.scales.getNoteMatrix () : this.scales.getEmptyMatrix ();
    this.surface.setKeyTranslationTable (this.noteMap);
};

SequencerView.prototype.drawGrid = function ()
{
    if (this.surface.isShiftPressed ())
    {
        this.drawShiftMode ();
        return;
    }
    
    if (!this.canSelectedTrackHoldNotes ())
    {
        this.surface.pads.turnOff ();
        return;
    }

    if (this.isPlayMode)
    {
        for (var i = 36; i < 52; i++)
        {
            this.surface.pads.light (i - 36, 
                this.pressedKeys[i] > 0 || this.selectedPad == i - 36 ? 
                BEATSTEP_BUTTON_STATE_PINK :
                this.scales.getColor (this.noteMap, i), null, false);
        }
    }
    else
    {    
        // Paint the sequencer steps
        var step = this.clip.getCurrentStep ();
        var hiStep = this.isInXRange (step) ? step % SequencerView.NUM_DISPLAY_COLS : -1;
        for (var col = 0; col < SequencerView.NUM_DISPLAY_COLS; col++)
        {
            var isSet = this.clip.getStep (col, this.offsetY + this.selectedPad);
            var hilite = col == hiStep;
            var x = col % 8;
            var y = Math.floor (col / 8);
            this.surface.pads.lightEx (x, 1 - y, isSet ? (hilite ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_BLUE) : hilite ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_OFF, null, false);
        }
    }
};

SequencerView.prototype.clearPressedKeys = function ()
{
    for (var i = 0; i < 128; i++)
        this.pressedKeys[i] = 0;
};
