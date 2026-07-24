import re

def clean_data_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(r'\s*\w+En: ".*",?\n', '\n', content)
    content = re.sub(r'\s*optionsEn: \[[^\]]*\],?\n', '\n', content)
    content = re.sub(r'\n\s*"\w+.*",?\n', '\n', content)
    content = re.sub(r'(\n\s*)("[^"]*",?\n\s*)+(\],?\n)', r'\1\3', content)
    content = re.sub(r'(\n\s*("[^"]*",?\n\s*)+(\],?\n))', '\n', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    clean_data_file('src/data.ts')
