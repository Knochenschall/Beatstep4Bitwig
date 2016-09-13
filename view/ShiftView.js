// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ShiftView (model)
{
    if (model == null)
        return;
    AbstractView.call (this, model);
}
ShiftView.prototype = new AbstractView ();

ShiftView.prototype.drawGrid = function ()
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

ShiftView.prototype.onGridNote = function (note, velocity)
{
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
            // Use previousViewId because the current is the ShiftView
            if (this.surface.previousViewId == viewIndex && this.surface.previousViewId == VIEW_PLAY)
            {
                var view = this.surface.getView (VIEW_PLAY);
                view.isMacrosActive = !view.isMacrosActive;
            }
            
            this.surface.setActiveView (viewIndex);
            
            var view = this.surface.getActiveView ();
            if (this.surface.isActiveView (VIEW_PLAY))
                displayNotification (view.name + " - " + (view.isMacrosActive ? "Macro" : "Track"));
            else
                displayNotification (view.name);
            break;
    }
};
