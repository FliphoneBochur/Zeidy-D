#!/bin/bash

# Collect all PDFs into a flat folder on desktop with order preserved

DESKTOP_FOLDER="$HOME/Desktop/Zeidy-D-PDFs"
SOURCE_FOLDER="./Files"
COUNTER=1

echo "🔍 Collecting all PDFs from $SOURCE_FOLDER"
echo "📁 Destination: $DESKTOP_FOLDER"

# Clear destination folder
rm -rf "$DESKTOP_FOLDER"
mkdir -p "$DESKTOP_FOLDER"

# Create temporary file list to avoid subshell counter issue
TEMP_LIST=$(mktemp)
find "$SOURCE_FOLDER" -name "*.pdf" -type f | sort > "$TEMP_LIST"

# Process each PDF file
while IFS= read -r pdf_path; do
    # Extract components from path
    relative_path=${pdf_path#$SOURCE_FOLDER/}
    
    # Get just the filename without path
    filename=$(basename "$pdf_path")
    
    # Get the directory structure for context
    dir_path=$(dirname "$relative_path")
    
    # Create a clean identifier from the path
    clean_path=$(echo "$dir_path" | sed 's/[0-9][0-9]* - //g' | sed 's/\//_/g' | sed 's/ /_/g')
    
    # Create new filename with counter and context
    file_extension="${filename##*.}"
    file_base="${filename%.*}"
    
    # Format counter with leading zeros (3 digits)
    counter_formatted=$(printf "%03d" $COUNTER)
    
    # New filename: 001_Devarim_Ki_Seitzei_5785.pdf
    new_filename="${counter_formatted}_${clean_path}_${file_base}.${file_extension}"
    
    # Copy file with new name
    cp "$pdf_path" "$DESKTOP_FOLDER/$new_filename"
    
    echo "📄 $COUNTER: $relative_path → $new_filename"
    
    ((COUNTER++))
done < "$TEMP_LIST"

# Clean up temp file
rm "$TEMP_LIST"

echo ""
echo "✅ Collection complete!"
echo "📊 Total PDFs collected: $((COUNTER - 1))"
echo "📁 Location: $DESKTOP_FOLDER"
echo ""
echo "To open the folder:"
echo "open '$DESKTOP_FOLDER'"
