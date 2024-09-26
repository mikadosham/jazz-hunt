import json

# Step 1: Read the data from the text file
with open('Real book data - all.txt', 'r') as file:
    lines = file.readlines()

# Step 2: Parse the data into a structured format, skipping the header line
tunes = []
for line in lines[1:]:  # Skip the first line, which is likely the header
    parts = line.strip().split(',')
    if len(parts) == 9:
        title, page, num_pages, volume, edition, c, bass, bb, eb = parts
        try:
            tune = {
                "title": title.strip(),
                "page": int(page.strip()),
                "num_pages": int(num_pages.strip()),
                "volume": int(volume.strip()),
                "edition": int(edition.strip()),
                "c": c.strip().lower(),
                "bass": bass.strip().lower(),
                "bb": bb.strip().lower(),
                "eb": eb.strip().lower(),
            }
            tunes.append(tune)
        except ValueError as e:
            print(f"Skipping line due to error: {e}")
            continue

# Step 3: Convert the structured data into JSON format
json_data = json.dumps(tunes, indent=4)

# Step 4: Save the JSON data to a new file in the same directory
with open('Real_book_data.json', 'w') as json_file:
    json_file.write(json_data)

print("Data successfully converted to JSON format!")
