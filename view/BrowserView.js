// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

BrowserView.COLUMN_ORDER = [ 1, 0, 4, 5, 2, 3 ];

function BrowserView (model)
{
    BaseView.call (this, model, "Browser");
}
BrowserView.prototype = new BaseView ();

//--------------------------------------
// Knobs
//--------------------------------------

BrowserView.prototype.onKnob = function (index, value)
{
    var session = this.model.getBrowser ().getPresetSession ();
    if (!session.isActive)
        return;

    switch (index)
    {
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
            var column = index - 8;
            if (value > 64)
            {
                for (var i = 0; i < value - 64; i++)
                    session.selectNextFilterItem (BrowserView.COLUMN_ORDER[column]);
            }
            else
            {
                for (var i = 0; i < 64 - value; i++)
                    session.selectPreviousFilterItem (BrowserView.COLUMN_ORDER[column]);
            }
            break;
            
        case 14:
            // Not used
            break;

        case 15:
            if (value > 64)
            {
                for (var i = 0; i < value - 64; i++)
                    session.selectNextResult ();
            }
            else
            {
                for (var i = 0; i < 64 - value; i++)
                    session.selectPreviousResult ();
            }
            break;
    }
};

BrowserView.prototype.onGridNote = function (note, velocity)
{
    if (velocity == 0)
        return;
        
    switch (note - 36)
    {
        // Cancel
        case 0:
            this.model.getBrowser ().stopBrowsing (false);
            this.surface.restoreView ();
            break;
            
        // OK
        case 7:
            this.model.getBrowser ().stopBrowsing (true);
            this.surface.restoreView ();
            break;
            
        // Not used
        default:
            break;
    }
};

BrowserView.prototype.drawGrid = function ()
{
    for (var i = 0; i < 16; i++)
        this.surface.pads.light (i, BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (0, BEATSTEP_BUTTON_STATE_RED);
    this.surface.pads.light (7, BEATSTEP_BUTTON_STATE_BLUE);
};
