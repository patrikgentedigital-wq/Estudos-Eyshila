import re

def clean_data_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove titleEn, titleEn, etc. (single line)
    content = re.sub(r'\s*\w+En: ".*",?\n', '\n', content)
    
    # Remove optionsEn: [ ... ] blocks
    content = re.sub(r'\s*optionsEn: \[[^\]]*\],?\n', '\n', content)
    
    # Remove any stray strings that look like they belonged to optionsEn
    # This happens if sed removed the starting line but not the content
    # Look for [ followed by strings and a ] that doesn't have a key
    content = re.sub(r'\n\s*"\w+.*",?\n', '\n', content) # This might be too aggressive if it hits other strings
    
    # Let's try to be more precise: find arrays that don't have a key name
    content = re.sub(r'(\n\s*)("[^"]*",?\n\s*)+(\],?\n)', r'\1\3', content)

    # Actually, the sed command left orphaned lines that look like:
    # 1257:       "Sterile distilled water, typically between 10 mL and 15 mL.",
    # ...
    # 1261:     ],
    
    # Let's target these specifically: lines starting with whitespace and a quote, or just whitespace and a closing bracket
    # that are not followed by a key
    
    lines = content.split('\n')
    new_lines = []
    skip_mode = False
    
    for line in lines:
        # If we see a line that is just a closing bracket followed by a comma (or not) 
        # and it's not preceded by an opening bracket on the same line, and it's not part of a valid key
        # this is tricky.
        pass

    # A better way: my sed command already removed the key.
    # So we have lines like:
    #       "String...",
    #       "String..."
    #     ],
    
    # I will look for these blocks and remove them.
    content = re.sub(r'(\n\s*("[^"]*",?\n\s*)+(\],?\n))', '\n', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    clean_data_file('src/data.ts')
