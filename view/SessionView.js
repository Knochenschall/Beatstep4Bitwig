// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function SessionView (model)
{
    AbstractView.call (this, model);
    this.name = "Session";
}
SessionView.prototype = new AbstractView ();

SessionView.prototype.onKnob = function (index, value)
{
    if (index < 12)
    {
        this.onTrackKnob (index, value);
        return;
    }
    
    switch (index)
    {
        case 12:
        case 13:
        case 14:
            break;
            
        case 15:
            break;
    }
};

SessionView.prototype.onGridNote = function (note, velocity)
{
    if (velocity == 0)
        return;
    
    var index = note - 36;
    switch (index)
    {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            // Not used
            break;

        case 6:
            this.model.getCurrentTrackBank ().scrollScenesPageUp ();
            break;
        
        case 7:
            this.model.getCurrentTrackBank ().scrollScenesPageDown ();
            break;
        
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
            this.model.getCurrentTrackBank ().launchScene (index - 8);
            break;
    }   
};

SessionView.prototype.drawGrid = function ()
{
    for (var i = 0; i < 6; i++)
        this.surface.pads.light (i, BEATSTEP_BUTTON_STATE_OFF);
    for (var i = 6; i < 8; i++)
        this.surface.pads.light (i, BEATSTEP_BUTTON_STATE_BLUE);
    for (var i = 8; i < 16; i++)
        this.surface.pads.light (i, BEATSTEP_BUTTON_STATE_BLUE);
};
