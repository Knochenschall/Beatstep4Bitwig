// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AbstractView.prototype.onMainKnob = function (value)
{
    this.model.getTransport ().changePosition (value >= 65, this.surface.isShiftPressed ());
};

AbstractView.prototype.switchToBrowseView = function ()
{        
    if (this.model.getBrowser ().getPresetSession ().isActive)
        this.surface.setActiveView (VIEW_BROWSER);
};

AbstractView.prototype.onStep = function (step, value)
{        
    println(step);
    
    ShiftView.prototype.onGridNote.call (this, 36 + step, value);
};

AbstractView.prototype.updateNoteMapping = function ()
{
    this.surface.setKeyTranslationTable (this.model.getScales ().getEmptyMatrix ());
};

AbstractView.prototype.onTrackKnob = function (index, value)
{
    if (value == 64)
        return;
    
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    if (selectedTrack == null)
        return;

    switch (index)
    {
        case 0:
            tb.changeVolume (selectedTrack.index, value, this.surface.getFractionValue ());
            break;
        case 1:
            tb.changePan (selectedTrack.index, value, this.surface.getFractionValue ());
            break;
            
        case 2:
            tb.setMute (selectedTrack.index, value > 64);
            break;
            
        case 3:
            tb.setSolo (selectedTrack.index, value > 64);
            break;
            
        case 4:
            tb.setCrossfadeModeAsNumber (selectedTrack.index, changeValue (value, tb.getCrossfadeModeAsNumber (selectedTrack.index), 1, 3));
            break;
            
        case 5:
            this.model.getTransport ().changeTempo (value >= 65, this.surface.isShiftPressed ());
            break;
            
        case 6:
            this.model.getTransport ().changePosition (value >= 65, this.surface.isShiftPressed ());
            break;
            
        case 7:
            this.model.getMasterTrack ().changeVolume (value, this.surface.getFractionValue ());
            break;
            
        // Send 1 - 4
        case 8:
        case 9:
        case 10:
        case 11:
            tb.changeSend (selectedTrack.index, index - 8, value, this.surface.getFractionValue ());
            break;
    }
};
