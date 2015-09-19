// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractView.prototype.onMainKnob = function (value)
{
    this.model.getTransport ().changePosition (value >= 65, this.surface.isShiftPressed ());
};

AbstractView.prototype.canSelectedTrackHoldNotes = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    return t != null && t.canHoldNotes;
};

AbstractView.prototype.onShiftMode = function (note, value)
{
    if (value == 0)
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

        // Toggle window of VSTs
        case 7:
            this.model.getCursorDevice ().toggleWindowOpen ();
            break;
            
        // Open the browser
        case 15:
            this.model.getBrowser ().browseForPresets ();
            scheduleTask (doObject (this, this.switchToBrowseView), [], 75);
            break;

        default:
            var viewIndex = note - 44;
            if (viewIndex < 0 || viewIndex >= 6)
                return;
            this.surface.setActiveView (viewIndex);
            displayNotification (this.surface.getActiveView ().name);
            break;
    }
};

AbstractView.prototype.switchToBrowseView = function ()
{        
    if (this.model.getBrowser ().getPresetSession ().isActive)
        this.surface.setActiveView (VIEW_BROWSER);
};

AbstractView.prototype.drawShiftMode = function ()
{
    var t = this.model.getTransport ();
    this.surface.pads.light (0, t.isPlaying ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_BLUE);
    this.surface.pads.light (1, t.isRecording ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_RED);
    this.surface.pads.light (2, t.isLooping ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (3, t.isClickOn ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_OFF);

    for (var i = 0; i < 4; i++)
        this.surface.pads.light (4 + i, BEATSTEP_BUTTON_STATE_OFF);
    
    this.surface.pads.light (7, BEATSTEP_BUTTON_STATE_PINK);
    this.surface.pads.light (8, BEATSTEP_BUTTON_STATE_RED);
    this.surface.pads.light (9, BEATSTEP_BUTTON_STATE_RED);
    this.surface.pads.light (10, BEATSTEP_BUTTON_STATE_PINK);
    this.surface.pads.light (11, BEATSTEP_BUTTON_STATE_PINK);
    this.surface.pads.light (12, BEATSTEP_BUTTON_STATE_PINK);
    this.surface.pads.light (13, BEATSTEP_BUTTON_STATE_BLUE);
    this.surface.pads.light (14, BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (15, BEATSTEP_BUTTON_STATE_RED);
};
