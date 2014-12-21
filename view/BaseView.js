// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BaseView (model, name)
{
    AbstractView.call (this, model);
    this.name = name;
}
BaseView.prototype = new AbstractView ();

BaseView.prototype.updateNoteMapping = function ()
{
    this.surface.setKeyTranslationTable (this.model.getScales ().getEmptyMatrix ());
};

BaseView.prototype.onTrackKnob = function (index, value)
{
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
            tb.setCrossfadeModeAsNumber (selectedTrack.index, changeValue (value, tb.getCrossfadeModeAsNumber (selectedTrack.index), 1, 2));
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
