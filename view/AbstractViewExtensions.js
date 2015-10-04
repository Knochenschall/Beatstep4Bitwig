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

AbstractView.prototype.switchToBrowseView = function ()
{        
    if (this.model.getBrowser ().getPresetSession ().isActive)
        this.surface.setActiveView (VIEW_BROWSER);
};
