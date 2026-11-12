import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const context=vm.createContext({});vm.runInContext(fs.readFileSync('assets/vendor/qrcode.js','utf8'),context);
// Fixed disposable fixture, never a real room invitation.
const url='https://contact-kaaete.github.io/kart-go-jaylenn/multiplayer/?room=TEST2345#key=ABCDEFGHJKLMNPQR';
const qr=context.qrcode(0,'Q');qr.addData(url);qr.make();const svg=qr.createSvgTag({cellSize:5,margin:24,scalable:true});assert.ok(svg.startsWith('<svg'));fs.mkdirSync('.qa',{recursive:true});fs.writeFileSync('.qa/qr-test.svg',svg);fs.writeFileSync('.qa/qr-expected.txt',url);console.log('QR generated with error correction Q and 24px quiet margin. Decode check runs separately.');
