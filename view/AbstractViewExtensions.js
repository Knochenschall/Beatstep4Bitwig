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

AbstractView.prototype.onShiftMode = function (index, value)
{
    if (value == 0)
        return;
    
    switch (index)
    {
        case 43:
            this.model.getCursorDevice ().toggleWindowOpen ();
            break;
        case 51:
            this.model.getBrowser ().browseForPresets ();
            this.surface.setActiveView (VIEW_BROWSER);
            break;
        default:
            var viewIndex = index - 44;
            if (viewIndex < 0 || viewIndex >= 6)
                return;
            this.surface.setActiveView (viewIndex);
            displayNotification (this.surface.getActiveView ().name);
            break;
    }
};

AbstractView.prototype.drawShiftMode = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.pads.light (i, BEATSTEP_BUTTON_STATE_OFF);
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
