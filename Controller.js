// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

Scales.OCTAVE_RANGE = 7;


function Controller (isPro)
{
    this.isPro = isPro;
    
    Config.init ();

    var output = new MidiOutput ();
    output.setShouldSendMidiBeatClock (true);
    
    var input = new BeatstepMidiInput (isPro);

    this.scales = new Scales (36,   // Start note 
                              52,   // End note
                              8,    // Number of columns
                              2);   // Number of rows
    
    this.model = new Model (0,              // The MIDI CC at which the user parameters start
                            this.scales,    // The scales object
                            8,              // The number of track to monitor (per track bank)
                            8,              // The number of scenes to monitor (per scene bank)
                            6,              // The number of sends to monitor
                            6,              // The number of filters columns in the browser to monitor
                            16,             // The number of entries in one filter column to monitor
                            16,             // The number of search results in the browser to monitor
                            false);         // Don't navigate groups, all tracks are flat (if true)    
    
    this.surface = new Beatstep (output, input);
    
    this.surface.addViewChangeListener (doObject (this, function (prevViewID, viewID)
    {
        this.surface.pads.redraw ();
        this.updateIndication (viewID);
    }));
    Config.addPropertyListener (Config.SCALES_SCALE, doObject (this, function ()
    {
        this.scales.setScaleByName (Config.scale);
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.SCALES_BASE, doObject (this, function ()
    {
        this.scales.setScaleOffsetByName (Config.scaleBase);
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.SCALES_IN_KEY, doObject (this, function ()
    {
        this.scales.setChromatic (!Config.scaleInKey);
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateNoteMapping ();
    }));
    Config.addPropertyListener (Config.SCALES_LAYOUT, doObject (this, function ()
    {
        this.scales.setScaleLayoutByName (Config.scaleLayout);
        var view = this.surface.getActiveView ();
        if (view != null)
            view.updateNoteMapping ();
    }));

    this.surface.addView (VIEW_TRACK, new TrackView (this.model));
    this.surface.addView (VIEW_DEVICE, new DeviceView (this.model));
    this.surface.addView (VIEW_PLAY, new PlayView (this.model));
    this.surface.addView (VIEW_DRUM, new DrumView (this.model));
    this.surface.addView (VIEW_SEQUENCER, new SequencerView (this.model));
    this.surface.addView (VIEW_SESSION, new SessionView (this.model));
    this.surface.addView (VIEW_BROWSER, new BrowserView (this.model));
    this.surface.addView (VIEW_SHIFT, new ShiftView (this.model));
    
    this.surface.setActiveView (VIEW_TRACK);
    
    // Enable Shift button to send Midi Note 07
    this.surface.output.sendSysex ("F0 00 20 6B 7F 42 02 00 01 5E 09 F7");
}
Controller.prototype = new AbstractController ();

Controller.prototype.updateIndication = function (viewID)
{
    var isTrack  = viewID == VIEW_TRACK;
    var isDevice = viewID == VIEW_DEVICE;
    
    this.model.getCurrentTrackBank ().setIndication (viewID == VIEW_SESSION);
    
    var mt = this.model.getMasterTrack ();
    mt.setVolumeIndication (!isDevice);
        
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    for (var i = 0; i < 8; i++)
    {
        var hasTrackSel = selectedTrack != null && selectedTrack.index == i;
        tb.setVolumeIndication (i, hasTrackSel && !isDevice);
        tb.setPanIndication (i, hasTrackSel && !isDevice);
        for (var j = 0; j < 6; j++)
            tb.setSendIndication (i, j, hasTrackSel && isTrack);

        var cd = this.model.getCursorDevice ();
        cd.getParameter (i).setIndication (isDevice);
        cd.getMacro (i).getAmount ().setIndication (isDevice);
    }
};

function calcKnobSpeed (control, fractionValue)
{
    return (control >= 65 ? control - 64 : control - 64) * fractionValue;
}

Scales.DRUM_NOTE_END = 52;
Scales.DRUM_MATRIX =
[
    0,   1,  2,  3,  4,  5,  6,  7,
    8,   9, 10, 11, 12, 13, 14, 15,
    -1, -1, -1, -1, -1, -1, -1, -1, 
    -1, -1, -1, -1, -1, -1, -1, -1, 
    -1, -1, -1, -1, -1, -1, -1, -1, 
    -1, -1, -1, -1, -1, -1, -1, -1, 
    -1, -1, -1, -1, -1, -1, -1, -1, 
    -1, -1, -1, -1, -1, -1, -1, -1
];
