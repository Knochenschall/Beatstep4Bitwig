// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BaseSequencerView (model, rows, cols)
{
    if (!model) // Called on first prototype creation
        return;
    AbstractSequencerView.call (this, model, rows, cols);
}
BaseSequencerView.prototype = new AbstractSequencerView ();

BaseSequencerView.prototype.changeScrollPosition = function (value)
{
    var isInc = value >= 65;
    if (isInc)
    {
        this.offsetX = this.offsetX + this.clip.getStepSize ();
        this.clip.scrollStepsPageForward ();
    }
    else
    {
        var newOffset = this.offsetX - this.clip.getStepSize ();
        if (newOffset < 0)
            this.offsetX = 0;
        else
        {
            this.offsetX = newOffset;
            this.clip.scrollStepsPageBackwards ();
        }
    }
};

BaseSequencerView.prototype.changeResolution = function (value)
{
    var isInc = value >= 65;
    this.selectedIndex = Math.max (0, (Math.min (this.resolutions.length - 1, isInc ? (this.selectedIndex + 1) : (this.selectedIndex - 1))));
    this.clip.setStepLength (this.resolutions[this.selectedIndex]);
};
