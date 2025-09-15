# AI Website Builder - Project Cleanup Script
# This script removes redundant files and optimizes the project for hackathon demo

Write-Host "🧹 AI Website Builder - Project Cleanup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$rootPath = Get-Location
Write-Host "Working in: $rootPath" -ForegroundColor Green

# Function to safely remove files/folders
function Remove-SafelyIfExists {
    param([string]$Path)
    if (Test-Path $Path) {
        try {
            Remove-Item $Path -Recurse -Force
            Write-Host "✅ Removed: $Path" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to remove: $Path - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚪ Not found: $Path" -ForegroundColor Gray
    }
}

# Function to backup important files before cleanup
function Backup-Files {
    Write-Host "📦 Creating backup..." -ForegroundColor Yellow
    $backupPath = "backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    
    # Backup potentially useful code from enhanced versions
    if (Test-Path "apps\web\app\builder\enhanced\page.tsx") {
        Copy-Item "apps\web\app\builder\enhanced\page.tsx" "$backupPath\enhanced-page-backup.tsx" -Force
    }
    if (Test-Path "apps\web\app\components\builder\EnhancedDragDrop.tsx") {
        Copy-Item "apps\web\app\components\builder\EnhancedDragDrop.tsx" "$backupPath\enhanced-dragdrop-backup.tsx" -Force
    }
    Write-Host "✅ Backup created in: $backupPath" -ForegroundColor Green
}

Write-Host "`n🗑️  Phase 1: Removing Large/Redundant Files" -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Yellow

# Remove Node.js version folders (these are huge and not needed in repo)
Remove-SafelyIfExists "v20.18.3"
Remove-SafelyIfExists "v22.19.0"

# Remove build/cache directories
Remove-SafelyIfExists ".next"
Remove-SafelyIfExists "node_modules"
Remove-SafelyIfExists "apps\web\.next"
Remove-SafelyIfExists "apps\web\node_modules"
Remove-SafelyIfExists "apps\docs\.next"
Remove-SafelyIfExists "apps\docs\node_modules"
Remove-SafelyIfExists "packages\*\node_modules"
Remove-SafelyIfExists "packages\*\dist"

# Remove documentation app (not needed for demo)
Remove-SafelyIfExists "apps\docs"

Write-Host "`n🔄 Phase 2: Backing Up and Removing Duplicates" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow

# Create backup before removing duplicates
Backup-Files

# Remove duplicate/enhanced implementations
Remove-SafelyIfExists "apps\web\app\builder\enhanced"
Remove-SafelyIfExists "apps\web\app\components\builder\EnhancedDragDrop.tsx"

# Remove duplicate hooks (keep the main one)
if (Test-Path "apps\web\hooks\useKeyboardShortcuts.ts" -and Test-Path "apps\web\hooks\use-keyboard-shortcuts.ts") {
    Remove-SafelyIfExists "apps\web\hooks\useKeyboardShortcuts.ts"
    Write-Host "✅ Kept: use-keyboard-shortcuts.ts (removed duplicate)" -ForegroundColor Green
}

# Remove redundant files that were found in the analysis
$redundantFiles = @(
    "npm-global-packages-backup.txt",
    "push-to-github.ps1",
    "setup-github.ps1"
)

foreach ($file in $redundantFiles) {
    Remove-SafelyIfExists $file
}

Write-Host "`n📋 Phase 3: Analyzing Dependencies" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

# Check for unused dependencies (manual review needed)
Write-Host "🔍 Checking package.json files for potential cleanup..." -ForegroundColor Cyan

$packageJsonFiles = Get-ChildItem -Recurse -Name "package.json" -Exclude node_modules
foreach ($pkgFile in $packageJsonFiles) {
    Write-Host "📄 Found: $pkgFile" -ForegroundColor Blue
}

Write-Host "`n📊 Phase 4: Project Size Analysis" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

function Get-FolderSize {
    param([string]$Path)
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse -File | Measure-Object Length -Sum).Sum
        return [math]::Round($size / 1MB, 2)
    }
    return 0
}

$criticalFolders = @(
    @{Name="apps\web\app"; Description="Main application code"},
    @{Name="apps\web\lib"; Description="Core libraries & services"},
    @{Name="packages"; Description="Shared packages"},
    @{Name="apps\web\app\components\builder"; Description="Builder components"}
)

Write-Host "Current project structure sizes:" -ForegroundColor Cyan
foreach ($folder in $criticalFolders) {
    $size = Get-FolderSize $folder.Name
    if ($size -gt 0) {
        Write-Host "  $($folder.Name): $($size)MB - $($folder.Description)" -ForegroundColor Green
    }
}

Write-Host "`n🎯 Phase 5: Demo Optimization Recommendations" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

Write-Host "Critical files for demo (keep these):" -ForegroundColor Green
$criticalFiles = @(
    "apps\web\app\builder\page.tsx - Main builder interface",
    "apps\web\app\components\builder\BuilderCanvas.tsx - Drag-drop canvas",
    "apps\web\app\components\builder\ComponentPalette.tsx - Component library",
    "apps\web\lib\store\builder.ts - State management",
    "apps\web\app\page.tsx - Landing page"
)

foreach ($file in $criticalFiles) {
    $filePath = $file.Split(" - ")[0]
    if (Test-Path $filePath) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file" -ForegroundColor Red
    }
}

Write-Host "`n📋 Summary & Next Steps" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

Write-Host "✅ Cleanup completed! Space saved and duplicates removed." -ForegroundColor Green
Write-Host "📦 Backup created with any potentially useful code." -ForegroundColor Blue

Write-Host "`nNext steps for demo preparation:" -ForegroundColor Yellow
Write-Host "1. Run 'npm install' to reinstall dependencies" -ForegroundColor White
Write-Host "2. Test the main builder interface: npm run dev" -ForegroundColor White
Write-Host "3. Focus on completing core features:" -ForegroundColor White
Write-Host "   - AI chat assistant UI" -ForegroundColor Gray
Write-Host "   - Code export functionality" -ForegroundColor Gray
Write-Host "   - Basic deployment integration" -ForegroundColor Gray
Write-Host "4. Create demo content and test critical user flows" -ForegroundColor White

Write-Host "`n📈 Demo Success Metrics:" -ForegroundColor Magenta
Write-Host "- Smooth drag-and-drop component placement" -ForegroundColor White
Write-Host "- AI generates components from text prompts" -ForegroundColor White
Write-Host "- Export downloads working React project" -ForegroundColor White
Write-Host "- Professional UI that impresses judges" -ForegroundColor White

Write-Host "`n🎉 Project is now optimized for hackathon demo!" -ForegroundColor Green