from PIL import Image, ImageDraw
import math

def create_loading_animation():
    # Create frames for the loading animation
    frames = []
    size = 50
    for i in range(8):  # 8 frames for rotation
        # Create new image with transparent background
        image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        
        # Calculate rotation angle
        angle = i * 45  # 45 degrees per frame
        
        # Draw arc
        bbox = [5, 5, size-5, size-5]  # Bounding box for arc
        start = angle
        end = angle + 300  # Leave a 60-degree gap
        
        # Draw the arc
        draw.arc(bbox, start, end, fill=(26, 188, 156, 255), width=3)
        
        frames.append(image)
    
    # Save as animated GIF
    frames[0].save(
        'loading.gif',
        save_all=True,
        append_images=frames[1:],
        duration=100,  # 100ms per frame
        loop=0
    )

if __name__ == "__main__":
    create_loading_animation() 