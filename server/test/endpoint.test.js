import test from 'node:test';
import assert from 'node:assert/strict';
import { endpointProblem, modelProblem } from '../../src/lib/endpoint.js';

test('endpointProblem menerima alamat https publik', () => {
  assert.equal(endpointProblem('https://apihub.agnes-ai.com/v1'), '');
  assert.equal(endpointProblem('  https://contoh.example.com/v1  '), '');
  assert.equal(endpointProblem(''), '');
});

test('endpointProblem menolak http, alamat lokal, dan alamat dengan query', () => {
  assert.match(endpointProblem('http://contoh.example.com/v1'), /https/);
  assert.match(endpointProblem('https://localhost:1234/v1'), /privat/);
  assert.match(endpointProblem('https://127.0.0.1/v1'), /privat/);
  assert.match(endpointProblem('https://192.168.1.5/v1'), /privat/);
  assert.match(endpointProblem('https://server.internal/v1'), /privat/);
  assert.match(endpointProblem('https://contoh.example.com/v1?x=1'), /tanda tanya/);
  assert.match(endpointProblem('https://contoh.example.com/v1#bagian'), /tanda pagar/);
  assert.match(endpointProblem('ftp://contoh.example.com/v1'), /https/);
});

test('modelProblem menjaga nama model tetap aman dipakai di URL dan JSON', () => {
  assert.equal(modelProblem('agnes-2.5-flash'), '');
  assert.equal(modelProblem('vendor/model:beta'), '');
  assert.equal(modelProblem(''), '');
  assert.match(modelProblem('model dengan spasi'), /huruf, angka/);
  assert.match(modelProblem('model<script>'), /huruf, angka/);
  assert.match(modelProblem('a'.repeat(121)), /terlalu panjang/);
});
