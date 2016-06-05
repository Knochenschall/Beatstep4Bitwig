// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PlayView (model)
{
    BaseView.call (this, model, "Play");

    this.scales = model.getScales ();
    this.noteMap = this.scales.getEmptyMatrix ();
    this.pressedKeys = initArray (0, 128);
    
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
    
    this.isMacrosActive = false;
}
PlayView.prototype = new BaseView ();

//--------------------------------------
// Knobs
//--------------------------------------

PlayView.prototype.onKnob = function (index, value)
{
    if (this.isMacrosActive && index < 8)
    {
        var cd = this.model.getCursorDevice ();
        var v = this.surface.changeValue (value, cd.getMacroParam (index).value);
        cd.getMacro (index).getAmount ().set (v, Config.maxParameterValue);
        return;
    }
    
    if (index < 12)
    {
        this.onTrackKnob (index, value);
        return;
    }
    
    var isInc = value >= 65;
    
    switch (index)
    {
        // Chromatic
        case 12:
            this.scales.setChromatic (!isInc);
            Config.setScaleInScale (!isInc);
            displayNotification (this.scales.isChromatic () ? "In Key" : "Chromatic");
            break;

        // Base Note
        case 13:
            this.scales.changeScaleOffset (value);
            var scaleBase = Scales.BASES[this.scales.getScaleOffset ()];
            displayNotification (scaleBase);
            Config.setScaleBase (scaleBase);
            break;

        // Scale
        case 14:
            if (isInc)
                this.scales.nextScale ();
            else
                this.scales.prevScale ();
            var scale = this.scales.getName (this.scales.getSelectedScale ());
            Config.setScale (scale);
            displayNotification (scale);
            break;

        // Octave
        case 15:
            this.clearPressedKeys ();
            if (isInc)
                this.scales.incOctave ();
            else
                this.scales.decOctave ();
            displayNotification ("Octave " + (this.scales.octave > 0 ? "+" : "") + this.scales.octave + " (" + this.scales.getRangeText () + ")");
            break;
    }
    
    this.updateNoteMapping ();
};

PlayView.prototype.onGridNote = function (note, velocity)
{
    if (!this.model.canSelectedTrackHoldNotes ())
        return;

    // Mark selected notes
    for (var i = 0; i < 128; i++)
    {
        if (this.noteMap[note] == this.noteMap[i])
            this.pressedKeys[i] = velocity;
    }
};

PlayView.prototype.onPolyAftertouch = function (note, value)
{
    // Translate to current note mapping
    this.surface.sendMidiEvent (0xA0, this.noteMap[note], value);
};

PlayView.prototype.updateNoteMapping = function ()
{
    this.noteMap = this.model.canSelectedTrackHoldNotes () ? this.scales.getNoteMatrix () : this.scales.getEmptyMatrix ();
    // Workaround: https://github.com/git-moss/Push4Bitwig/issues/7
    scheduleTask (doObject (this, function () { this.surface.setKeyTranslationTable (this.noteMap); }), null, 100);
};

PlayView.prototype.drawGrid = function ()
{
    var isKeyboardEnabled = this.model.canSelectedTrackHoldNotes ();
    for (var i = 36; i < 52; i++)
    {
        this.surface.pads.light (i - 36, isKeyboardEnabled ? (this.pressedKeys[i] > 0 ?
            BEATSTEP_BUTTON_STATE_PINK :
            this.scales.getColor (this.noteMap, i)) : BEATSTEP_BUTTON_STATE_OFF, null, false);
    }
};

PlayView.prototype.clearPressedKeys = function ()
{
    for (var i = 0; i < 128; i++)
        this.pressedKeys[i] = 0;
};
