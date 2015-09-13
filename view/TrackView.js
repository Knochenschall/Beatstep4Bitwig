// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function TrackView (model)
{
    BaseView.call (this, model, "Track");
}
TrackView.prototype = new BaseView ();

//--------------------------------------
// Knobs
//--------------------------------------

TrackView.prototype.onKnob = function (index, value)
{
    if (index < 12)
    {
        this.onTrackKnob (index, value);
        return;
    }
    
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    if (selectedTrack == null)
        return;

    switch (index)
    {
        // Send 5 - 6
        case 12:
        case 13:
            tb.changeSend (selectedTrack.index, index - 8, value, this.surface.getFractionValue ());
            break;

        case 14:
            // Not used
            break;

        // Crossfader
        case 15:
            var transport = this.model.getTransport ();
            var v = changeValue (value, transport.getCrossfade (), this.surface.getFractionValue (), Config.maxParameterValue);
            transport.setCrossfade (v);
            break;
    }
};

TrackView.prototype.onGridNote = function (note, velocity)
{
    if (this.surface.isShiftPressed ())
    {
        this.onShiftMode (note, velocity);
        return;
    }
    
    if (velocity == 0)
        return;
        
    switch (note - 36)
    {
        // Play
        case 0:
            if (!this.restartFlag)
            {
                this.model.getTransport ().play ();
                this.doubleClickTest ();
            }
            else
            {
                this.model.getTransport ().stopAndRewind ();
                this.restartFlag = false;
            }
            break;
            
        // Record
        case 1:
            this.model.getTransport ().record ();
            break;
            
        // Repeat
        case 2:
            this.model.getTransport ().toggleLoop ();
            break;
            
        // Click
        case 3:
            this.model.getTransport ().toggleClick ();
            break;
            
        // Tap Tempo
        case 4:
            this.model.getTransport ().tapTempo ();
            break;
            
        // Unused
        case 5:
            break;
            
        // Track Page down
        case 6:
            this.model.getCurrentTrackBank ().scrollTracksPageUp ();
            break;
            
        // Track Page up
        case 7:
            this.model.getCurrentTrackBank ().scrollTracksPageDown ();
            break;
            
        default:
            var track = note - 36 - 8;
            this.model.getCurrentTrackBank ().select (track);
            break;
    }
};

TrackView.prototype.drawGrid = function ()
{
    if (this.surface.isShiftPressed ())
    {
        this.drawShiftMode ();
        return;
    }
    
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
        this.surface.pads.light (8 + i, tb.getTrack (i).selected ? BEATSTEP_BUTTON_STATE_BLUE : BEATSTEP_BUTTON_STATE_OFF);
    var t = this.model.getTransport ();
    this.surface.pads.light (0, t.isPlaying ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_BLUE);
    this.surface.pads.light (1, t.isRecording ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_RED);
    this.surface.pads.light (2, t.isLooping ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (3, t.isClickOn ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (4, BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (5, BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (6, BEATSTEP_BUTTON_STATE_BLUE);
    this.surface.pads.light (7, BEATSTEP_BUTTON_STATE_BLUE);
};
