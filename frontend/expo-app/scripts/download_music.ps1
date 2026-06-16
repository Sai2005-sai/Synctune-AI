# ============================================================
#  BGM Library Downloader  -  Kevin MacLeod / Incompetech
#  License: CC BY 4.0  (incompetech.com)
#  Pattern: https://incompetech.com/music/royalty-free/mp3-royaltyfree/<Name>.mp3
# ============================================================

$musicRoot = Join-Path $PSScriptRoot "..\assets\music"
$KM = "https://incompetech.com/music/royalty-free/mp3-royaltyfree"
$ok = 0; $skip = 0; $fail = 0; $failList = @()

function Get-Track($url, $folder, $file) {
    $dir  = Join-Path $musicRoot $folder
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $dest = Join-Path $dir $file
    if (Test-Path $dest) { $script:skip++; return }
    try {
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent","Mozilla/5.0")
        $wc.DownloadFile($url, $dest)
        if ((Get-Item $dest).Length -lt 5000) {
            Remove-Item $dest -Force
            throw "file too small (download likely failed)"
        }
        Write-Host "  OK  $file" -ForegroundColor Green
        $script:ok++
    } catch {
        Write-Host "  ERR $file : $_" -ForegroundColor Red
        $script:fail++; $script:failList += "$folder/$file"
        if (Test-Path $dest) { Remove-Item $dest -Force }
    }
}

# helper: URL-encode a track name the same way the site does
function KM($name, $folder, $file) {
    $encoded = [Uri]::EscapeDataString($name)
    Get-Track "$KM/$encoded.mp3" $folder $file
}

# ── CINEMATIC ────────────────────────────────────────────────────────────────
Write-Host "`n─── CINEMATIC ───" -ForegroundColor Magenta
KM "Strength of the Titans"    cinematic "km-strength-of-the-titans.mp3"
KM "Halo"                       cinematic "km-halo.mp3"
KM "Destiny"                    cinematic "km-destiny.mp3"
KM "Long Road Alone"            cinematic "km-long-road-alone.mp3"
KM "Interloper"                 cinematic "km-interloper.mp3"
KM "Deliberate Thought"         cinematic "km-deliberate-thought.mp3"
KM "Dramatic Bridge 1"          cinematic "km-dramatic-bridge-1.mp3"
KM "Dramatic Bridge 2"          cinematic "km-dramatic-bridge-2.mp3"
KM "Among the Clouds"           cinematic "km-among-the-clouds.mp3"
KM "Crossing the Divide"        cinematic "km-crossing-the-divide.mp3"
KM "Danse Macabre"              cinematic "km-danse-macabre.mp3"
KM "Enchanted Journey"          cinematic "km-enchanted-journey.mp3"
KM "Invariance"                 cinematic "km-invariance.mp3"
KM "Mythos"                     cinematic "km-mythos.mp3"
KM "Sovereign"                  cinematic "km-sovereign.mp3"
KM "Titan"                      cinematic "km-titan.mp3"
KM "Vanishing"                  cinematic "km-vanishing.mp3"
KM "False Conspiracy"           cinematic "km-false-conspiracy.mp3"
KM "Impact Prelude"             cinematic "km-impact-prelude.mp3"
KM "Mesmerizing Galaxy Loop"    cinematic "km-mesmerizing-galaxy-loop.mp3"

# ── ENERGETIC ────────────────────────────────────────────────────────────────
Write-Host "`n─── ENERGETIC ───" -ForegroundColor Magenta
KM "Spy Glass"                  energetic "km-spy-glass.mp3"
KM "The Complex"                energetic "km-the-complex.mp3"
KM "Faster Does It"             energetic "km-faster-does-it.mp3"
KM "Scheming Weasel"            energetic "km-scheming-weasel.mp3"
KM "Take a Chance"              energetic "km-take-a-chance.mp3"
KM "Mischief Maker"             energetic "km-mischief-maker.mp3"
KM "Sneaky Snitch"              energetic "km-sneaky-snitch.mp3"
KM "Thinking Music"             energetic "km-thinking-music.mp3"
KM "Investigations"             energetic "km-investigations.mp3"
KM "Cut and Run"                energetic "km-cut-and-run.mp3"
KM "Digital Lemonade"           energetic "km-digital-lemonade.mp3"
KM "Bit Quest"                  energetic "km-bit-quest.mp3"
KM "Electrodoodle"              energetic "km-electrodoodle.mp3"
KM "Hyperfun"                   energetic "km-hyperfun.mp3"
KM "Pump"                       energetic "km-pump.mp3"
KM "Run Amok"                   energetic "km-run-amok.mp3"
KM "Volatile Reaction"          energetic "km-volatile-reaction.mp3"
KM "Brittle Rille"              energetic "km-brittle-rille.mp3"
KM "Cloud Dancer"               energetic "km-cloud-dancer.mp3"
KM "Quirky Dog"                 energetic "km-quirky-dog.mp3"

# ── HAPPY ────────────────────────────────────────────────────────────────────
Write-Host "`n─── HAPPY ───" -ForegroundColor Magenta
KM "Carefree"                   happy "km-carefree.mp3"
KM "Happy Go Lucky Street"      happy "km-happy-go-lucky-street.mp3"
KM "Happy Alley"                happy "km-happy-alley.mp3"
KM "Bright Wish"                happy "km-bright-wish.mp3"
KM "Life of Riley"              happy "km-life-of-riley.mp3"
KM "Paradise Found"             happy "km-paradise-found.mp3"
KM "Bumbly March"               happy "km-bumbly-march.mp3"
KM "Folk Round"                 happy "km-folk-round.mp3"
KM "Fantasia"                   happy "km-fantasia.mp3"
KM "Marty Gots a Plan"          happy "km-marty-gots-a-plan.mp3"
KM "New Land"                   happy "km-new-land.mp3"
KM "Poppers and Prosecco"       happy "km-poppers-and-prosecco.mp3"
KM "Cha Cha Matador"            happy "km-cha-cha-matador.mp3"
KM "Fluffing a Duck"            happy "km-fluffing-a-duck.mp3"
KM "Happy Happy Game Show"      happy "km-happy-happy-game-show.mp3"
KM "Merry Go"                   happy "km-merry-go.mp3"
KM "Feather Theme"              happy "km-feather-theme.mp3"
KM "Dewdrop Fantasy"            happy "km-dewdrop-fantasy.mp3"
KM "Sonatina in C Major"        happy "km-sonatina-in-c-major.mp3"
KM "Boogie Party"               happy "km-boogie-party.mp3"

# ── SAD ──────────────────────────────────────────────────────────────────────
Write-Host "`n─── SAD ───" -ForegroundColor Magenta
KM "Heartbreaking"              sad "km-heartbreaking.mp3"
KM "Oppressive Gloom"           sad "km-oppressive-gloom.mp3"
KM "Sad Trio"                   sad "km-sad-trio.mp3"
KM "Gymnopedie No 1"            sad "km-gymnopedie-no1.mp3"
KM "Hurt"                       sad "km-hurt.mp3"
KM "Sinking"                    sad "km-sinking.mp3"
KM "Stages of Grief"            sad "km-stages-of-grief.mp3"
KM "Cryptic Sorrow"             sad "km-cryptic-sorrow.mp3"
KM "Going Home"                 sad "km-going-home.mp3"
KM "Long Note One"              sad "km-long-note-one.mp3"
KM "Melancholy Aftersound"      sad "km-melancholy-aftersound.mp3"
KM "Past Sadness"               sad "km-past-sadness.mp3"
KM "Possible Light"             sad "km-possible-light.mp3"
KM "Somewhere Sunny"            sad "km-somewhere-sunny.mp3"
KM "Calmant"                    sad "km-calmant.mp3"
KM "Bittersweet"                sad "km-bittersweet.mp3"
KM "Sometimes"                  sad "km-sometimes.mp3"
KM "Nothing Broken"             sad "km-nothing-broken.mp3"
KM "Reflection"                 sad "km-reflection.mp3"
KM "Grand Dark Waltz Trio Vivace" sad "km-grand-dark-waltz.mp3"

# ── CALM ─────────────────────────────────────────────────────────────────────
Write-Host "`n─── CALM ───" -ForegroundColor Magenta
KM "Peaceful Desolation"        calm "km-peaceful-desolation.mp3"
KM "Wallpaper"                  calm "km-wallpaper.mp3"
KM "Slow Burn"                  calm "km-slow-burn.mp3"
KM "Healing"                    calm "km-healing.mp3"
KM "Early Riser"                calm "km-early-riser.mp3"
KM "Morning"                    calm "km-morning.mp3"
KM "Calmly"                     calm "km-calmly.mp3"
KM "Ambient Ambulance"          calm "km-ambient-ambulance.mp3"
KM "Windswept"                  calm "km-windswept.mp3"
KM "Airy"                       calm "km-airy.mp3"
KM "Airship Serenity"           calm "km-airship-serenity.mp3"
KM "Canon in D Major"           calm "km-canon-in-d-major.mp3"
KM "Dreamy Flashback"           calm "km-dreamy-flashback.mp3"
KM "Essence"                    calm "km-essence.mp3"
KM "Infinite Perspective"       calm "km-infinite-perspective.mp3"
KM "Meditation Impromptu 01"    calm "km-meditation-impromptu-01.mp3"
KM "Nights in Vienna"           calm "km-nights-in-vienna.mp3"
KM "That Zen Moment"            calm "km-that-zen-moment.mp3"
KM "Amazing Grace"              calm "km-amazing-grace.mp3"
KM "Hidden Agenda"              calm "km-hidden-agenda.mp3"

# ── INDIAN CLASSICAL (via freepd.com world music + pixabay world) ──────────
Write-Host "`n─── INDIAN / WORLD (calm + cinematic) ───" -ForegroundColor Magenta

# These are public-domain world/Indian-adjacent instrumental tracks from freepd.com
Get-Track "https://freepd.com/music/Algorithms.mp3"             calm        "freepd-algorithms.mp3"
Get-Track "https://freepd.com/music/Almost%20in%20F.mp3"        calm        "freepd-almost-in-f.mp3"
Get-Track "https://freepd.com/music/Ceremonial%20Magic.mp3"     cinematic   "freepd-ceremonial-magic.mp3"
Get-Track "https://freepd.com/music/Mystic%20Force.mp3"         cinematic   "freepd-mystic-force.mp3"
Get-Track "https://freepd.com/music/Meditation%20Aquatic.mp3"   calm        "freepd-meditation-aquatic.mp3"

# ── SUMMARY ───────────────────────────────────────────────────────────────────
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Downloaded : $ok" -ForegroundColor Green
Write-Host "  Skipped    : $skip (already existed)" -ForegroundColor Yellow
Write-Host "  Failed     : $fail" -ForegroundColor Red
if ($failList.Count -gt 0) {
    Write-Host "`nFailed tracks:" -ForegroundColor Red
    $failList | ForEach-Object { Write-Host "  - $_" -ForegroundColor DarkRed }
}
Write-Host "==================================================" -ForegroundColor Cyan
