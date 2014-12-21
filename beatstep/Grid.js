// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function Grid (output)
{
    this.output = output;

    this.arraySize = 2 * 8;
    this.currentButtonColors = initArray (BEATSTEP_BUTTON_STATE_OFF, this.arraySize);
    this.buttonColors = initArray (BEATSTEP_BUTTON_STATE_OFF, this.arraySize);
}

Grid.prototype.light = function (index, color)
{
    this.buttonColors[index] = color;
};

Grid.prototype.lightEx = function (x, y, color)
{
    this.buttonColors[x + 8 * y] = color;
};

// Forces redraw of grid button
Grid.prototype.invalidate = function (index)
{
    this.currentButtonColors[index] = BEATSTEP_BUTTON_STATE_INVALID;
};

Grid.prototype.flush = function ()
{
    for (var i = 0; i < this.arraySize; i++)
    {
        if (this.currentButtonColors[i] == this.buttonColors[i])
            continue;
        this.currentButtonColors[i] = this.buttonColors[i];
        this.setPadColor (i, this.buttonColors[i]);
    }
};

Grid.prototype.turnOff = function ()
{
    for (var i = 0; i < this.arraySize; i++)
        this.buttonColors[i] = BEATSTEP_BUTTON_STATE_OFF;
    this.flush ();
};

Grid.prototype.setPadColor = function (index, color)
{
    var pad = index < 8 ? BEATSTEP_PAD_9 + index : BEATSTEP_PAD_1 + (index - 8);
    this.output.sendSysex (Beatstep.SYSEX_HEADER + toHexStr ([pad, color]) + Beatstep.SYSEX_END);
};
