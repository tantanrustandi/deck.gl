import test from 'tape-catch';
import {createGLContext} from 'luma.gl';
import {Effect, EffectManager} from 'deck.gl/experimental/lib';
import {LayerManager} from 'deck.gl/lib';

const gl = createGLContext();
const layerManager = new LayerManager({gl});

test('EffectManager#constructor', t => {
  const effectManager = new EffectManager({gl, layerManager});
  t.ok(effectManager, 'Effect Manager created');
  t.end();
});

test('EffectManager#add and remove effects', t => {
  const effectManager = new EffectManager({gl, layerManager});
  const effect = new Effect();
  effectManager.addEffect(effect);
  t.ok(effectManager.removeEffect(effect), 'Effect added and removed successfully');
  t.end();
});
