// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

loadAPI (1);

load ("Config.js");
load ("framework/ClassLoader.js");
load ("beatstep/ClassLoader.js");
load ("view/ClassLoader.js");
load ("Controller.js");

// This is the only global variable, do not use it.
var controller = null;

host.defineController ("Arturia", "BeatstepPro4Bitwig", "2.02", "7264A210-5EFE-11E5-A837-0800200C9A66", "Jürgen Moßgraber");
host.defineMidiPorts (1, 1);

host.defineSysexIdentityReply ("F0 7E 7F 06 02 00 20 6B 02 00 07 00 ?? ?? ?? ?? F7");

createDeviceDiscoveryPairs ("Arturia Beatstep Pro");

function init ()
{
    controller = new Controller (true);
    println ("Initialized.");
}

function exit ()
{
    if (controller)
        controller.shutdown ();
}

function flush ()
{
    if (controller)
        controller.flush ();
}
