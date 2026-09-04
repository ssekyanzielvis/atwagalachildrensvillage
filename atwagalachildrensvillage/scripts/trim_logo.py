from PIL import Image

source = 'icon.jpeg'
logo_out = 'public/logo.png'
icon_out = 'public/icon.png'

img = Image.open(source).convert('RGBA')
width, height = img.size
pixels = img.load()
clean = Image.new('RGBA', (width, height), (0, 0, 0, 0))
clean_pixels = clean.load()

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if r > 245 and g > 245 and b > 245:
            clean_pixels[x, y] = (0, 0, 0, 0)
        else:
            clean_pixels[x, y] = (r, g, b, a)

box = clean.getbbox()
if box:
    cropped = clean.crop(box)
    cropped.save(logo_out)
    cropped.save(icon_out)
    print(f'Created transparent logo: {cropped.size}')
else:
    print('No non-transparent pixels found; saved original image as fallback.')
    img.save(logo_out)
    img.save(icon_out)
