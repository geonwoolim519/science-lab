Add-Type -AssemblyName System.Drawing

function New-LabIcon {
  param(
    [int]$Size,
    [string]$Path,
    [double]$Scale = 0.62
  )
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::FromArgb(255, 16, 33, 30))

  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 31, 168, 154)), ([single]([Math]::Max(2, $Size * 0.016)))
  $inset = $Size * 0.175
  $g.DrawEllipse($pen, $inset, $inset, $Size - (2 * $inset), $Size - (2 * $inset))

  $fontSize = [single]($Size * $Scale)
  $font = New-Object System.Drawing.Font 'Arial Black', $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  if ($font.FontFamily.Name -ne 'Arial Black') {
    $font.Dispose()
    $font = New-Object System.Drawing.Font 'Arial', $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  }
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 246, 243, 234))
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF 0, ($Size * -0.035), $Size, $Size
  $g.DrawString('S', $font, $brush, $rect, $sf)

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $sf.Dispose()
  $brush.Dispose()
  $font.Dispose()
  $pen.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
New-LabIcon -Size 512 -Path (Join-Path $public 'icon-512.png') -Scale 0.68
New-LabIcon -Size 512 -Path (Join-Path $public 'icon-512-maskable.png') -Scale 0.52
New-LabIcon -Size 192 -Path (Join-Path $public 'icon-192.png') -Scale 0.68
New-LabIcon -Size 180 -Path (Join-Path $public 'apple-touch-icon.png') -Scale 0.68
Write-Output 'icons written'
