export class Progress extends EventTarget {
    constructor(imagedata) {
        super()
        this.max = (imagedata.data.length / 4) * 2 + 2
        this.current = 0

        this.throttled_update = throttle( value => {
            this.force_update(value)
        }, 100)
    }

    force_update(value) {
        if (this.done) return

        let evt = new CustomEvent("update", { detail: value })
        this.dispatchEvent(evt)
        if (value === this.max) {
            this.done = true
            evt = new CustomEvent("done")
            this.dispatchEvent(evt)
        }
    }

    update(value) {
        this.current = value
        this.throttled_update(value)
    }
}

function throttle(func, delay) {
    let lastCall = 0

    return function(...args) {
        let now = Date.now()

        if (now - lastCall >= delay) {
            lastCall = now
            return func.apply(this, args)
        }
    }
}

// Mostly from https://github.com/gazs/canvas-atkinson-dither
export function dithering(imagedata, progress) {
    let progress_counter = 0

    let threshold = i => (i <= 128) ? 0 : 255

    let luminance = function(imagedata) {
        var i, j, pixels, ref;
        pixels = imagedata.data;
        for (i = j = 0, ref = pixels.length; j <= ref; i = j += 4) {
            // luminance: red x 0.3 + green x 0.59 + blue x 0.11
            pixels[i] = pixels[i + 1] = pixels[i + 2] = parseInt(pixels[i] * 0.3 + pixels[i + 1] * 0.59 + pixels[i + 2] * 0.11, 10);
            if (progress) progress.update(++progress_counter)
        }
        return imagedata;
    }

    let step2 = function(imagedata) {
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
            if (progress) progress.update(++progress_counter)
        }

        if (progress) progress.force_update(progress_counter)
        return imagedata;
    }

    return step2(luminance(imagedata))
}
