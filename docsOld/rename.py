import os

def rename_files(target_directory):
    # Change the working directory to the target folder
    try:
        os.chdir(target_directory)
    except FileNotFoundError:
        print("Error: The directory was not found.")
        return

    # List files and filter for images (optional: add more extensions if needed)
    extensions = ('.jpg', '.jpeg', '.png', '.bmp')
    files = [f for f in os.listdir() if f.lower().endswith(extensions)]
    
    # Sort files to ensure they follow a logical order (e.g., by date or name)
    files.sort()

    for index, filename in enumerate(files, start=1):
        # Create the new name
        new_name = f"{index}.jpg"
        
        # Perform the rename
        try:
            os.rename(filename, new_name)
            print(f"Renamed: {filename} -> {new_name}")
        except Exception as e:
            print(f"Could not rename {filename}: {e}")

# Usage: Replace the path below with your folder path
# Example: "C:/Users/Name/Pictures" or "/Users/Name/Pictures"
rename_files("/Users/ravindra/workspace/GitHub/images/D77")

# Usage to download files from smitsfilatly
# wget -nd -r -l 1 -A jpg,jpeg,png,gif https://www.filatelie.net/images/kavels/36200%20kavels/36202/