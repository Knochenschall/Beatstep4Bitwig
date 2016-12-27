// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function TrackView (model)
{
    AbstractView.call (this, model);
    this.name = "Track";
}
TrackView.prototype = new AbstractView ();

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
    if (velocity == 0)
        return;
        
    var tb = this.model.getCurrentTrackBank ();
    
    switch (note - 36)
    {
        // Toggle Activate
        case 0:
            var selectedTrack = tb.getSelectedTrack ();
            if (selectedTrack != null)
                tb.toggleIsActivated (selectedTrack.index);
            break;
            
        // Track left
        case 1:
            var sel = tb.getSelectedTrack ();
            var index = sel == null ? 0 : sel.index - 1;
            if (index == -1 || this.surface.isShiftPressed ())
            {
                if (!tb.canScrollTracksUp ())
                    return;
                tb.scrollTracksPageUp ();
                var newSel = index == -1 || sel == null ? 7 : sel.index;
                scheduleTask (doObject (this, this.selectTrack), [ newSel ], 75);
                return;
            }
            this.selectTrack (index);
            break;
            
        // Track right
        case 2:
            var sel = tb.getSelectedTrack ();
            var index = sel == null ? 0 : sel.index + 1;
            if (index == 8 || this.surface.isShiftPressed ())
            {
                if (!tb.canScrollTracksDown ())
                    return;
                tb.scrollTracksPageDown ();
                var newSel = index == 8 || sel == null ? 0 : sel.index;
                scheduleTask (doObject (this, this.selectTrack), [ newSel ], 75);
                return;
            }
            this.selectTrack (index);
            break;
            
        // Move down
        case 3:
            tb.selectChildren ();
            break;
            
        // Move up
        case 4:
            tb.selectParent ();
            break;
            
        // Unused
        case 5:
            break;
            
        // Track Page down
        case 6:
            tb.scrollTracksPageUp ();
            break;
            
        // Track Page up
        case 7:
            tb.scrollTracksPageDown ();
            break;
            
        default:
            var track = note - 36 - 8;
            this.selectTrack (track);
            break;
    }
};

TrackView.prototype.drawGrid = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
        this.surface.pads.light (8 + i, tb.getTrack (i).selected ? BEATSTEP_BUTTON_STATE_BLUE : BEATSTEP_BUTTON_STATE_OFF);
    
    var sel = tb.getSelectedTrack ();
    this.surface.pads.light (0, sel != null && sel.activated ? BEATSTEP_BUTTON_STATE_RED : BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (1, BEATSTEP_BUTTON_STATE_BLUE);
    this.surface.pads.light (2, BEATSTEP_BUTTON_STATE_BLUE);
    this.surface.pads.light (3, BEATSTEP_BUTTON_STATE_RED);
    this.surface.pads.light (4, BEATSTEP_BUTTON_STATE_RED);
    this.surface.pads.light (5, BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (6, BEATSTEP_BUTTON_STATE_BLUE);
    this.surface.pads.light (7, BEATSTEP_BUTTON_STATE_BLUE);
};
