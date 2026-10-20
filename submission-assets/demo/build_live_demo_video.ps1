$demoDir = "C:\Agentforge-AI\submission-assets\demo"
$clipsDir = "$demoDir\live_clips"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Format-SrtTime([double]$sec) {
    $ts = [TimeSpan]::FromSeconds($sec)
    return ("{0:00}:{1:00}:{2:00},{3:000}" -f [int]$ts.TotalHours, $ts.Minutes, $ts.Seconds, $ts.Milliseconds)
}

$scenes = @(
    @{
        Id = 1
        Text = "Welcome to AgentForge AI, an AI-assisted coding and test-repair workspace built for the Nebius and NVIDIA Global AI Hackathon. Traditional AI coding assistants act as conversational chatbots, leaving developers to manually copy snippets, fix syntax errors, and debug runtime failures. AgentForge AI turns a coding task into an evidence-backed, human-reviewed, and verified repair loop."
    },
    @{
        Id = 2
        Text = "Here in the developer workbench, we select CalcVault, a financial math operations engine with two critical unit test failures. Safe-divide returns NaN on a zero denominator instead of throwing an error, and compound interest calculations fail due to rate scaling and an exponent defect. Let's start the repair run."
    },
    @{
        Id = 3
        Text = "In Model Settings, AgentForge AI connects live to Nebius Token Factory, streaming low-latency inference using NVIDIA Nemotron 3.5 Lightning. Watch our live connection diagnostic: the verification ping succeeds with healthy latency and zero authentication errors. All API credentials remain strictly server-isolated, fully masked, and never exposed to client bundles or child processes."
    },
    @{
        Id = 4
        Text = "Returning to the workspace, Nemotron analyzes the repository AST and formulates a five-phase plan: diagnose division checks, formulate surgical repairs, snapshot prior state, run the test suite, and compile verification evidence. The agent maps out each phase before modifying any source code."
    },
    @{
        Id = 5
        Text = "Switching to the Code Diff tab, we see the generated unified diff. It introduces defensive zero guards and corrects the compound interest formula. Notice our core safety principle: the Human Approval Gate. No files are written to disk and no execution occurs until an engineer reviews the proposed diff. The developer maintains complete authority, with the choice to approve or reject with instant rollback."
    },
    @{
        Id = 6
        Text = "We click Approve and Run Tests. The test runner executes as a host subprocess governed by strict command allowlists, directory containment, and purged environment variables. Watch the real execution: all five assertions pass with exit code zero in just 143 milliseconds. Zero division throws the expected error, and compounding matches exact currency precision."
    },
    @{
        Id = 7
        Text = "In the Final Report tab, AgentForge AI synthesizes evidence: verified test checklists, duration metrics, and loop detection fingerprints. We click Export Patch to immediately download a standard git-compatible unified patch file ready for pull request review."
    },
    @{
        Id = 8
        Text = "AgentForge AI brings deterministic evidence and human oversight to generative coding, powered by NVIDIA Nemotron on Nebius Token Factory. Safe, verified, and developer-first."
    }
)

$sceneClips = @()
$subStyle = "FontSize=14,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1.0,MarginV=15"

for ($i = 0; $i -lt $scenes.Count; $i++) {
    $sc = $scenes[$i]
    $id = $sc.Id
    $wav = "$demoDir\chunk_${id}.wav"
    $srt = "$demoDir\chunk_${id}.srt"
    $clip = "$clipsDir\final_scene_${id}.mp4"
    
    $dur = [double](ffprobe -v error -show_entries format=duration -of csv=p=0 $wav)
    
    # Generate local subtitles for this clip starting from 0.0s
    $words = $sc.Text -split "\s+" | Where-Object { $_.Length -gt 0 }
    $chunkSize = 6
    $srtEntries = [System.Collections.Generic.List[string]]::new()
    $idx = 1
    for ($w = 0; $w -lt $words.Count; $w += $chunkSize) {
        $cEnd = [Math]::Min($w + $chunkSize - 1, $words.Count - 1)
        $chunkWords = $words[$w..$cEnd] -join " "
        
        $subStart = ($w / $words.Count) * $dur
        $subEnd = (($cEnd + 1) / $words.Count) * $dur
        
        $srtEntries.Add("$idx")
        $srtEntries.Add(("{0} --> {1}" -f (Format-SrtTime $subStart), (Format-SrtTime $subEnd)))
        $srtEntries.Add($chunkWords)
        $srtEntries.Add("")
        $idx++
    }
    [System.IO.File]::WriteAllLines($srt, $srtEntries, $utf8NoBom)
    
    $escapedSrt = $srt.Replace("\", "/").Replace(":", "\:")
    
    Write-Host "Encoding Scene $id clip (target: ${dur}s)..."
    
    if ($id -le 7) {
        # Real recorded webm footage
        $rawWebm = "$clipsDir\raw_scene_${id}.webm"
        ffmpeg -y -i $rawWebm -i $wav -t $dur -vf "scale=1920:1080,subtitles='$escapedSrt':force_style='$subStyle'" -c:v libx264 -preset fast -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 44100 $clip | Out-Null
    } else {
        # Scene 8 Closing slide image
        $closingImg = "$demoDir\scene_closing.png"
        ffmpeg -y -loop 1 -framerate 30 -i $closingImg -i $wav -t $dur -vf "scale=1920:1080,subtitles='$escapedSrt':force_style='$subStyle'" -c:v libx264 -preset fast -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 44100 $clip | Out-Null
    }
    
    $clipDur = [double](ffprobe -v error -show_entries format=duration -of csv=p=0 $clip)
    Write-Host "  Scene $id verified: ${clipDur}s"
    $sceneClips += "file '$clip'"
}

# Write concat list
$clipsList = "$clipsDir\clips_list.txt"
[System.IO.File]::WriteAllLines($clipsList, $sceneClips, $utf8NoBom)

# Concatenate all clips into final agentforge-demo.mp4
$finalMp4 = "$demoDir\agentforge-demo.mp4"
Write-Host "`nConcatenating clips into final $finalMp4..."
ffmpeg -y -f concat -safe 0 -i $clipsList -c copy $finalMp4 | Out-Null

Write-Host "`n=== COMPILATION COMPLETE ==="
$finalDur = [double](ffprobe -v error -show_entries format=duration -of csv=p=0 $finalMp4)
$finalSize = (Get-Item $finalMp4).Length
Write-Host "Duration: $finalDur seconds ($([TimeSpan]::FromSeconds($finalDur).ToString('mm\:ss\.ff')))"
Write-Host "Size: $([Math]::Round($finalSize / 1MB, 2)) MB"
Write-Host "Resolution: $(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $finalMp4)"
