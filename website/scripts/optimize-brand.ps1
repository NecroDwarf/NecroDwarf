# Optional Windows asset preparation. Resize only; retain the supplied artwork,
# colours and alpha. Originals live outside the published public folder.
Add-Type -AssemblyName System.Drawing
$brandRoot = Join-Path $PSScriptRoot '../brand-source'
$outputRoot = Join-Path $PSScriptRoot '../public/brand'
foreach ($asset in @(@{ Name = 'full'; Size = 768 }, @{ Name = 'mark'; Size = 96 })) {
    $inputFile = Join-Path $brandRoot "necrodwarf-$($asset.Name)-transparent.png"
    $outputFile = Join-Path $outputRoot "necrodwarf-$($asset.Name).png"
    $source = [System.Drawing.Image]::FromFile($inputFile)
    $bitmap = [System.Drawing.Bitmap]::new($asset.Size, $asset.Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($source, 0, 0, $asset.Size, $asset.Size)
        $bitmap.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
        $source.Dispose()
    }
}
