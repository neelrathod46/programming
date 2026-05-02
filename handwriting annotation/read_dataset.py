import os




####################################################################
# Point this to the folder where you extracted the images
dataset_dir = "E:/Data Labelling/"
####################################################################






print(f"Scanning directory: {dataset_dir}\n")

if not os.path.exists(dataset_dir):
    print(f"Error: Could not find the folder '{dataset_dir}'. Make sure the folder path is correct.")
else:
    # Get a sorted list of all the items in the main directory
    # E:/Data Labelling
    text_folders = [item for item in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, item))]
    for text_folder in text_folders:

        text_path = os.path.join(dataset_dir, text_folder)

        # E:/Data Labelling/1
        if os.path.isdir(text_path):
            print(f"Text No. {text_folder}")
            
            session = os.listdir(text_path)
            print(f"   {session[0]}")
            # if there are files and not just folders inside E:/Data Labelling/1 replace with below code
            # it will skip any files and only add folders to session list.
            # session = [item for item in os.listdir(text_path) if os.path.isdir(os.path.join(text_path, item))]
            # print(f"    {session[0]}")
            
            # E:/Data Labelling/1/session_187258125
            char_dir_folder_path = os.path.join(text_path, session[0])
            for char_dir in os.listdir(char_dir_folder_path):
                # E:/Data Labelling/1/session_192851928/[characters, characters_binary]
                char_dir_path = os.path.join(char_dir_folder_path, char_dir)
                print(f"\n....{char_dir}")
                #open character folder like a,b
                # characters/a_lower
                for char in os.listdir(char_dir_path):
                    print(f"    Char: {char}")
                    images = os.listdir(os.path.join(char_dir_path,char))
                    if not images:
                        print("   (Empty folder)")
                    else:
                        # Sort the images so they print in a neat, predictable order
                        for img in images:
                            print(f"        {img}")

                    # Add a blank line between folders for readability
                    print("")
