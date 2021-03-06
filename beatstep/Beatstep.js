// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

var BEATSTEP_BUTTON_STATE_INVALID = -1;
var BEATSTEP_BUTTON_STATE_OFF     = 0;
var BEATSTEP_BUTTON_STATE_RED     = 1;
var BEATSTEP_BUTTON_STATE_BLUE    = 16;
var BEATSTEP_BUTTON_STATE_PINK    = 17;

Scales.SCALE_COLOR_OFF          = BEATSTEP_BUTTON_STATE_OFF;
Scales.SCALE_COLOR_OCTAVE       = BEATSTEP_BUTTON_STATE_RED;
Scales.SCALE_COLOR_NOTE         = BEATSTEP_BUTTON_STATE_BLUE;
Scales.SCALE_COLOR_OUT_OF_SCALE = BEATSTEP_BUTTON_STATE_OFF;

var BEATSTEP_KNOB_1     = 20;
var BEATSTEP_KNOB_2     = 21;
var BEATSTEP_KNOB_3     = 22;
var BEATSTEP_KNOB_4     = 23;
var BEATSTEP_KNOB_5     = 24;
var BEATSTEP_KNOB_6     = 25;
var BEATSTEP_KNOB_7     = 26;
var BEATSTEP_KNOB_8     = 27;
var BEATSTEP_KNOB_9     = 30;
var BEATSTEP_KNOB_10    = 31;
var BEATSTEP_KNOB_11    = 32;
var BEATSTEP_KNOB_12    = 33;
var BEATSTEP_KNOB_13    = 34;
var BEATSTEP_KNOB_14    = 35;
var BEATSTEP_KNOB_15    = 36;
var BEATSTEP_KNOB_16    = 37;
var BEATSTEP_KNOB_MAIN  = 40;
                        
var BEATSTEP_PRO_STEP1  = 50;
var BEATSTEP_PRO_STEP2  = 51;
var BEATSTEP_PRO_STEP3  = 52;
var BEATSTEP_PRO_STEP4  = 53;
var BEATSTEP_PRO_STEP5  = 54;
var BEATSTEP_PRO_STEP6  = 55;
var BEATSTEP_PRO_STEP7  = 56;
var BEATSTEP_PRO_STEP8  = 57;
var BEATSTEP_PRO_STEP9  = 58;
var BEATSTEP_PRO_STEP10 = 59;
var BEATSTEP_PRO_STEP11 = 60;
var BEATSTEP_PRO_STEP12 = 61;
var BEATSTEP_PRO_STEP13 = 62;
var BEATSTEP_PRO_STEP14 = 63;
var BEATSTEP_PRO_STEP15 = 64;
var BEATSTEP_PRO_STEP16 = 65;

var BEATSTEP_PAD_1  = 0x70;
var BEATSTEP_PAD_2  = 0x71;
var BEATSTEP_PAD_3  = 0x72;
var BEATSTEP_PAD_4  = 0x73;
var BEATSTEP_PAD_5  = 0x74;
var BEATSTEP_PAD_6  = 0x75;
var BEATSTEP_PAD_7  = 0x76;
var BEATSTEP_PAD_8  = 0x77;
var BEATSTEP_PAD_9  = 0x78;
var BEATSTEP_PAD_10 = 0x79;
var BEATSTEP_PAD_11 = 0x7A;
var BEATSTEP_PAD_12 = 0x7B;
var BEATSTEP_PAD_13 = 0x7C;
var BEATSTEP_PAD_14 = 0x7D;
var BEATSTEP_PAD_15 = 0x7E;
var BEATSTEP_PAD_16 = 0x7F;


var BEATSTEP_BUTTONS_ALL = [];

Beatstep.SYSEX_HEADER = "F0 00 20 6B 7F 42 02 00 10 ";
Beatstep.SYSEX_END    = "F7";


function Beatstep (output, input)
{
    AbstractControlSurface.call (this, output, input, BEATSTEP_BUTTONS_ALL);

    for (var i = 36; i < 52; i++)
        this.gridNotes.push (i);
    
    this.isTransportActive = true;
    this.isShift = false;
    
    this.pads = new Grid (output);
}
Beatstep.prototype = new AbstractControlSurface ();

Beatstep.prototype.handleMidi = function (status, data1, data2)
{
    // Filter all channels except the controller channel
    if (controller.isPro)
    {
        var channel = status & 0xF;
        if (channel != 2)
            return;
    }
    
    AbstractControlSurface.prototype.handleMidi.call (this, status, data1, data2);
};

Beatstep.prototype.handleGridNote = function (note, velocity)
{
    AbstractControlSurface.prototype.handleGridNote.call (this, note, velocity);

    if (note < 36 || note > 51)
        return;
    
    // Force a redraw on button up because the light was also modified on the controller
    scheduleTask (doObject (this, function () { this.pads.invalidate (note - 36); }), null, 100);   
};

Beatstep.prototype.handleTouch = function (knob, value)
{
    // Shift button pressed
    if (knob == 7)
    {
        this.isShift = value == 127;
        if (this.isShift)
            this.setActiveView (VIEW_SHIFT);
        else if (this.isActiveView (VIEW_SHIFT))
            this.restoreView ();
        else
            this.pads.redraw ();
    }
};

Beatstep.prototype.setButton = function (button, state)
{
    this.output.sendCC (button, state);
};

Beatstep.prototype.shutdown = function ()
{
    this.pads.turnOff ();
};

Beatstep.prototype.isSelectPressed = function ()
{
    return false;
};

Beatstep.prototype.isShiftPressed = function ()
{
    return this.isShift;
};

// Note: Weird to send to the DAW via Beatstep...
Beatstep.prototype.sendMidiEvent = function (status, data1, data2)
{
    this.noteInput.sendRawMidiEvent (status, data1, data2);
};

//--------------------------------------
// Handlers
//--------------------------------------

Beatstep.prototype.handleEvent = function (cc, value)
{
    var view = this.getActiveView ();
    if (view == null)
        return;
 
    switch (cc)
    {
        case BEATSTEP_KNOB_1:
        case BEATSTEP_KNOB_2:
        case BEATSTEP_KNOB_3:
        case BEATSTEP_KNOB_4:
        case BEATSTEP_KNOB_5:
        case BEATSTEP_KNOB_6:
        case BEATSTEP_KNOB_7:
        case BEATSTEP_KNOB_8:
            view.onKnob (cc - BEATSTEP_KNOB_1, value);
            break;

        case BEATSTEP_KNOB_9:
        case BEATSTEP_KNOB_10:
        case BEATSTEP_KNOB_11:
        case BEATSTEP_KNOB_12:
        case BEATSTEP_KNOB_13:
        case BEATSTEP_KNOB_14:
        case BEATSTEP_KNOB_15:
        case BEATSTEP_KNOB_16:
            view.onKnob (cc - BEATSTEP_KNOB_9 + 8, value);
            break;
            
        case BEATSTEP_KNOB_MAIN:
            view.onMainKnob (value);
            break;
            
        case BEATSTEP_PRO_STEP1:
        case BEATSTEP_PRO_STEP2:
        case BEATSTEP_PRO_STEP3:
        case BEATSTEP_PRO_STEP4:
        case BEATSTEP_PRO_STEP5:
        case BEATSTEP_PRO_STEP6:
        case BEATSTEP_PRO_STEP7:
        case BEATSTEP_PRO_STEP8:
        case BEATSTEP_PRO_STEP9:
        case BEATSTEP_PRO_STEP10:
        case BEATSTEP_PRO_STEP11:
        case BEATSTEP_PRO_STEP12:
        case BEATSTEP_PRO_STEP13:
        case BEATSTEP_PRO_STEP14:
        case BEATSTEP_PRO_STEP15:
        case BEATSTEP_PRO_STEP16:
            view.onStep (cc - BEATSTEP_PRO_STEP1, value);
            break;
            
        default:
            println ("Unused Midi CC: " + cc);
            break;
    }
};
