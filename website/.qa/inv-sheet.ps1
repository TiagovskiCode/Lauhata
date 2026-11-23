param([string]$Pattern = "DJI_08*.jpg", [string]$Out = "C:\Users\tiago\Desktop\Lauhata\website\.qa\inv\_sheet.png", [int]$Cols = 3)
Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\tiago\Desktop\Lauhata\website\.qa\inv"
$files = Get-ChildItem $dir -Filter $Pattern | Where-Object { $_.Name -notlike "_*" } | Sort-Object Name
$tw = 480; $th = 270; $pad = 8; $lab = 26
$rows = [math]::Ceiling($files.Count / $Cols)
$bmp = New-Object System.Drawing.Bitmap(($Cols * ($tw + $pad) + $pad), ($rows * ($th + $lab + $pad) + $pad))
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$i = 0
foreach ($f in $files) {
  $img = [System.Drawing.Image]::FromFile($f.FullName)
  $x = $pad + ($i % $Cols) * ($tw + $pad); $y = $pad + [math]::Floor($i / $Cols) * ($th + $lab + $pad)
  $g.DrawString($f.BaseName, $font, [System.Drawing.Brushes]::Black, $x, $y)
  $g.DrawImage($img, $x, $y + $lab, $tw, $th)
  $img.Dispose(); $i++
}
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
"sheet: $($files.Count) images"
