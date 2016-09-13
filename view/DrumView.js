// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

DrumView.NUM_DISPLAY_COLS = 16;

function DrumView (model)
{
    BaseSequencerView.call (this, model, 128, DrumView.NUM_DISPLAY_COLS);
    this.name = "Drum";

    this.offsetY = Scales.DRUM_NOTE_START;
    this.selectedPad = 0;
    this.pressedKeys = initArray (0, 128);

    this.noteMap = this.scales.getEmptyMatrix ();
    
    this.isPlayMode = true;
    
    var tb = model.getTrackBank ();
    tb.addNoteListener (doObject (this, function (pressed, note, velocity)
    {
        // Light notes send from the sequencer
        this.pressedKeys[note] = pressed ? velocity : 0;
    }));
    tb.addTrackSelectionListener (doObject (this, function (index, isSelected)
    {
        this.clearPressedKeys ();
    }));
}
DrumView.prototype = new BaseSequencerView ();

//--------------------------------------
// Knobs
//--------------------------------------

DrumView.prototype.onKnob = function (index, value)
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
            displayNotification (this.resolutionsStr[this.selectedIndex]);
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
            this.offsetY = Scales.DRUM_NOTE_START + this.scales.getDrumOctave () * 16;
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

DrumView.prototype.onGridNote = function (note, velocity)
{
    if (!this.model.canSelectedTrackHoldNotes ())
        return;

    var index = note - 36;
   
    if (this.isPlayMode)
    {
        this.selectedPad = index;   // 0-16

        // Mark selected note
        this.pressedKeys[this.offsetY + this.selectedPad] = velocity;
    }
    else
    {
        if (velocity != 0)
            this.clip.toggleStep (index < 8 ? index + 8 : index - 8, this.offsetY + this.selectedPad, Config.accentActive ? Config.fixedAccentValue : velocity);
    }
};

DrumView.prototype.updateNoteMapping = function ()
{
    this.noteMap = this.model.canSelectedTrackHoldNotes () && this.isPlayMode ? this.scales.getDrumMatrix () : this.scales.getEmptyMatrix ();
    this.surface.setKeyTranslationTable (this.noteMap);
};

DrumView.prototype.drawGrid = function ()
{
    if (!this.model.canSelectedTrackHoldNotes ())
    {
        this.surface.pads.turnOff ();
        return;
    }

    if (this.isPlayMode)
    {
        var primary = this.model.getTrackBank ().primaryDevice;
        var hasDrumPads = primary.hasDrumPads ();
        var isSoloed = false;
        if (hasDrumPads)
        {
            for (var i = 0; i < 16; i++)
            {
                if (primary.getDrumPad (i).solo)
                {
                    isSoloed = true;
                    break;
                }
            }
        }
        var isRecording = this.model.hasRecordingState ();
        for (var y = 0; y < 2; y++)
        {
            for (var x = 0; x < 8; x++)
            {
                var index = 8 * y + x;
                this.surface.pads.lightEx (x, y, this.getPadColor (index, primary, hasDrumPads, isSoloed, isRecording), null, false);
            }
        }
    }
    else
    {    
        // Paint the sequencer steps
        var step = this.clip.getCurrentStep ();
        var hiStep = this.isInXRange (step) ? step % DrumView.NUM_DISPLAY_COLS : -1;
        for (var col = 0; col < DrumView.NUM_DISPLAY_COLS; col++)
        {
            var isSet = this.clip.getStep (col, this.offsetY + this.selectedPad);
            var hilite = col == hiStep;
            var x = col % 8;
            var y = Math.floor (col / 8);
            this.surface.pads.lightEx (x, 1 - y, isSet ? (hilite ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_BLUE) : hilite ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_OFF, null, false);
        }
    }
};

DrumView.prototype.clearPressedKeys = function ()
{
    for (var i = 0; i < 128; i++)
        this.pressedKeys[i] = 0;
};

DrumView.prototype.getPadColor = function (index, primary, hasDrumPads, isSoloed, isRecording)
{
    // Playing note?
    if (this.pressedKeys[this.offsetY + index] > 0)
        return BEATSTEP_BUTTON_STATE_PINK;
    // Selected?
    if (this.selectedPad == index)
        return BEATSTEP_BUTTON_STATE_RED;
    // Exists and active?
    var drumPad = primary.getDrumPad (index);
    if (!drumPad.exists || !drumPad.activated)
        return BEATSTEP_BUTTON_STATE_OFF;
    // Muted or soloed?
    if (drumPad.mute || (isSoloed && !drumPad.solo))
        return BEATSTEP_BUTTON_STATE_OFF;
    return BEATSTEP_BUTTON_STATE_BLUE;
};
