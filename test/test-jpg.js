
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

import {PNG} from 'pngjs';
import {decode as decodeJpeg, encode as encodeJpeg} from 'jpeg-js';
import match from '../index.js';

const options = {threshold: 0.05};
const JPEG_QUALITY = 100;

diffTest('1a', '1b', '1diff', options, 342);

function diffTest(imgPath1, imgPath2, diffPath, options, expectedMismatch) {
    const name = `comparing ${imgPath1} to ${imgPath2}, ${JSON.stringify(options)}`;

    test(name, () => {
        const img1 = readImage(imgPath1);
        const img2 = readImage(imgPath2);
        const {width, height} = img1;
        const diff = new PNG({width, height});

        const mismatch = match(img1.data, img2.data, diff.data, width, height, options);
        const mismatch2 = match(img1.data, img2.data, null, width, height, options);

        console.log('mismatch:', mismatch);
        console.log('mismatch2:', mismatch2);
        console.log('expectedMismatch:', expectedMismatch);

        if (process.env.UPDATE) {
            writeImage(diffPath, diff);
        } else {
            const expectedDiff = readImage(diffPath);
            const dataDiff = new PNG({
                width: expectedDiff.width,
                height: expectedDiff.height,
            });
            const dataMismatch = match(
                diff.data,
                expectedDiff.data,
                dataDiff.data,
                expectedDiff.width,
                expectedDiff.height,
                options
            );
            assert.equal(dataMismatch, 0, 'diff image');
        }
        assert.equal(mismatch, expectedMismatch, 'number of mismatched pixels');
        assert.equal(mismatch, mismatch2, 'number of mismatched pixels without diff');
    });
}

function readImage(name) {
    return decodeJpeg(fs.readFileSync(new URL(`fixtures/${name}.jpg`, import.meta.url)), JPEG_QUALITY);
}
function writeImage(name, image) {
    fs.writeFileSync(
        new URL(`fixtures/${name}.jpg`, import.meta.url),
        encodeJpeg(image, JPEG_QUALITY).data
    );
}
