// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

load ("framework/core/AbstractConfig.js");

// ------------------------------
// Static configurations
// ------------------------------

// Inc/Dec of knobs
Config.fractionValue     = 1;
Config.fractionMinValue  = 0.5;
Config.maxParameterValue = 128;

// ------------------------------
// Editable configurations
// ------------------------------

Config.SCALES_SCALE  = 0;
Config.SCALES_BASE   = 1;
Config.SCALES_IN_KEY = 2;
Config.SCALES_LAYOUT = 3;

Config.initListeners (Config.SCALES_LAYOUT);

Config.init = function ()
{
    var prefs = host.getPreferences ();

    ///////////////////////////
    // Scale

    Config.activateScaleSetting (prefs);
    Config.activateScaleBaseSetting (prefs);
    Config.activateScaleInScaleSetting (prefs);
    Config.activateScaleLayoutSetting (prefs);
};
