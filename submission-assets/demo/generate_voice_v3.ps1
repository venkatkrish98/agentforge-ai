Add-Type -AssemblyName System.Speech

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0  # natural, clear, conversational speed

$wavPath = "C:\Agentforge-AI\submission-assets\demo\voiceover.wav"
$srtPath = "C:\Agentforge-AI\submission-assets\demo\captions.srt"

$scenes = @(
    @{
        Scene = 1
        Name = "Intro & Overview"
        Text = "Welcome to AgentForge AI, an AI-assisted coding and test-repair workspace built for the Nebius and NVIDIA Global AI Hackathon. Traditional AI coding assistants act as conversational chatbots, leaving developers to manually copy snippets, fix syntax errors, and debug runtime failures. AgentForge AI turns a coding task into an evidence-backed, human-reviewed, and verified repair loop."
    },
    @{
        Scene = 2
        Name = "CalcVault Selection"
        Text = "Here in the developer workbench, we select CalcVault, a financial math operations engine with two critical unit test failures. Safe-divide returns NaN on a zero denominator instead of throwing an error, and compound interest calculations fail due to rate scaling and an exponent defect. Let's start the repair run."
    },
    @{
        Scene = 3
        Name = "Model Settings & Live Nebius Diagnostic"
        Text = "In Model Settings, AgentForge AI connects live to Nebius Token Factory, streaming low-latency inference using NVIDIA Nemotron 3.5 Lightning. Watch our live connection diagnostic: the verification ping succeeds with healthy latency and zero authentication errors. All API credentials remain strictly server-isolated, fully masked, and never exposed to client bundles or child processes."
    },
    @{
        Scene = 4
        Name = "Autonomous Plan Formulating"
        Text = "Returning to the workspace, Nemotron analyzes the repository AST and formulates a five-phase plan: diagnose division checks, formulate surgical repairs, snapshot prior state, run the test suite, and compile verification evidence. The agent maps out each phase before modifying any source code."
    },
    @{
        Scene = 5
        Name = "Code Diff & Human Approval Gate"
        Text = "Switching to the Code Diff tab, we see the generated unified diff. It introduces defensive zero guards and corrects the compound interest formula. Notice our core safety principle: the Human Approval Gate. No files are written to disk and no execution occurs until an engineer reviews the proposed diff. The developer maintains complete authority, with the choice to approve or reject with instant rollback."
    },
    @{
        Scene = 6
        Name = "Approve & 143ms Real Test Execution"
        Text = "We click Approve and Run Tests. The test runner executes as a host subprocess governed by strict command allowlists, directory containment, and purged environment variables. Watch the real execution: all five assertions pass with exit code zero in just 143 milliseconds. Zero division throws the expected error, and compounding matches exact currency precision."
    },
    @{
        Scene = 7
        Name = "Final Evidence & Patch Export"
        Text = "In the Final Report tab, AgentForge AI synthesizes evidence: verified test checklists, duration metrics, and loop detection fingerprints. We click Export Patch to immediately download a standard git-compatible unified patch file ready for pull request review."
    },
    @{
        Scene = 8
        Name = "Summary & Conclusion"
        Text = "AgentForge AI brings deterministic evidence and human oversight to generative coding, powered by NVIDIA Nemotron on Nebius Token Factory. Safe, verified, and developer-first."
    }
)

$sceneAudioFiles = @()
$sceneTimings = @()
$srtEntries = [System.Collections.Generic.List[string]]::new()
$srtIndex = 1
$currentCumulativeTime = 0.0

function Format-SrtTime([double]$sec) {
    $ts = [TimeSpan]::FromSeconds($sec)
    return ("{0:00}:{1:00}:{2:00},{3:000}" -f [int]$ts.TotalHours, $ts.Minutes, $ts.Seconds, $ts.Milliseconds)
}

# Synthesize each scene as an independent audio chunk so timing is 100% mathematically exact!
for ($i = 0; $i -lt $scenes.Count; $i++) {
    $sc = $scenes[$i]
    $chunkWav = "C:\Agentforge-AI\submission-assets\demo\chunk_$($sc.Scene).wav"
    $sceneAudioFiles += $chunkWav
    
    $localSynth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $localSynth.Rate = 1
    $localSynth.SetOutputToWaveFile($chunkWav)
    
    $wordEvents = [System.Collections.Generic.List[PSObject]]::new()
    $localSynth.add_SpeakProgress({
        param($s, $e)
        $wordEvents.Add([PSCustomObject]@{
            Time = $e.AudioPosition.TotalSeconds
            Word = $e.Text
        })
    })
    
    $localSynth.Speak($sc.Text)
    $localSynth.Dispose()
    
    # Get exact duration of this chunk via ffprobe
    $chunkDur = [double](ffprobe -v error -show_entries format=duration -of csv=p=0 $chunkWav)
    
    $sceneStart = $currentCumulativeTime
    $sceneEnd = $sceneStart + $chunkDur
    
    $sceneTimings += [PSCustomObject]@{
        Scene = $sc.Scene
        Name = $sc.Name
        Start = $sceneStart
        End = $sceneEnd
        Duration = $chunkDur
        Wav = $chunkWav
    }
    
    # Generate subtitles for this scene with exact cumulative offsets
    $words = $sc.Text -split "\s+" | Where-Object { $_.Length -gt 0 }
    $chunkSize = 6
    for ($w = 0; $w -lt $words.Count; $w += $chunkSize) {
        $cEnd = [Math]::Min($w + $chunkSize - 1, $words.Count - 1)
        $chunkWords = $words[$w..$cEnd] -join " "
        
        $subStart = $sceneStart + ($w / $words.Count) * $chunkDur
        $subEnd = $sceneStart + (($cEnd + 1) / $words.Count) * $chunkDur
        
        $srtEntries.Add("$srtIndex")
        $srtEntries.Add(("{0} --> {1}" -f (Format-SrtTime $subStart), (Format-SrtTime $subEnd)))
        $srtEntries.Add($chunkWords)
        $srtEntries.Add("")
        $srtIndex++
    }
    
    $currentCumulativeTime = $sceneEnd
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($srtPath, $srtEntries, $utf8NoBom)

# Now concatenate all audio chunks into master voiceover.wav using ffmpeg
$audioConcatList = "C:\Agentforge-AI\submission-assets\demo\audio_concat.txt"
$concatLines = $sceneTimings | ForEach-Object { "file '$($_.Wav)'" }
[System.IO.File]::WriteAllLines($audioConcatList, $concatLines, $utf8NoBom)

ffmpeg -y -f concat -safe 0 -i $audioConcatList -c copy $wavPath

Write-Host "`nMaster voiceover generated: $wavPath"
$totalDur = [double](ffprobe -v error -show_entries format=duration -of csv=p=0 $wavPath)
Write-Host "Total Verified Audio Duration: $totalDur seconds ($([TimeSpan]::FromSeconds($totalDur).ToString('mm\:ss\.ff')))"

# Output exact scene breakdown table
Write-Host "`nExact Scene Boundaries:"
$sceneTimings | Format-Table Scene, Name, @{N='Start';E={"{0:N2}s" -f $_.Start}}, @{N='End';E={"{0:N2}s" -f $_.End}}, @{N='Duration';E={"{0:N2}s" -f $_.Duration}} -AutoSize
