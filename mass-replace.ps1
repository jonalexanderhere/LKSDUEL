
$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $newContent = $content
    $newContent = $newContent -replace "bg-white dark:bg-gray-900", "bg-[#fdf6e3] dark:bg-[#1f140f] border-double border-4 border-amber-900/70"
    $newContent = $newContent -replace "bg-white dark:bg-gray-950", "bg-[#fdf6e3] dark:bg-[#1f140f] border-double border-4 border-amber-900/70"
    $newContent = $newContent -replace "bg-white", "bg-[#fdf6e3]"
    $newContent = $newContent -replace "dark:bg-gray-900", "dark:bg-[#1f140f]"
    $newContent = $newContent -replace "dark:bg-gray-950", "dark:bg-[#110A08]"
    $newContent = $newContent -replace "dark:bg-gray-800", "dark:bg-[#1A100C]"
    $newContent = $newContent -replace "bg-gray-50", "bg-[#f4e4bc]"
    $newContent = $newContent -replace "bg-gray-100", "bg-[#eaddb6]"
    $newContent = $newContent -replace "rounded-xl", "rounded-sm border-double border-4 border-amber-900/70"
    $newContent = $newContent -replace "rounded-2xl", "rounded-sm border-double border-4 border-amber-900/70"
    $newContent = $newContent -replace "rounded-lg", "rounded-sm"
    $newContent = $newContent -replace "rounded-3xl", "rounded-sm border-double border-4 border-amber-900/70"
    $newContent = $newContent -replace "border-gray-200", "border-amber-900/50"
    $newContent = $newContent -replace "border-gray-100", "border-amber-900/30"
    $newContent = $newContent -replace "border-gray-800", "border-amber-700/50"
    $newContent = $newContent -replace "text-blue-500", "text-amber-600 dark:text-amber-500"
    $newContent = $newContent -replace "text-blue-600", "text-amber-700 dark:text-amber-500"
    $newContent = $newContent -replace "bg-blue-500", "bg-amber-600 dark:bg-amber-700"
    $newContent = $newContent -replace "bg-blue-600", "bg-amber-700 dark:bg-amber-800"
    $newContent = $newContent -replace "shadow-sm", "shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
    $newContent = $newContent -replace "shadow-md", "shadow-[0_6px_16px_rgba(0,0,0,0.8)]"
    if ($content -ne $newContent) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
    }
}

