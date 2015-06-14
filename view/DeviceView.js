// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceView (model)
{
    AbstractView.call (this, model);
    this.name = "Device";
    this.editDirectParameters = false;
    this.currentPage = 0;
    this.isLayer = false;
}
DeviceView.prototype = new AbstractView ();
DeviceView.prototype.constructor = DeviceView;

//--------------------------------------
// Knobs
//--------------------------------------

DeviceView.prototype.onKnob = function (index, value)
{
    var cd = this.model.getCursorDevice ();
    if (index < 8)
    {
        if (this.editDirectParameters)
        {
            var params = cd.getDirectParameters ();
            var pos = this.currentPage * 8 + index;
            if (pos < params.length)
                cd.changeDirectParameter (pos, value, this.surface.getFractionValue ());
        }
        else
        {
            var param = cd.getFXParam (index);
            param.value = this.surface.changeValue (value, param.value);
            cd.setParameter (index, param.value);
        }
    }
    else
    {
        index = index - 8;
        var v = this.surface.changeValue (value, cd.getMacroParam (index).value);
        cd.getMacro (index).getAmount ().set (v, Config.maxParameterValue);
    }
};

DeviceView.prototype.onGridNote = function (note, velocity)
{
    if (velocity == 0)
        return;
        
    if (!this.model.hasSelectedDevice ())
        return;
        
    var cd = this.model.getCursorDevice ();

    switch (note - 36)
    {
        // Toggle device on/off
        case 0:
            cd.toggleEnabledState ();
            break;
            
        // Device Left
        case 1:
            if (this.isLayer)
            {
                var sel = cd.getSelectedLayer ();
                var index = sel == null || sel.index == 0 ? 0 : sel.index - 1;
                cd.selectLayer (index);
            }
            else
                cd.selectPrevious ();
            break;
            
        // Device Right
        case 2:
            if (this.isLayer)
            {
                var sel = cd.getSelectedLayer ();
                var index = sel == null ? 0 : sel.index + 1;
                cd.selectLayer (index > 7 ? 7 : index);
            }
            else
                cd.selectNext ();
            break;
            
        // Enter layer
        case 3:
            if (!cd.hasLayers ())
                return;
            var dl = cd.getSelectedLayerOrDrumPad ();
            if (this.isLayer)
            {
                if (dl != null)
                {
                    cd.enterLayerOrDrumPad (dl.index);
                    cd.selectFirstDeviceInLayerOrDrumPad (dl.index);
                }
            }
            else if (dl == null)
                cd.selectLayerOrDrumPad (0);
            
            this.isLayer = !this.isLayer;
            break;
            
        // Exit layer
        case 4:
            if (this.isLayer)
                this.isLayer = false;
            else
            {
                if (cd.isNested ())
                {
                    cd.selectParent ();
                    cd.selectChannel ();
                    this.isLayer = true;
                }
            }
            
            break;
            
        // Toggle device / direct parameters
        case 5:
            this.editDirectParameters = !this.editDirectParameters;
            displayNotification (this.editDirectParameters ? "Direct Parameters" : "Device Parameters");
            break;
            
        // Param bank pown
        case 6:
            if (this.editDirectParameters)
            {
                var params = cd.getDirectParameters ();
                if (params.length != 0)
                    this.currentPage = Math.max (this.currentPage - 1, 0);
            }
            else
                cd.setSelectedParameterPage (Math.max (cd.getSelectedParameterPage () - 8, 0));
            break;
            
        // Param bank page up
        case 7:
            if (this.editDirectParameters)
            {
                var params = cd.getDirectParameters ();
                if (params.length != 0)
                    this.currentPage = Math.min (this.currentPage + 1, Math.floor (params.length / 8) + (params.length % 8 > 0 ? 1 : 0) - 1);
            }
            else
                cd.setSelectedParameterPage (Math.min (cd.getSelectedParameterPage () + 8, cd.getParameterPageNames ().length - 1));
            break;
            
        default:
            var bank = note - 36 - 8;
            var offset = Math.floor (cd.getSelectedParameterPage () / 8) * 8;
            cd.setSelectedParameterPage (offset + bank);
            break;
    }
};

DeviceView.prototype.drawGrid = function ()
{
    var cd = this.model.getCursorDevice ();
    var offset = Math.floor (cd.getSelectedParameterPage () / 8) * 8;
    for (var i = 0; i < 8; i++)
        this.surface.pads.light (8 + i, offset + i == cd.getSelectedParameterPage () ? BEATSTEP_BUTTON_STATE_BLUE : BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (0, cd.getSelectedDevice ().enabled ? BEATSTEP_BUTTON_STATE_RED: BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (1, BEATSTEP_BUTTON_STATE_BLUE);
    this.surface.pads.light (2, BEATSTEP_BUTTON_STATE_BLUE);
    this.surface.pads.light (3, BEATSTEP_BUTTON_STATE_RED);
    this.surface.pads.light (4, BEATSTEP_BUTTON_STATE_RED);
    this.surface.pads.light (5, this.editDirectParameters ? BEATSTEP_BUTTON_STATE_PINK : BEATSTEP_BUTTON_STATE_OFF);
    this.surface.pads.light (6, BEATSTEP_BUTTON_STATE_BLUE);
    this.surface.pads.light (7, BEATSTEP_BUTTON_STATE_BLUE);
};
