const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPng(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(2, 9); // color type 2 (RGB)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: filter byte (0) + width * 3 bytes per scanline
  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const offset = y * scanlineLength;
    rawData[offset] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const pxOffset = offset + 1 + x * 3;
      // Draw a subtle border and golden center for KinScribe
      const isBorder = (x < 10 || x >= width - 10 || y < 10 || y >= height - 10);
      const isCenterBox = (x > width * 0.25 && x < width * 0.75 && y > height * 0.35 && y < height * 0.65);
      
      if (isBorder) {
        rawData[pxOffset] = 180;     // Amber R
        rawData[pxOffset + 1] = 83;  // Amber G
        rawData[pxOffset + 2] = 9;   // Amber B
      } else if (isCenterBox) {
        rawData[pxOffset] = 245;     // Gold R
        rawData[pxOffset + 1] = 158; // Gold G
        rawData[pxOffset + 2] = 11;  // Gold B
      } else {
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcBuffer = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcBuffer);
  chunk.writeUInt32BE(crc, 8 + length);

  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write 192x192, 512x512, maskable 512x512, apple-touch-icon
const darkBg = [28, 25, 23]; // #1C1917
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPng(192, 192, ...darkBg));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPng(512, 512, ...darkBg));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), createPng(512, 512, ...darkBg));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, ...darkBg));

console.log('PNG icons created successfully in /public');
