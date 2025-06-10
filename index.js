// https://github.com/gazs/canvas-atkinson-dither
export default function(imagedata) {
    let threshold = i => (i <= 128) ? 0 : 255

    let luminance = function(imagedata) {
        var i, j, pixels, ref;
        pixels = imagedata.data;
        for (i = j = 0, ref = pixels.length; j <= ref; i = j += 4) {
            // luminance: red x 0.3 + green x 0.59 + blue x 0.11
            pixels[i] = pixels[i + 1] = pixels[i + 2] = parseInt(pixels[i] * 0.3 + pixels[i + 1] * 0.59 + pixels[i + 2] * 0.11, 10);
        }
        return imagedata;
    }

    let dither = function(imagedata) {
        var err, i, j, mono, neighbours, one, pixels, ref, w;
        pixels = imagedata.data;
        w = imagedata.width;
        for (i = j = 0, ref = pixels.length; j <= ref; i = j += 4) {
            neighbours = [i + 4, i + 8, i + (4 * w) - 4, i + (4 * w), i + (4 * w) + 4, i + (8 * w)];
            mono = threshold(pixels[i]);
            err = parseInt((pixels[i] - mono) / 8, 10);
            pixels[i] = mono;
            for (one in neighbours) {
                pixels[neighbours[one]] += err;
            }
            pixels[i + 1] = pixels[i + 2] = pixels[i];
        }
        return imagedata;
    }

    return dither(luminance(imagedata))
}
